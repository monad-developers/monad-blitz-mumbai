// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MockZKVerifier.sol";
import "../src/NoiseSensingProtocol.sol";

contract NoiseSensingProtocolTest is Test {
    MockZKVerifier verifier;
    NoiseSensingProtocol protocol;

    address constant ADMIN = address(0x1);
    address constant CITIZEN1 = address(0x2);
    address constant CITIZEN2 = address(0x3);

    function setUp() public {
        vm.startPrank(ADMIN);
        verifier = new MockZKVerifier();
        protocol = new NoiseSensingProtocol(ADMIN, address(verifier));
        vm.stopPrank();

        vm.deal(ADMIN, 1000 * 10**18); // Give admin native ETH/MON
    }

    function testCreateEvent() public {
        vm.startPrank(ADMIN);
        uint256 maxSubmissions = 100;
        uint256 rewardAmount = 0.000001 ether;
        uint256 requiredValue = maxSubmissions * rewardAmount;

        protocol.createEvent{value: requiredValue}("LOC_123", maxSubmissions, rewardAmount);
        vm.stopPrank();

        (
            uint256 eventId,
            string memory locationId,
            uint256 _maxSubmissions,
            uint256 currentSubmissions,
            uint256 rewardPerSubmission,
            bool isActive
        ) = protocol.events(0);

        assertEq(eventId, 0);
        assertEq(locationId, "LOC_123");
        assertEq(_maxSubmissions, 100);
        assertEq(currentSubmissions, 0);
        assertEq(rewardPerSubmission, 0.000001 ether);
        assertTrue(isActive);

        assertEq(address(protocol).balance, requiredValue);
    }

    function testSubmitNoiseDataSuccess() public {
        uint256 requiredValue = 2 * 0.000001 ether;
        vm.prank(ADMIN);
        protocol.createEvent{value: requiredValue}("LOC_123", 2, 0.000001 ether);

        // Simulated proof (valid mock proof must start with 0x01)
        bytes memory validProof = hex"01";
        uint256 encryptedLevel = 85; 

        uint256 initialBal = CITIZEN1.balance;

        vm.startPrank(CITIZEN1);
        protocol.submitNoiseData(0, encryptedLevel, validProof);
        vm.stopPrank();

        // Check if citizen received native MON
        assertEq(CITIZEN1.balance, initialBal + 0.000001 ether);

        // Check event updated
        (,,,uint256 currentSubmissions,,bool isActive) = protocol.events(0);
        assertEq(currentSubmissions, 1);
        assertTrue(isActive);
    }

    function testSubmitDataRevertsIfInvalidProof() public {
        uint256 requiredValue = 2 * 0.000001 ether;
        vm.prank(ADMIN);
        protocol.createEvent{value: requiredValue}("LOC_123", 2, 0.000001 ether);

        // Invalid mock proof
        bytes memory invalidProof = hex"00";
        uint256 encryptedLevel = 85; 

        vm.startPrank(CITIZEN1);
        vm.expectRevert("Invalid ZK proof");
        protocol.submitNoiseData(0, encryptedLevel, invalidProof);
        vm.stopPrank();
    }

    function testSubmitDataRevertsIfAlreadySubmitted() public {
        uint256 requiredValue = 2 * 0.000001 ether;
        vm.prank(ADMIN);
        protocol.createEvent{value: requiredValue}("LOC_123", 2, 0.000001 ether);

        bytes memory validProof = hex"01";

        vm.startPrank(CITIZEN1);
        protocol.submitNoiseData(0, 85, validProof);
        
        vm.expectRevert("Already submitted");
        protocol.submitNoiseData(0, 80, validProof);
        vm.stopPrank();
    }

    function testEventCompletesWhenMaxReached() public {
        uint256 requiredValue = 2 * 0.000001 ether;
        vm.prank(ADMIN);
        protocol.createEvent{value: requiredValue}("LOC_123", 2, 0.000001 ether);

        bytes memory validProof = hex"01";

        vm.prank(CITIZEN1);
        protocol.submitNoiseData(0, 85, validProof);

        vm.prank(CITIZEN2);
        protocol.submitNoiseData(0, 86, validProof);

        (,,,uint256 current,,bool isActive) = protocol.events(0);
        assertEq(current, 2);
        assertFalse(isActive, "Event should be inactive after max submissions");
    }
}
