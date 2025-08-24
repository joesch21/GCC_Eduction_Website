// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ContentRegistry is Ownable {
    bytes32 public root;
    string public uri;

    event ContentRootUpdated(bytes32 root, string uri);

    function setRoot(bytes32 _root, string calldata _uri) external onlyOwner {
        root = _root;
        uri = _uri;
        emit ContentRootUpdated(_root, _uri);
    }
}