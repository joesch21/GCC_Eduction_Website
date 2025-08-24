// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract LearnToEarnRewarder is Ownable, ReentrancyGuard, EIP712 {
    IERC20 public immutable token;
    mapping(address => uint256) public nonces;

    bytes32 public constant CLAIM_TYPEHASH = keccak256("Claim(address to,uint256 amount,uint256 deadline,uint256 nonce)");

    event Claimed(address indexed to, uint256 amount);

    constructor(address tokenAddress) EIP712("LearnToEarnRewarder", "1") {
        token = IERC20(tokenAddress);
    }

    function claim(
        address to,
        uint256 amount,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant {
        require(block.timestamp <= deadline, "expired");
        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, to, amount, deadline, nonce)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == owner(), "invalid signature");
        require(nonces[to]++ == nonce, "nonce mismatch");
        token.transfer(to, amount);
        emit Claimed(to, amount);
    }
}