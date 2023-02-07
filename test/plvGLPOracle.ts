import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const BASE = ethers.BigNumber.from('1000000000000000000');
const badValue = '438569044895916829713334600'

//plvGLP Oracle Testing Suite
//What needs to be tested?

//moving average calculation (done)
//update index can only be called by whitelist addresses (done)
//swingchecker function
//index when swingchecker fails is equal to previous index
//verify proper decimal places of reported price
//verify previousIndex
//owner functions


describe("PlvGLPOracle", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployStandardOracleFixture() {

    const windowSize = 6;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const ownerAddress = owner.address;

    const mockGLP = await ethers.getContractFactory("MockGLP");
    const MockGLP = await mockGLP.deploy();
    const MockGLPAddress = MockGLP.address.toString();

    const mockPlvGLP = await ethers.getContractFactory("MockPlvGLP");
    const MockPlvGLP = await mockPlvGLP.deploy();
    const MockPlvGLPAddress = MockPlvGLP.address.toString();

    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy();
    const WhitelistAddress = Whitelist.address.toString();

    await Whitelist.updateWhitelist(ownerAddress, true);

    const plvGLPOracle = await ethers.getContractFactory("PlvGLPOracle");
    const PlvGLPOracle = await plvGLPOracle.deploy(MockGLPAddress, MockGLPAddress, MockPlvGLPAddress, WhitelistAddress, windowSize);

    const initializationPeriod = windowSize * 3;

    for (var i = 0; i < initializationPeriod; i++) {
      await PlvGLPOracle.updateIndex();
    }

    console.log('after initialization');

    return { PlvGLPOracle, MockPlvGLP, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the contract owner correctly", async function () {
      const { PlvGLPOracle, owner } = await loadFixture(deployStandardOracleFixture);
      const ownerAddress = owner.address;

      expect(await PlvGLPOracle.owner()).to.equal(ownerAddress);
    });

    it("The first index cannot be zero", async function () {
      const { PlvGLPOracle } = await loadFixture(deployStandardOracleFixture);

      expect(await PlvGLPOracle.HistoricalIndices(0)).to.not.equal(0);
    });
  });

  describe("Moving Average & Price Calculations", function () {
    it("Should return the correct value for the moving average", async function () {
      const { PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const averageIndex = await PlvGLPOracle.averageIndex();
      const trueIndex = ethers.BigNumber.from('1011589290857287007');
      
      expect(averageIndex).to.equal(trueIndex);
    })
    it("Should return the correct value for plvGLP Price", async function () {
      const { PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const averageIndex = await PlvGLPOracle.averageIndex();
      const glpPrice = await PlvGLPOracle.getGLPPrice();
      const priceCalculated = averageIndex.mul(glpPrice).div(BASE);
      
      expect(await PlvGLPOracle.getPlvGLPPrice()).to.equal(priceCalculated);
    }) 
  })

  describe("Index Updating Permissions", function () {
    it("Whitelisted addresses are able to update the index", async function () {
      const { PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      expect(await PlvGLPOracle.updateIndex()).not.to.be.reverted;
    })
    it("Non-Whitelisted addresses are not allowed to update the index.", async function () {
      const { PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      expect(PlvGLPOracle.connect(otherAccount).updateIndex()).to.be.revertedWith('NOT_AUTHORIZED');
    })
  })

  describe("Swing Checker", function () {
    it("Should fall back on previous index when a bad index is requested to be posted", async function () {
      const { PlvGLPOracle, MockPlvGLP} = await loadFixture(deployStandardOracleFixture);
      const previousIndex = await PlvGLPOracle.getPreviousIndex();
      await MockPlvGLP.changeTotalAssets(badValue);
      await PlvGLPOracle.updateIndex();
      const newIndex = await PlvGLPOracle.getPreviousIndex();
      expect(newIndex).to.equal(previousIndex);
    })
  })
});
