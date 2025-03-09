// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import RevenueModule from "./Revenue";
import PriceOracleModule from "./PriceOracle";

const SpookySwapRouter = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883";

const FactoryModule = buildModule("FactoryModule", (m) => {
  const { revenue } = m.useModule(RevenueModule);
  const { priceOracle } = m.useModule(PriceOracleModule);

  const factory = m.contract("Factory", [
    revenue,
    priceOracle,
    SpookySwapRouter,
  ]);

  return { factory };
});

export default FactoryModule;
