// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RevenueModule = buildModule("RevenueModule", (m) => {
  const revenue = m.contract("Revenue");

  return { revenue };
});

export default RevenueModule;
