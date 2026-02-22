// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockZKVerifier
 * @notice A mocked Zero-Knowledge Proof verifier for local testing.
 * @dev In a production environment, this would be a Groth16 or Plonk verifier
 * utilizing Monad's EVM precompiles (e.g. bn256Pairing). We mock it here to verify
 * the overall flow without generating real SNARK proofs.
 */
contract MockZKVerifier {
    /**
     * @notice Mock verification function.
     * @param proof The simulated ZK proof.
     * @param publicInputs The public inputs (e.g. locationId hash, timestamp limits).
     * @return true if proof starts with 0x01 (mock success logic).
     */
    function verifyProof(bytes calldata proof, uint256[2] calldata publicInputs) external pure returns (bool) {
        // Prevent unused variable warnings
        publicInputs;
        
        // Very rudimentary mock: if the proof string starts with byte 0x01, it's valid.
        // In reality, this would be complex elliptic curve math.
        if (proof.length > 0 && proof[0] == 0x01) {
            return true;
        }

        return false;
    }
}
