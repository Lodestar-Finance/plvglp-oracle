// SPDX-License-Identifier: BSD-3-Clause

//this contract mocks the necessary functions behind plvGLP and is for testing purposes ONLY!!
//Author: Lodestar Finance
pragma solidity ^0.8.17;

contract MockPlvGLP {
    address plvGLP;

    constructor(address _plvGLP) {
        plvGLP = _plvGLP;
    }

    function getTotalAssets() public pure returns (uint256) {
        uint256 totalAssets;
        totalAssets = 4385690448959168297133346;
        return totalAssets;
    }

    function getTotalSupply() public pure returns (uint256) {
        uint256 totalSupply;
        totalSupply = 4335445707657153052302414;
        return totalSupply;
    }
}
