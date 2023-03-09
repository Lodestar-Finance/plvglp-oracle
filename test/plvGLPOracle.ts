import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const BASE = ethers.BigNumber.from('1000000000000000000');
const correctIndex = "1011589290857287007";
const badIndex = "101158929085728700764";
const badValue = '438569044895916829713334600'
const dummyAddress = "0x67E57A0ec37768eaF99a364975ec4E1f98920D01";
const windowSize = 6;

//plvGLP Oracle Testing Suite
//What needs to be tested?

//moving average calculation (done)
//update index can only be called by whitelist addresses (done)
//swingchecker function (done)
//index when swingchecker fails is equal to previous index (done)
//verify proper decimal places of reported price
//verify previousIndex
//owner functions (done)


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

    return { PlvGLPOracle, MockPlvGLP, owner, otherAccount };
  };

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
    });
    it("Should return the correct value for plvGLP Price", async function () {
      const { PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const averageIndex = await PlvGLPOracle.averageIndex();
      const glpPrice = await PlvGLPOracle.getGLPPrice();
      const priceCalculated = averageIndex.mul(glpPrice).div(BASE);
      
      expect(await PlvGLPOracle.getPlvGLPPrice()).to.equal(priceCalculated);
    }); 
  });

  describe("Index Updating", function () {
    it("Whitelisted addresses are able to update the index", async function () {
      const { PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle.updateIndex()).not.to.be.reverted;
    });
    it("Non-Whitelisted addresses are not allowed to update the index.", async function () {
      const { PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      await expect(PlvGLPOracle.connect(otherAccount).updateIndex()).to.be.revertedWith('NOT_AUTHORIZED');
    });
    it("Should emit the updatePosted event when a new index is posted", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle.updateIndex()).to.emit(PlvGLPOracle, "updatePosted").withArgs(correctIndex, anyValue);
    });
  });

  describe("Swing Checker", function () {
    it("Should fall back on previous index when a bad index is requested to be posted", async function () {
      const { PlvGLPOracle, MockPlvGLP} = await loadFixture(deployStandardOracleFixture);
      const previousIndex = await PlvGLPOracle.getPreviousIndex();
      await MockPlvGLP.changeTotalAssets(badValue);
      await PlvGLPOracle.updateIndex();
      const newIndex = await PlvGLPOracle.getPreviousIndex();
      expect(newIndex).to.equal(previousIndex);
    });
    it("CheckSwing returns false for bad index", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const bool = await PlvGLPOracle.callStatic.checkSwing(badValue);
      expect(bool).to.be.false;
    });
    it("Should emit the IndexAlert event when a bad index is attempted to be posted", async function () {
      const {PlvGLPOracle, MockPlvGLP} = await loadFixture(deployStandardOracleFixture);
      const previousIndex = await PlvGLPOracle.getPreviousIndex();
      await MockPlvGLP.changeTotalAssets(badValue);
      await expect(await PlvGLPOracle.updateIndex()).to.emit(PlvGLPOracle, "IndexAlert").withArgs(previousIndex, badIndex, anyValue);
    });
    it("Wrong minimum swing value", async function () {
      const {PlvGLPOracle, MockPlvGLP} = await loadFixture(deployStandardOracleFixture);
      var actualSwing = BigInt(await PlvGLPOracle.MAX_SWING());
      //max swing should be of 1%, so it should be 1% of BASE, however, if we multiply by 1000...
      actualSwing = actualSwing * 1000n;
      expect(actualSwing).to.equal(BigInt(1e18));
      //we'll see the test passes, which means it's actually a 0.1% swing
      //the correct value would be 1e16 for 1%, but its set as 1e15 instead
    });
  });

  describe("Admin Functions", function () {
    it("The owner may update the GLP Address", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle._updateGlpAddress(dummyAddress)).to.not.be.reverted;
    });
    it("Non-owners may not update the GLP Address", async function () {
      const {PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      await expect(PlvGLPOracle.connect(otherAccount)._updateGlpAddress(dummyAddress)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Should emit newGlpAddress event when GLP address is updated", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const glpAddress = await PlvGLPOracle.GLP();
      await expect(await PlvGLPOracle._updateGlpAddress(dummyAddress)).to.emit(PlvGLPOracle, "newGLPAddress").withArgs(glpAddress, dummyAddress);
    });
    it("The owner may update the GLP Manager Address", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle._updateGlpManagerAddress(dummyAddress)).to.not.be.reverted;
    });
    it("Non-owners may not update the GLP Manager Address", async function () {
      const {PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      await expect(PlvGLPOracle.connect(otherAccount)._updateGlpManagerAddress(dummyAddress)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Should emit newGlpManagerAddress event when GLP Manager address is updated", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const glpManagerAddress = await PlvGLPOracle.GLPManager();
      await expect(await PlvGLPOracle._updateGlpManagerAddress(dummyAddress)).to.emit(PlvGLPOracle, "newGLPManagerAddress").withArgs(glpManagerAddress, dummyAddress);
    });
    it("The owner may update the plvGLP Address", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle._updatePlvGlpAddress(dummyAddress)).to.not.be.reverted;
    });
    it("Non-owners may not update the plvGLP Address", async function () {
      const {PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      await expect(PlvGLPOracle.connect(otherAccount)._updatePlvGlpAddress(dummyAddress)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Should emit newPlvGLPAddress event when plvGLP address is updated", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const plvGLP = await PlvGLPOracle.plvGLP();
      await expect(await PlvGLPOracle._updatePlvGlpAddress(dummyAddress)).to.emit(PlvGLPOracle, "newPlvGLPAddress").withArgs(plvGLP, dummyAddress);
    });
    it("The owner may update the window size", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      await expect(await PlvGLPOracle._updateWindowSize(windowSize)).to.not.be.reverted;
    });
    it("Non-owners may not update the window size", async function () {
      const {PlvGLPOracle, otherAccount} = await loadFixture(deployStandardOracleFixture);
      await expect(PlvGLPOracle.connect(otherAccount)._updateWindowSize(windowSize)).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it("Should emit newWindowSize event when the window size is updated", async function () {
      const {PlvGLPOracle} = await loadFixture(deployStandardOracleFixture);
      const windowSize = await PlvGLPOracle.windowSize();
      await expect(await PlvGLPOracle._updateWindowSize(dummyAddress)).to.emit(PlvGLPOracle, "newWindowSize").withArgs(windowSize, dummyAddress);
    });
  })
});
