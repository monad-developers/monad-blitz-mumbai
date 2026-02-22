// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockZKVerifier.sol";

contract MockZKVerifierTest is Test {
    MockZKVerifier verifier;

    function setUp() public {
        verifier = new MockZKVerifier();
    }

    function testValidProof() public {
        bytes memory validProof = hex"012345";
        uint256[2] memory inputs = [uint256(1), uint256(2)];

        bool success = verifier.verifyProof(validProof, inputs);
        assertTrue(success, "Proof starting with 0x01 should be valid");
    }

    function testInvalidProof() public {
        bytes memory invalidProof = hex"002345"; // does not start with 0x01
        uint256[2] memory inputs = [uint256(1), uint256(2)];

        bool success = verifier.verifyProof(invalidProof, inputs);
        assertFalse(success, "Proof not starting with 0x01 should be invalid");
    }

    function testEmptyProof() public {
        bytes memory emptyProof = "";
        uint256[2] memory inputs = [uint256(1), uint256(2)];

        bool success = verifier.verifyProof(emptyProof, inputs);
        assertFalse(success, "Empty proof should be invalid");
    }
}
