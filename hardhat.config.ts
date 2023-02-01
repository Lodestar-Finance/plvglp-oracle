import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
import 'dotenv/config';
import "hardhat-gas-reporter";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  namedAccounts: {
    keeperPlaceholder: "0x67E57A0ec37768eaF99a364975ec4E1f98920D01",
    glpAddress: {
      arbitrum: '0x1aDDD80E6039594eE970E5872D247bf0414C8903',
      arbitrumgoerli: '0x6a86B2f0c78a6a3FeecD482FF14b2F30eF7B39a8'
    },
    glpManagerAddress: {
      arbitrum: '0x3963FfC9dff443c2A94f21b129D429891E32ec18',
      arbitrumgoerli: '0x6a86B2f0c78a6a3FeecD482FF14b2F30eF7B39a8'
    },
    plvglp: {
      arbitrum: '0x5326E71Ff593Ecc2CF7AcaE5Fe57582D6e74CFF1',
      arbitrumgoerli: '0x9A2b694875c587986c3A07096Fd30275E97A6274'
    },
    deployer: 0
  },
  networks: {
    hardhat: {
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc'
      }
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_ARBITRUM}`,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    },
    arbitrumgoerli: {
      url: `https://arb-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_ARBITRUMGOERLI}`,
      chainId: 421613,
      accounts: process.env.DEPLOY_PRIVATE_KEY == undefined ? [] : [`0x${process.env.DEPLOY_PRIVATE_KEY}`],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "arbitrumgoerli",
        chainId: 421613,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io"
        }
      }
    ]
  }
};

export default config;
