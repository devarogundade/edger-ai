import { sonic } from "viem/chains";
import {
  createWalletClient,
  createPublicClient,
  http,
  Hex,
  parseEther,
  parseUnits,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import dotenv from "dotenv";

import Router from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { BTC, ETH, USDT } from "../ignition/constants";

dotenv.config();

const publicClient = createPublicClient({
  chain: sonic,
  transport: http(sonic.rpcUrls.default.http[0]),
});

const walletClient = createWalletClient({
  chain: sonic,
  transport: http(sonic.rpcUrls.default.http[0]),
  account: mnemonicToAccount(process.env.MNEMONIC!),
});

async function approve(token: Hex, spender: Hex, amount: bigint) {
  const hash = await walletClient.writeContract({
    address: token,
    abi: ERC20.abi,
    functionName: "approve",
    args: [spender, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Approved ${amount} for ${spender}`);
}

async function addLiquidity(
  router: Hex,
  tokenA: Hex,
  tokenB: Hex,
  amountADesired: bigint,
  amountBDesired: bigint
) {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 200000);

  await approve(tokenA, router, amountADesired);
  await approve(tokenB, router, amountBDesired);

  const hash = await walletClient.writeContract({
    address: router,
    abi: Router.abi,
    functionName: "addLiquidity",
    args: [
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      0n,
      0n,
      walletClient.account.address,
      deadline,
    ],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Liquidity added for ${tokenA} and ${tokenB}`);
}

async function addLiquidityETH(
  router: Hex,
  tokenB: Hex,
  amountADesired: bigint,
  amountBDesired: bigint
) {
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 200000);

  await approve(tokenB, router, amountBDesired);

  const hash = await walletClient.writeContract({
    address: router,
    abi: Router.abi,
    functionName: "addLiquidityETH",
    args: [
      tokenB,
      amountBDesired,
      0n,
      0n,
      walletClient.account.address,
      deadline,
    ],
    value: amountADesired,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Liquidity added for ETH and ${tokenB}`);
}

async function main() {
  const SpookySwapRouter = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883";

  await addLiquidityETH(
    SpookySwapRouter,
    BTC,
    parseEther("1"),
    parseUnits("100", 8)
  );

  await addLiquidityETH(
    SpookySwapRouter,
    ETH,
    parseEther("1"),
    parseUnits("10000", 18)
  );

  await addLiquidityETH(
    SpookySwapRouter,
    USDT,
    parseEther("1"),
    parseUnits("100000", 6)
  );

  await addLiquidity(
    SpookySwapRouter,
    BTC,
    ETH,
    parseUnits("100", 8),
    parseUnits("10000", 18)
  );

  await addLiquidity(
    SpookySwapRouter,
    BTC,
    USDT,
    parseUnits("100", 8),
    parseUnits("100000", 6)
  );

  await addLiquidity(
    SpookySwapRouter,
    USDT,
    ETH,
    parseUnits("100000", 6),
    parseUnits("10000", 18)
  );
}

main().catch(console.error);
