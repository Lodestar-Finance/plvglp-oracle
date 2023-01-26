import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, save} = deployments;

  const {deployer} = await getNamedAccounts();

  const arg = 1774708836;


  const lode = await deploy('Lock', {
    from: deployer,
    contract: 'Lock',
    args: [
      arg
    ],
    log: true
  });

};
export default func;
func.tags = ['Lock'];