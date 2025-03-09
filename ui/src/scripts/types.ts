import type { Hex } from "viem";

export type Post = {
  text: string;
  timestamp: number;
  image: string | null;
  creator: Hex;
};

export type Activity = {
  initiator: string;
  action: string;
  timestamp: number;
  tx_hash: string | null;
};

export enum Visibility {
  Public = 0,
  Private = 1,
}

export type Token = {
  address: Hex;
  name: string;
  symbol: string;
  image: string;
};

export type LLM = {
  name: string;
  model: string;
  image: string;
};

export type twitter = "twitter";
export type discord = "discord";
export type read_timeline = "read-timeline";
export type read_messages = "read-messages";

export enum Action {
  Swap = "Swap",
  AdjustSplitRatio = "AdjustSplitRatio",
}

export type Setting = {
  keys: {
    openai: string;
  };
};

export type AgentJson = {
  name: string;
  state: "default" | "deployed" | "running" | "stopped";
  bio: string[];
  traits: string[];
  examples: any[];
  example_accounts: any[];
  example_channels: number[];
  loop_delay: number;
  config: {
    name: string;
    message_read_count?: number;
    message_emoji_name?: string;
    server_id?: string;
    model?: string;
    network?: string;
    api_key?: string;
    is_llm?: boolean;
  }[];
  tasks: {
    config: twitter | discord;
    name: read_timeline | read_messages;
    weight: number;
  }[];
  use_time_based_weights: boolean;
  time_based_multipliers: Record<string, number>;
  tokens: Hex[];
  minimum_deposit: number;
  visibility: "public" | "private";
  fork_cost: number;
  strategy_address: Hex;
  creator: Hex | undefined;
  base_strategy_address: Hex | undefined;
  strategies: {
    swap_to_single: string[];
    swap_to_many: string[];
    adjust_split_ratio: string[];
    none: string[];
  };
};

export type Notification = {
  title: string;
  description: string;
  category: string;
  linkTitle?: string;
  linkUrl?: string;
};

export type Revenue = {
  claimed: bigint;
  unClaimed: bigint;
};

export type RevenuePrice = {
  claimedInUsd: bigint;
  unClaimedInUsd: bigint;
};

export enum ActionCall {
  AdjustSplitRatio = 0,
  SwapToSingle = 1,
  SwapToMany = 2,
}

export type Chat = {
  sender: Hex;
  text: string | null;
  timestamp: number;
  receiver: Hex;
};
