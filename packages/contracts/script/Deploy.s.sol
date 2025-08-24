// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/LearnToEarnRewarder.sol";
import "../src/ContentRegistry.sol";
import "../src/LearnerRegistry.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        LearnToEarnRewarder rewarder = new LearnToEarnRewarder(vm.envAddress("GCC_TOKEN_ADDRESS"));
        ContentRegistry content = new ContentRegistry();
        LearnerRegistry learner = new LearnerRegistry();
        vm.stopBroadcast();
        console2.log("Rewarder:", address(rewarder));
        console2.log("ContentRegistry:", address(content));
        console2.log("LearnerRegistry:", address(learner));
    }
}