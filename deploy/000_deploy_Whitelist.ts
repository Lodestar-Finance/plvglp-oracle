import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, save} = deployments;

  const {deployer} = await getNamedAccounts();


  const lode = await deploy('Whitelist', {
    from: deployer,
    contract: 'Whitelist',
    args: [
    ],
    log: true
  });

};
export default func;
func.tags = ['Whitelist'];