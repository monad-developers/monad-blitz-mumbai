// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract SchismRegistry {
    event SchismRecorded(uint256 parentId, uint256 newId, string justification);
    event AllianceRecorded(uint256 ideologyA, uint256 ideologyB);

    function recordSchism(uint256 parentId, uint256 newId, string calldata justification) external {
        emit SchismRecorded(parentId, newId, justification);
    }

    function recordAlliance(uint256 ideologyA, uint256 ideologyB) external {
        emit AllianceRecorded(ideologyA, ideologyB);
    }
}
