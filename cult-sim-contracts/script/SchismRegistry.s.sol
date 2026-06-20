// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SchismRegistry} from "../src/SchismRegistry.sol";

contract SchismRegistryScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        SchismRegistry registry = new SchismRegistry();
        console.log("SchismRegistry deployed at:", address(registry));

        vm.stopBroadcast();
    }
}
