import { config as dotenv } from "dotenv"
dotenv()

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = [ process.env.PRIVATE_KEY! ]

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true  // Enable the IR optimization to work around the "Stack too deep" error
    }
  },
  networks: {
    galadriel: {
      chainId: 696969,
      url: "https://devnet.galadriel.com/",
      accounts,
    },
    localhost: {
      chainId: 1337,
      url: "http://127.0.0.1:8545",
      // accounts: localhostPrivateKeys,
    }
  },
};

export default config;
