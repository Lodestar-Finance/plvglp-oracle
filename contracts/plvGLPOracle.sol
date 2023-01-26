//SPDX-License-Identifier: BSD-3-Clause
//Authors: Lodestar Finance and Plutus DAO
pragma solidity 0.8.17;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./Interfaces/GLPManagerInterface.sol";
import "./Interfaces/plvGLPInterface.sol";
import "./Interfaces/ERC20Interface.sol";

//TODO: implement moving average similar to Uniswap v2?
//TODO: finish documentation

/** @title Oracle for Plutus Vault GLP employing TWAP calculations for pricing
    @author Lodestar Finance & Plutus DAO
    @notice This contract uses a simple cumulative TWAP function. It is more resistant to manipulation
    but reported prices are less fresh over time.
*/
contract plvGLPOracle is Ownable {
    uint256 lastIndex;
    uint256 averageIndex;
    uint256 cumulativeIndex;
    uint256 updateThreshold;

    address GLP;
    address GLPManager;
    address plvGLP;

    uint256 private constant BASE = 1e18;
    uint256 private constant DECIMAL_DIFFERENCE = 1e6;
    uint256 private constant MAX_SWING = 10000000000000000; //1%
    bool public constant isGLPOracle = true;

    struct IndexInfo {
        uint256 timestamp;
        uint256 recordedIndex;
    }

    IndexInfo[] public HistoricalIndices;

    event IndexAlert(
        uint256 previousIndex,
        uint256 possiblyBadIndex,
        uint256 timestamp
    );

    constructor(
        uint256 _updateThreshold,
        address _GLP,
        address _GLPManager,
        address _plvGLP
    ) {
        updateThreshold = _updateThreshold;
        GLP = _GLP;
        GLPManager = _GLPManager;
        plvGLP = _plvGLP;
        uint256 index = getPlutusExchangeRate();
        require(index > 0, "First index cannot be zero.");
        //initialize indices, this push will be stored in position 0
        HistoricalIndices.push(IndexInfo(block.timestamp, index));
        cumulativeIndex = index;
    }

    function getGLPPrice() public view returns (uint256) {
        //retrieve the minimized AUM from GLP Manager Contract
        uint256 glpAUM = GLPManagerInterface(GLPManager).getAum(false);
        //retrieve the total supply of GLP
        uint256 glpSupply = ERC20Interface(GLP).totalSupply();
        //GLP Price = AUM / Total Supply
        uint256 price = (glpAUM / glpSupply) * DECIMAL_DIFFERENCE;
        return price;
    }

    function getPlutusExchangeRate() public view returns (uint256) {
        //retrieve total assets from plvGLP contract
        uint256 totalAssets = plvGLPInterface(plvGLP).totalAssets();
        //retrieve total supply from plvGLP contract
        uint256 totalSupply = ERC20Interface(plvGLP).totalSupply();
        //plvGLP/GLP Exchange Rate = Total Assets / Total Supply
        uint256 exchangeRate = (totalAssets * BASE) / totalSupply;
        return exchangeRate;
    }

    function computeAverageIndex() internal returns (uint256) {
        //we want to include the first (zeroth) index in these calculations, so we don't subtract 1 from array length
        uint256 latestIndexing = HistoricalIndices.length;
        averageIndex = uint256((cumulativeIndex) / latestIndexing);
        return averageIndex;
    }

    function getPreviousIndex() internal view returns (uint256) {
        uint256 previousIndexing = HistoricalIndices.length - 1;
        uint256 previousIndex = HistoricalIndices[previousIndexing]
            .recordedIndex;
        return previousIndex;
    }

    function checkSwing(uint256 currentIndex) internal returns (bool) {
        uint256 previousIndex = getPreviousIndex();
        uint256 allowableSwing = (previousIndex * MAX_SWING) / BASE;
        uint256 minSwing = previousIndex - allowableSwing;
        uint256 maxSwing = previousIndex + allowableSwing;
        if (currentIndex > maxSwing || currentIndex < minSwing) {
            emit IndexAlert(previousIndex, currentIndex, block.timestamp);
            return false;
        }
        return true;
    }

    /**
        @notice Update the current, cumulative and average indices when required conditions are met
        @dev we only ever update the index if requested update is within +/- 1% of previously accepted
        index and update threshold has been reached. Revert otherwise.
        @notice If the price fails to update, the posted price will fall back on the last previously 
        accepted average index.
     */
    function updateIndex() public onlyOwner {
        uint256 currentIndex = getPlutusExchangeRate();
        bool indexCheck = checkSwing(currentIndex);
        if (!indexCheck) {
            revert("requested update is out of bounds");
        } else if (indexCheck && currentIndex - lastIndex > updateThreshold) {
            cumulativeIndex = cumulativeIndex + currentIndex;
            HistoricalIndices.push(IndexInfo(block.timestamp, currentIndex));
            averageIndex = computeAverageIndex();
        }
    }

    function getPlvGLPPrice() external view returns (uint256) {
        uint256 glpPrice = getGLPPrice();
        uint256 plvGlpPrice = (averageIndex * glpPrice) / BASE;
        return plvGlpPrice;
    }

    //* ADMIN FUNCTIONS */

    //TODO:
    //transferOwnership
    //update required addresses
    //update params
}
