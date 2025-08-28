// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/LearnerRegistry.sol";

contract LearnerRegistryTest is Test {
    event Completed(address indexed learner, uint256 deptId);

    function testEnroll() public {
        LearnerRegistry reg = new LearnerRegistry();
        reg.enroll(1);
        // no assertion, just ensure function callable
    }

    function testMarkCompletedEmitsEvent() public {
        LearnerRegistry reg = new LearnerRegistry();
        address learner = address(0x1234);
        uint256 deptId = 2;
        vm.expectEmit(true, false, false, true);
        emit Completed(learner, deptId);
        reg.markCompleted(learner, deptId);
    }
}