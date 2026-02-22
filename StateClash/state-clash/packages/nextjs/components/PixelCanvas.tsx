"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import targetImage from "~~/utils/targetImage.json";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useWriteContract, useAccount, usePublicClient, useWatchContractEvent } from "wagmi";

const GRID_SIZE = 50;

// Color palette — earthy tones
const INDEX_TO_COLOR: Record<number, string> = {
    0: "#3a332c",
    1: "#b0814f",
    2: "#b0594f",
    3: "#618c9e",
    4: "#4e707e",
    5: "#c09a72",
    6: "#8d473f",
    7: "#998066",
    8: "#81a3b1",
    9: "#90806f",
};

const HEX_TO_INDEX: Record<string, number> = {
    "#b0814f": 1,
    "#b0594f": 2,
    "#618c9e": 3,
    "#4e707e": 4,
    "#c09a72": 5,
    "#8d473f": 6,
    "#998066": 7,
    "#81a3b1": 8,
    "#90806f": 9,
};

export type TxStage = "pending" | "confirmed" | "parallel" | "collision" | "failed";

export type TxItem = {
    id: number;
    pixelId: number;
    stage: TxStage;
    color: string;
    timestamp: number;
    painter?: string;
};

type PixelCanvasProps = {
    collisionPixels: Set<number>;
    onCollision: (pixelId: number) => void;
    onCleanTx: () => void;
    onCollisionTx: () => void;
    onTxStageChange: (tx: TxItem) => void;
};

