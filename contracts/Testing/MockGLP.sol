// SPDX-License-Identifier: BSD-3-Clause

//This contract mocks the necessary functions for the GLPOracle for testing purposes ONLY!!
//Author: Lodestar Finance

pragma solidity ^0.8.17;

contract MockGLP {
    address public GLP;

    address public GLPManager;

    //address public admin = msg.sender;

    constructor(address _GLP, address _GLPManager) {
        GLP = _GLP;
        GLPManager = _GLPManager;
    }

    function getAum(bool maximise) public pure returns (uint256) {
        uint256 aum;

        if (maximise == false) {
            aum = 289751348156355989840954443190634393128;
        } else {
            aum = 0;
        }
        return aum;
    }

    function getTotalSupply() public pure returns (uint256) {
        uint256 totalSupply;
        totalSupply = 320524293832658104459556845;
        return totalSupply;
    }

    function setGLPAddress(address _GLP) public returns (address) {
        GLP = _GLP;
        return GLP;
    }

    function setGLPManager(address _GLPManager) public returns (address) {
        GLPManager = _GLPManager;
        return GLPManager;
    }
}
