import { vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const MNEMONIC = vars.get("MNEMONIC");
const SONIC_API_KEY = vars.get("SONIC_API_KEY");

module.exports = {
  mocha: {
    timeout: 100000000,
  },
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    localhost: {
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      ],
    },
    sonicTestnet: {
      url: `https://rpc.blaze.soniclabs.com`,
      chainId: 57054,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    sonic: {
      url: `https://rpc.soniclabs.com`,
      chainId: 146,
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
  },
  etherscan: {
    apiKey: {
      sonicTestnet: SONIC_API_KEY,
    },
    customChains: [
      {
        network: "sonicTestnet",
        chainId: 57054,
        urls: {
          apiURL: "https://api-testnet.sonicscan.org/api",
          browserURL: "https://testnet.sonicscan.org/",
        },
      },
      {
        network: "sonic",
        chainId: 146,
        urls: {
          apiURL: "https://api.sonicscan.org/api",
          browserURL: "https://sonicscan.org/",
        },
      },
    ],
  },
};
