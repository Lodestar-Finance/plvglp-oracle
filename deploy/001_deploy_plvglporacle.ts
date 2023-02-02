import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, save} = deployments;

  const {deployer, glpAddress, glpManagerAddress, plvglp} = await getNamedAccounts();

  const whitelist = (await get('Whitelist')).address.toString();

  const windowSize = 6;


  const lode = await deploy('plvGLPOracle', {
    from: deployer,
    contract: 'plvGLPOracle',
    args: [
      glpAddress,
      glpManagerAddress,
      plvglp,
      whitelist,
      windowSize
    ],
    log: true
  });

};
export default func;
func.dependencies = ['Whitelist'];
func.tags = ['plvGLPOracle'];