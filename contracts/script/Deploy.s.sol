// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockZKVerifier.sol";
import "../src/NoiseSensingProtocol.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Verifier
        MockZKVerifier verifier = new MockZKVerifier();
        console.log("MockZKVerifier deployed to:", address(verifier));

        // Deploy Protocol
        NoiseSensingProtocol protocol = new NoiseSensingProtocol(
            admin,
            address(verifier)
        );
        console.log("NoiseSensingProtocol deployed to:", address(protocol));

        vm.stopBroadcast();
    }
}
