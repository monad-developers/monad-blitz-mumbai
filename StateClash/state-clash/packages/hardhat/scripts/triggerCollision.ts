import { ethers } from "hardhat";

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const CONTRACT_ADDRESS = "0xF04B27c7174bfA11302D7265B71BDEaA98cc3De3";
    const Canvas = await ethers.getContractAt("Canvas", CONTRACT_ADDRESS);

    const [signer] = await ethers.getSigners();
    console.log(`Using account: ${signer.address}`);

    const PIXEL_X = 10;
    const PIXEL_Y = 10;
    const COLOR_IDX = 2; // red

    console.log(`Getting current nonce...`);
    const currentNonce = await ethers.provider.getTransactionCount(signer.address);
    console.log(`Current nonce is ${currentNonce}`);

    console.log(`Sending 3 overlapping transactions to pixel (${PIXEL_X}, ${PIXEL_Y})...`);

    // Send 3 transactions rapidly, but with a tiny delay to avoid overwhelming the undici HTTP pool
    // 50ms delay means all 3 are sent within 100ms, easily falling into the same 1-second Monad block
    const txs = [];
    try {
        for (let i = 0; i < 3; i++) {
            const tx = await Canvas.drawPixel(PIXEL_X, PIXEL_Y, COLOR_IDX, {
                nonce: currentNonce + i,
                gasLimit: 500000,
            });
            console.log(`Sent tx ${i + 1}: ${tx.hash}`);
            txs.push(tx);
            if (i < 2) await sleep(1);
        }

        console.log("Waiting for block inclusion...");
        // Wait for the FIRST one to confirm. The others in the same block will confirm simultaneously.
        const receipt = await txs[0].wait();
        console.log(`Transaction 1 confirmed in block ${receipt?.blockNumber}!`);

        console.log("Check the UI immediately! You should see 1 Parallel (the first tx in the block) and 2 Collisions (the subsequent txs in the exact same block)!");

    } catch (e) {
        console.error("Error sending txns:", e);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
