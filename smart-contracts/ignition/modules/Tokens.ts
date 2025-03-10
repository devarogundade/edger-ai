// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokensModule = buildModule("TokensModule", (m) => {
  const wbtc = m.contract("MintableToken", ["Bitcoin Test", "tWBTC", 8], {
    id: "tWBTC",
  });
  const usdt = m.contract("MintableToken", ["USDT Test", "tUSDT", 6], {
    id: "tUSDT",
  });
  const weth = m.contract("MintableToken", ["Ethereum Test", "tWETH", 18], {
    id: "tWETH",
  });

  return { wbtc, usdt, weth };
});

export default TokensModule;
