"use client";

import { useEffect, useRef } from "react";
import type { TxItem } from "./PixelCanvas";

type TxPipelineProps = {
    transactions: TxItem[];
};

export default function TxPipeline({ transactions }: TxPipelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
    }, [transactions]);

    const recentTxs = transactions.slice(-12);

    return (
        <div className="tx-pipeline">
            <h3 className="pipeline-title">
                <span className="pipeline-icon">🔄</span>
                Transaction Pipeline
            </h3>
            <p className="pipeline-subtitle">Watch how Monad processes each pixel transaction in real-time</p>

            {/* Pipeline stages legend */}
            <div className="pipeline-legend">
                <div className="legend-item">
                    <div className="legend-dot legend-pending" />
                    <span>Pending</span>
                </div>
                <div className="legend-arrow">→</div>
                <div className="legend-item">
                    <div className="legend-dot legend-confirmed" />
                    <span>Confirmed</span>
                </div>
                <div className="legend-arrow">→</div>
                <div className="legend-item">
                    <div className="legend-dot legend-parallel" />
                    <span>Parallel ⚡</span>
                </div>
                <div className="legend-arrow">or</div>
                <div className="legend-item">
                    <div className="legend-dot legend-collision" />
                    <span>Collision 🔴</span>
                </div>
                <div className="legend-arrow">or</div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#7a6752" }} />
                    <span>Failed ❌</span>
                </div>
            </div>

            {/* Pipeline flow visualization */}
            <div className="pipeline-flow" ref={containerRef}>
                {recentTxs.length === 0 && (
                    <div className="pipeline-empty">Click a pixel to see transactions flow through the pipeline...</div>
                )}
                {recentTxs.map((tx) => (
                    <div key={tx.id} className={`pipeline-tx pipeline-tx-${tx.stage}`}>
                        <div className="tx-dot" style={{ backgroundColor: tx.color }} />
                        <div className="tx-info">
                            <span className="tx-pixel">
                                #{tx.pixelId}
                                {tx.painter && (
                                    <span className="tx-painter" style={{ opacity: 0.6, marginLeft: "4px", fontSize: "0.6rem" }}>
                                        ({tx.painter.slice(0, 4)}...{tx.painter.slice(-4)})
                                    </span>
                                )}
                            </span>
                            <span className="tx-stage-label">
                                {tx.stage === "pending" && "⏳ Pending"}
                                {tx.stage === "confirmed" && "✅ Confirmed"}
                                {tx.stage === "parallel" && "⚡ Parallel"}
                                {tx.stage === "collision" && "🔴 Collision"}
                                {tx.stage === "failed" && "❌ Failed"}
                            </span>
                        </div>
                        <div className={`tx-progress tx-progress-${tx.stage}`}>
                            <div className="tx-progress-fill" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Execution explainer */}
            <div className="pipeline-explainer">
                <div className="explainer-card explainer-parallel">
                    <div className="explainer-icon">⚡</div>
                    <div>
                        <strong>Parallel Execution</strong>
                        <p>When transactions touch different pixels, Monad executes them simultaneously — no waiting.</p>
                    </div>
                </div>
                <div className="explainer-card explainer-collision">
                    <div className="explainer-icon">🔴</div>
                    <div>
                        <strong>State Collision</strong>
                        <p>When two transactions hit the same pixel in one block, Monad detects the conflict and re-executes sequentially.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
