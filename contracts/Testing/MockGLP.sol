// SPDX-License-Identifier: BSD-3-Clause

//This contract mocks the necessary functions for the GLPOracle for testing purposes ONLY!!
//Author: Lodestar Finance

pragma solidity ^0.8.17;

contract MockGLP {
    function getAum(bool maximise) public pure returns (uint256) {
        uint256 aum;

        if (maximise == false) {
            aum = 289751348156355989840954443190634393128;
        } else {
            aum = 0;
        }
        return aum;
    }

    function totalSupply() public pure returns (uint256) {
        uint256 totalSupply;
        totalSupply = 320524293832658104459556845;
        return totalSupply;
    }
}
