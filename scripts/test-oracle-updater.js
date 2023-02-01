const hre = require("hardhat");
const fs = require("fs");

console.log("--------------------------------------");
console.log("Executing test-oracle-updater.js script");
console.log("--------------------------------------");

const network = hre.network.name;

let rawDeployment = fs.readFileSync(
  `./deployments/${network}/plvGLPOracle.json`
);
let deploymentJson = JSON.parse(rawDeployment);
let deploymentAddress = deploymentJson.address;

//const glpOracleHardAddress = "0xF16C5EbAf37e42dA8C3e255B2A1E7C32085f53e7";

async function updateRate() {
  //let glpOracleDeployment = await hre.deployments.get('TestGLPOracle');
  //let glpOracleAddress = glpOracleDeployment.address;
  let glpOracle = await hre.ethers.getContractAt(
    "plvGLPOracle",
    deploymentAddress
  );
  let tx = await glpOracle.update();
  console.log(`Trying to update exchange rate with tx hash: ${tx.hash}`);
  await tx.wait();
  console.log("**exchange rate updated**");
}

setInterval(function () {
  updateRate();
}, 30000);
