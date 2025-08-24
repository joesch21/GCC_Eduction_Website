// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ContentRegistry.sol";

contract ContentRegistryTest is Test {
    function testExample() public {
        ContentRegistry reg = new ContentRegistry();
        reg.setRoot(bytes32(0), "ipfs://example");
        assertEq(reg.root(), bytes32(0));
    }
}