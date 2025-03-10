import { config } from "./config";
import { factoryAbi } from "../abis/factory";
import { revenueAbi } from "../abis/revenue";
import { strategyAbi } from "../abis/strategy";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { decodeEventLog, type Hex } from "viem";
import type { ActionCall, Revenue, Visibility } from "./types";
import { poolAbi } from "@/abis/pool";
import { priceOracleAbi } from "@/abis/priceoracle";

const FactoryContract = {
  address: "0x951BFcC5c5e4db35a48C8E366043eb7C7C571baB" as Hex,

  async createStrategy(
    tokens: Hex[],
    splitRatio: number[],
    visibility: Visibility,
    depositUsdMin: bigint,
    forkCost: bigint,
    allowedActions: ActionCall[]
  ): Promise<{ txHash: Hex | null; strategyAddress: Hex | null }> {
    try {
      const result = await writeContract(config, {
        abi: factoryAbi,
        address: this.address,
        functionName: "createStrategy",
        args: [
          tokens,
          splitRatio,
          visibility,
          depositUsdMin,
          forkCost,
          allowedActions,
        ],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      const { args } = decodeEventLog({
        abi: factoryAbi,
        eventName: "StrategyCreated",
        data: receipt.logs[1].data,
        topics: receipt.logs[1].topics,
      });

      // @ts-ignore
      if (!args || !args.strategy)
        return {
          txHash: null,
          strategyAddress: null,
        };

      return {
        txHash: receipt.transactionHash,
        // @ts-ignore
        strategyAddress: args.strategy,
      };
    } catch (error) {
      return {
        txHash: null,
        strategyAddress: null,
      };
    }
  },

  async forkStrategy(
    strategy: Hex,
    forkCost: bigint
  ): Promise<{ txHash: Hex | null; forkAddress: Hex | null }> {
    try {
      const result = await writeContract(config, {
        abi: factoryAbi,
        address: this.address,
        functionName: "forkStrategy",
        args: [strategy],
        value: forkCost,
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      const { args } = decodeEventLog({
        abi: factoryAbi,
        eventName: "StrategyForked",
        data: receipt.logs[2].data,
        topics: receipt.logs[2].topics,
      });

      // @ts-ignore
      if (!args || !args.fork)
        return {
          txHash: null,
          forkAddress: null,
        };

      return {
        txHash: receipt.transactionHash,
        // @ts-ignore
        forkAddress: args.fork,
      };
    } catch (error) {
      return {
        txHash: null,
        forkAddress: null,
      };
    }
  },

  async getRevenueAddress(): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: factoryAbi,
        address: this.address,
        functionName: "getRevenueAddress",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },

  async getSwapRouterAddress(): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: factoryAbi,
        address: this.address,
        functionName: "getSwapRouterAddress",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },

  async getPriceOracleAddress(): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: factoryAbi,
        address: this.address,
        functionName: "getPriceOracleAddress",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },
};

const StrategyContract = {
  async creator(address: Hex): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: strategyAbi,
        address,
        functionName: "creator",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },

  async factory(address: Hex): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: strategyAbi,
        address,
        functionName: "factory",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },

  async getForkCost(address: Hex): Promise<Hex | null> {
    try {
      return (await readContract(config, {
        abi: strategyAbi,
        address,
        functionName: "getForkCost",
      })) as Hex;
    } catch (error) {
      return null;
    }
  },
};

const RevenueContract = {
  address: "0x3f63E16D1cAd611414719e063D3f7cD4Ea039c53" as Hex,

  async fund(to: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: revenueAbi,
        address: this.address,
        functionName: "fund",
        args: [to],
        value: amount,
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async withdraw(amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: revenueAbi,
        address: this.address,
        functionName: "withdraw",
        args: [amount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async balanceOf(user: Hex): Promise<Revenue> {
    try {
      return (await readContract(config, {
        abi: revenueAbi,
        address: this.address,
        functionName: "balanceOf",
        args: [user],
      })) as Revenue;
    } catch (error) {
      return {
        claimed: BigInt(0),
        unClaimed: BigInt(0),
      };
    }
  },
};

const MultiTokenPoolContract = {
  async deposit(
    strategy: Hex,
    token: Hex,
    amount: bigint
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "deposit",
        args: [token, amount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async depositETH(strategy: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "depositETH",
        args: [amount],
        value: amount,
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async withdraw(strategy: Hex, lpAmount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "withdraw",
        args: [lpAmount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async withdrawSingle(
    strategy: Hex,
    tokenOut: Hex,
    lpAmount: bigint
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "withdrawSingle",
        args: [tokenOut, lpAmount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async withdrawSingleETH(
    strategy: Hex,
    lpAmount: bigint
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "withdrawSingleETH",
        args: [lpAmount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async donate(strategy: Hex, token: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "donate",
        args: [token, amount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async donateETH(strategy: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "donateETH",
        args: [amount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async getTokens(strategy: Hex): Promise<Hex[] | null> {
    try {
      return (await readContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "getTokens",
      })) as Hex[];
    } catch (error) {
      return null;
    }
  },

  async getBalances(strategy: Hex): Promise<bigint[] | null> {
    try {
      return (await readContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "getBalances",
      })) as bigint[];
    } catch (error) {
      return null;
    }
  },

  async getSplitRatio(strategy: Hex): Promise<bigint[] | null> {
    try {
      return (await readContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "getSplitRatio",
      })) as bigint[];
    } catch (error) {
      return null;
    }
  },

  async getDepositUsdMin(strategy: Hex): Promise<bigint | null> {
    try {
      return (await readContract(config, {
        abi: poolAbi,
        address: strategy,
        functionName: "getDepositUsdMin",
      })) as bigint;
    } catch (error) {
      return null;
    }
  },
};

const PriceOracleContract = {
  address: "0xEd79079F86712d439F5D837DA13bd5Ed1568474e" as Hex,

  async getAmountOutInUsd(amountIn: bigint, tokenIn: Hex): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: priceOracleAbi,
        address: this.address,
        functionName: "getAmountOutInUsd",
        args: [amountIn, tokenIn],
      })) as bigint;
    } catch (error) {
      console.log(error);

      return BigInt(0);
    }
  },

  async getAmountsOutInUsd(
    amountIns: bigint[],
    tokenIns: Hex[]
  ): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: priceOracleAbi,
        address: this.address,
        functionName: "getAmountsOutInUsd",
        args: [amountIns, tokenIns],
      })) as bigint;
    } catch (error) {
      console.log(error);

      return BigInt(0);
    }
  },

  async getAmountOut(
    amountIn: bigint,
    tokenIn: Hex,
    tokenOut: Hex
  ): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: priceOracleAbi,
        address: this.address,
        functionName: "getAmountOut",
        args: [amountIn, tokenIn, tokenOut],
      })) as bigint;
    } catch (error) {
      return BigInt(0);
    }
  },

  async getAmountsOut(
    amountIns: bigint[],
    tokenIns: Hex[],
    tokenOut: Hex
  ): Promise<bigint> {
    try {
      return (await readContract(config, {
        abi: priceOracleAbi,
        address: this.address,
        functionName: "getAmountsOut",
        args: [amountIns, tokenIns, tokenOut],
      })) as bigint;
    } catch (error) {
      return BigInt(0);
    }
  },
};

export {
  FactoryContract,
  StrategyContract,
  RevenueContract,
  MultiTokenPoolContract,
  PriceOracleContract,
};
