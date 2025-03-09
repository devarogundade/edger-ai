// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { BTC, ETH, SONIC_COIN } from "../constants";

const SONIC_FEED = "0xc76dFb89fF298145b417d221B2c747d84952e01d";
const BTC_FEED = "0x8Bcd59Cb7eEEea8e2Da3080C891609483dae53EF";
const ETH_FEED = "0x824364077993847f71293B24ccA8567c00c2de11";

const ChainlinkModule = buildModule("ChainlinkModule", (m) => {
  const chainlink = m.contract("Chainlink");

  m.call(chainlink, "setFeed", [SONIC_COIN, SONIC_FEED]);

  m.call(chainlink, "setFeed", [BTC, BTC_FEED]);

  m.call(chainlink, "setFeed", [ETH, ETH_FEED]);

  return { chainlink };
});

export default ChainlinkModule;
