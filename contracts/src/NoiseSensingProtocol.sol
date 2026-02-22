// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {MockZKVerifier} from "./MockZKVerifier.sol";

/**
 * @title NoiseSensingProtocol
 * @notice Protocol for government-issued noise mapping events & citizen data submissions.
 * @dev Optimized for parallel execution (Monad). Uses native MON for rewards.
 */
contract NoiseSensingProtocol is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct EventData {
        uint256 eventId;
        string locationId;
        uint256 maxSubmissions;
        uint256 currentSubmissions;
        uint256 rewardPerSubmission;
        bool isActive;
    }

    MockZKVerifier public zkVerifier;

    uint256 public nextEventId;

    // eventId => EventData
    mapping(uint256 => EventData) public events;
    
    // To prevent a single citizen from submitting too many times to the same event
    // eventId => (citizenAddress => hasSubmitted)
    mapping(uint256 => mapping(address => bool)) public hasCitizenSubmitted;

    event EventCreated(uint256 indexed eventId, string locationId, uint256 maxSubmissions, uint256 rewardPerSubmission);
    event DataSubmitted(uint256 indexed eventId, address indexed citizen, uint256 encryptedNoiseLevel);

    constructor(address defaultAdmin, address _zkVerifier) {
        require(defaultAdmin != address(0), "Invalid admin");
        require(_zkVerifier != address(0), "Invalid verifier");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ADMIN_ROLE, defaultAdmin);

        zkVerifier = MockZKVerifier(_zkVerifier);
    }

    /**
     * @notice Admin creates a new noise mapping event and funds it via msg.value.
     */
    function createEvent(
        string calldata locationId,
        uint256 maxSubmissions,
        uint256 rewardPerSubmission
    ) external payable onlyRole(ADMIN_ROLE) {
        require(maxSubmissions > 0, "Max submissions must be > 0");
        require(rewardPerSubmission > 0, "Reward must be > 0");
        
        uint256 requiredPool = maxSubmissions * rewardPerSubmission;
        require(msg.value == requiredPool, "Must fund entire pool up front");

        uint256 eventId = nextEventId++;

        events[eventId] = EventData({
            eventId: eventId,
            locationId: locationId,
            maxSubmissions: maxSubmissions,
            currentSubmissions: 0,
            rewardPerSubmission: rewardPerSubmission,
            isActive: true
        });

        emit EventCreated(eventId, locationId, maxSubmissions, rewardPerSubmission);
    }

    /**
     * @notice Citizen submits ZK proof of noise level.
     * @param eventId The target event ID.
     * @param encryptedNoiseLevel Encrypted data representing the sensor reading.
     * @param proof The ZK proof (mocked).
     */
    function submitNoiseData(
        uint256 eventId,
        uint256 encryptedNoiseLevel,
        bytes calldata proof
    ) external {
        EventData storage evt = events[eventId];
        
        require(evt.isActive, "Event is not active");
        require(evt.currentSubmissions < evt.maxSubmissions, "Max submissions reached");
        require(!hasCitizenSubmitted[eventId][msg.sender], "Already submitted");

        // Verify ZK Proof (Using mock inputs [eventId, msg.sender address cast])
        uint256[2] memory publicInputs = [eventId, uint256(uint160(msg.sender))];
        require(zkVerifier.verifyProof(proof, publicInputs), "Invalid ZK proof");

        hasCitizenSubmitted[eventId][msg.sender] = true;
        
        // Using unchecked increment as maxSubmissions is capped
        unchecked {
            evt.currentSubmissions++;
        }

        if (evt.currentSubmissions == evt.maxSubmissions) {
            evt.isActive = false;
        }

        emit DataSubmitted(eventId, msg.sender, encryptedNoiseLevel);

        // Native MON payout to citizen
        (bool success, ) = payable(msg.sender).call{value: evt.rewardPerSubmission}("");
        require(success, "MON transfer failed");
    }

    /**
     * @notice Allows unexpected native transfers to not revert.
     */
    receive() external payable {}
}
