// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LearnerRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event Enrolled(address indexed learner, uint256 cohortId);
    event Committed(address indexed learner, bytes32 answerHash, uint256 deptId);
    event Revealed(address indexed learner, uint256 deptId);
    event ProgressAttested(address indexed learner, bytes32 stateRoot);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function enroll(uint256 cohortId) external {
        emit Enrolled(msg.sender, cohortId);
    }

    // Mode A (commit-reveal)
    function commit(bytes32 answerHash, uint256 deptId) external {
        emit Committed(msg.sender, answerHash, deptId);
    }

    function reveal(bytes32 /*salt*/, bytes calldata /*answersPacked*/, uint256 deptId) external {
        emit Revealed(msg.sender, deptId);
    }

    function completeDept(uint256 /*deptId*/) external {
        // stub
    }

    // Mode B (off-chain attest)
    function attestProgress(address learner, bytes32 stateRoot) external onlyRole(ADMIN_ROLE) {
        emit ProgressAttested(learner, stateRoot);
    }
}