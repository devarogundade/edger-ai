import { config } from "./config";
import {
  waitForTransactionReceipt,
  getBalance,
  writeContract,
  readContract,
} from "@wagmi/core";
import { erc20Abi } from "viem";
import type { Token } from "./types";

export async function getAllowance(
  token: `0x${string}`,
  address: `0x${string}`,
  spender: `0x${string}`
) {
  try {
    return await readContract(config, {
      abi: erc20Abi,
      address: token,
      functionName: "allowance",
      args: [address, spender],
    });
  } catch (error) {
    return BigInt(0);
  }
}

export async function approve(
  token: `0x${string}`,
  spender: `0x${string}`,
  amount: bigint
) {
  try {
    const result = await writeContract(config, {
      abi: erc20Abi,
      address: token,
      functionName: "approve",
      args: [spender, amount],
    });

    const receipt = await waitForTransactionReceipt(config, { hash: result });

    return receipt.transactionHash;
  } catch (error) {
    return null;
  }
}

export async function getUserSBalance(address: `0x${string}`) {
  try {
    const { value } = await getBalance(config, { address });
    return value;
  } catch (error) {
    return BigInt(0);
  }
}

export async function getTokenBalance(
  token: `0x${string}`,
  address: `0x${string}`
) {
  try {
    const { value } = await getBalance(config, { token, address });
    return value;
  } catch (error) {
    return BigInt(0);
  }
}

export async function addToWallet(token: Token) {
  try {
    // @ts-ignore
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: "18",
          image: "https://edgerai.xyz/images/" + token.image + ".png",
        },
      },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
