// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LearnerRegistry.sol";

contract LearnerRegistryTest is Test {
    function testEnroll() public {
        LearnerRegistry reg = new LearnerRegistry();
        reg.enroll(1);
        // no assertion, just ensure function callable
    }
}