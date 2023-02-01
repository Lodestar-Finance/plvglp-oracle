import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy, get, save} = deployments;

  const {deployer, glpAddress, glpManagerAddress, plvglp} = await getNamedAccounts();

  const windowSize = 6;


  const lode = await deploy('plvGLPOracle', {
    from: deployer,
    contract: 'plvGLPOracle',
    args: [
      glpAddress,
      glpManagerAddress,
      plvglp,
      windowSize
    ],
    log: true
  });

};
export default func;
func.tags = ['plvGLPOracle'];