export default function PixelCanvas({
    collisionPixels,
    onCollision,
    onCleanTx,
    onCollisionTx,
    onTxStageChange,
}: PixelCanvasProps) {
    const [pixelColors, setPixelColors] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const { data: contractInfo } = useDeployedContractInfo("Canvas");
    const { writeContractAsync } = useWriteContract();
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const canvasRef = useRef<HTMLDivElement>(null);
    const txIdCounter = useRef(0);
    // Track pending tx ids by "pixelId-painter" to attach incoming on-chain events to the same visual pipeline item
    const pendingTxsRef = useRef<Map<string, number>>(new Map());
    // Simple lock — checked synchronously before any async work
    const lockRef = useRef(false);

    // ─── Load recent canvas state from chain on mount ───
    useEffect(() => {
        if (!contractInfo?.address || !publicClient) return;

        const loadCanvasState = async () => {
            try {
                setIsLoading(true);
                const currentBlock = await publicClient.getBlockNumber();
                const fromBlock = currentBlock > 100n ? currentBlock - 100n : 0n;

                const logs = await publicClient.getLogs({
                    address: contractInfo.address,
                    event: {
                        type: "event",
                        name: "PixelUpdated",
                        inputs: [
                            { type: "uint256", name: "pixelId", indexed: true },
                            { type: "address", name: "painter", indexed: true },
                            { type: "uint8", name: "color", indexed: false },
                        ],
                    },
                    fromBlock,
                    toBlock: currentBlock,
                });

                const colors: Record<number, string> = {};
                for (const log of logs) {
                    const pixelId = Number(log.args.pixelId);
                    const colorIdx = Number(log.args.color);
                    colors[pixelId] = INDEX_TO_COLOR[colorIdx] || "#3a332c";
                }

                setPixelColors(colors);
                setLoadedCount(Object.keys(colors).length);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load canvas state:", err);
                setIsLoading(false);
            }
        };

        loadCanvasState();
    }, [contractInfo?.address, publicClient]);

    // ─── Listen for PixelUpdated events via WebSocket ───
    useWatchContractEvent({
        address: contractInfo?.address,
        abi: contractInfo?.abi,
        eventName: "PixelUpdated",
        onLogs: (logs) => {
            logs.forEach((log: any) => {
                const pixelId = Number(log.args?.pixelId ?? 0);
                const colorIdx = Number(log.args?.color ?? 0);
                const painter = log.args?.painter;

                const color = INDEX_TO_COLOR[colorIdx] || "#3a332c";
                setPixelColors(prev => ({ ...prev, [pixelId]: color }));
                onCleanTx();

                // Map to pipeline — use lowercase for robust matching
                const key = `${pixelId}-${painter?.toLowerCase()}`;
                const txId = pendingTxsRef.current.get(key) ?? txIdCounter.current++;
                onTxStageChange({
                    id: txId,
                    pixelId,
                    stage: "parallel",
                    color,
                    timestamp: Date.now(),
                    painter
                });
                if (pendingTxsRef.current.has(key)) pendingTxsRef.current.delete(key);
            });
        },
        enabled: !!contractInfo?.address && !isLoading,
    });

    // ─── Listen for StateCollision events via WebSocket ───
    useWatchContractEvent({
        address: contractInfo?.address,
        abi: contractInfo?.abi,
        eventName: "StateCollision",
        onLogs: (logs) => {
            logs.forEach((log: any) => {
                const pixelId = Number(log.args?.pixelId ?? 0);
                const painter = log.args?.painter;

                onCollision(pixelId);
                onCollisionTx();

                // Map to pipeline — use lowercase for robust matching
                const key = `${pixelId}-${painter?.toLowerCase()}`;
                const txId = pendingTxsRef.current.get(key) ?? txIdCounter.current++;
                onTxStageChange({
                    id: txId,
                    pixelId,
                    stage: "collision",
                    color: "#b0594f", // collision red
                    timestamp: Date.now(),
                    painter
                });
                if (pendingTxsRef.current.has(key)) pendingTxsRef.current.delete(key);
            });
        },
        enabled: !!contractInfo?.address && !isLoading,
    });

    // ─── Click handler with proper lock ───
    const handlePixelClick = useCallback(
        async (x: number, y: number) => {
            if (!contractInfo?.address || !address) return;

            // Synchronous lock check — prevents double-click race
            if (lockRef.current) return;
            lockRef.current = true;
            setIsSending(true);

            const pixelId = x * GRID_SIZE + y;
            const key = `${x}${y}`;
            const targetColor = (targetImage as Record<string, string>)[key] || "#b0814f";
            const colorIndex = HEX_TO_INDEX[targetColor] || 1;

            // Optimistic UI — paint immediately
            setPixelColors(prev => ({ ...prev, [pixelId]: targetColor }));

            // Create tx pipeline item
            const txId = txIdCounter.current++;
            // Save the ID so the WebSocket event can find and update it
            pendingTxsRef.current.set(`${pixelId}-${address.toLowerCase()}`, txId);

            const txItem: TxItem = {
                id: txId,
                pixelId,
                stage: "pending",
                color: targetColor,
                timestamp: Date.now(),
                painter: address,
            };
            onTxStageChange(txItem);

            try {
                await writeContractAsync({
                    address: contractInfo.address,
                    abi: contractInfo.abi,
                    functionName: "drawPixel",
                    args: [BigInt(x), BigInt(y), colorIndex],
                });
                // Tx included in a block -> confirmed
                onTxStageChange({ ...txItem, stage: "confirmed", timestamp: Date.now() });
                // We leave the ID in pendingTxsRef. The WebSocket event will eventually arrive
                // and transition it from "confirmed" to "parallel" or "collision".
            } catch (err: any) {
                console.error("drawPixel tx failed:", err);
                // Revert optimistic color on failure
                setPixelColors(prev => {
                    const copy = { ...prev };
                    delete copy[pixelId];
                    return copy;
                });
                // Mark pipeline item as failed legitimately (not as a collision)
                onTxStageChange({ ...txItem, stage: "failed", timestamp: Date.now() });
                pendingTxsRef.current.delete(`${pixelId}-${address.toLowerCase()}`);
            } finally {
                // ALWAYS release the lock, no matter what
                lockRef.current = false;
                setIsSending(false);
            }
        },
        [contractInfo, writeContractAsync, address, onTxStageChange],
    );

    const getPixelColor = (pixelId: number): string => {
        if (collisionPixels.has(pixelId)) return "#b0594f";
        return pixelColors[pixelId] || "#1e2a2f";
    };

    return (
        <div className="canvas-wrapper">
            {isLoading && (
                <div className="canvas-loading">
                    Loading canvas from chain... ({loadedCount} pixels)
                </div>
            )}
            {isSending && (
                <div className="canvas-sending">
                    ⏳ Transaction pending — wait for confirmation before clicking again...
                </div>
            )}
            <div
                ref={canvasRef}
                className={`pixel-grid ${isSending ? "pixel-grid-disabled" : ""}`}
                role="grid"
                aria-label="50x50 pixel canvas"
            >
                {Array.from({ length: GRID_SIZE }, (_, x) =>
                    Array.from({ length: GRID_SIZE }, (_, y) => {
                        const pixelId = x * GRID_SIZE + y;
                        const color = getPixelColor(pixelId);
                        const isTarget = `${x}${y}` in (targetImage as Record<string, string>);
                        return (
                            <div
                                key={pixelId}
                                className={`pixel ${isTarget ? "pixel-target" : ""}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handlePixelClick(x, y)}
                                role="gridcell"
                                aria-label={`Pixel ${x},${y}`}
                            />
                        );
                    }),
                )}
            </div>
        </div>
    );
}
