// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SchismRegistry} from "../src/SchismRegistry.sol";

contract SchismRegistryTest is Test {
    SchismRegistry public registry;

    event SchismRecorded(uint256 parentId, uint256 newId, string justification);
    event AllianceRecorded(uint256 ideologyA, uint256 ideologyB);

    function setUp() public {
        registry = new SchismRegistry();
    }

    function test_RecordSchism() public {
        vm.expectEmit(true, true, true, true);
        emit SchismRecorded(1, 2, "Ideological differences");
        registry.recordSchism(1, 2, "Ideological differences");
    }

    function test_RecordAlliance() public {
        vm.expectEmit(true, true, true, true);
        emit AllianceRecorded(3, 4);
        registry.recordAlliance(3, 4);
    }
}
