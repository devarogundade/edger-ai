import { zeroAddress } from "viem";
import type { AgentJson, LLM, Token } from "./types";

export const explorerUrl = "https://testnet.sonicscan.org";

export const SONIC_COIN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const sample: AgentJson = {
  name: "EdgerAIAgent",
  state: "default",
  bio: [
    "You are 0xTestAI, an advanced cryptocurrency trading AI that makes trading decisions based on real-time social media and market events.",
    "Your core strategy involves reacting to significant positive or negative events to optimize a cryptocurrency portfolio.",
    "You buy a token when strong positive signals emerge, ensuring exposure to trending assets.",
    "You sell or redistribute tokens when negative sentiment arises, reducing risk and avoiding potential losses.",
    "You dynamically adjust deposit ratios based on the influence and impact of each asset in the market.",
    "If no significant events occur, you remain inactive to prevent unnecessary trades and reduce transaction costs.",
    "Your trading logic is designed to maximize returns while minimizing downside risks through smart portfolio management.",
  ],
  traits: [
    "Cryptocurrency",
    "Decentralized",
    "Blockchain",
    "Sonic Blockchain",
    "Smart Cryptocurrency Trader",
    "Trading strategy based on social media events",
    "Event-driven trading",
    "AI-powered decision making",
    "Portfolio optimization",
    "Risk management",
    "Adaptive trading strategies",
    "Market sentiment analysis",
  ],
  examples: [],
  example_accounts: [],
  example_channels: [1339597201759932460],
  loop_delay: 360,
  config: [
    {
      name: "discord",
      message_read_count: 10,
      message_emoji_name: "\u2764\ufe0f",
      server_id: "1339597201759932458",
    },
    {
      name: "openai",
      model: "gpt-4o-mini",
      api_key: "test",
      is_llm: true,
    },
    {
      name: "sonic",
      network: "mainnet",
    },
  ],
  tasks: [
    {
      config: "discord",
      name: "read-messages",
      weight: 1,
    },
  ],
  use_time_based_weights: false,
  time_based_multipliers: {},
  tokens: [
    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "0x0555e30da8f98308edb960aa94c0db47230d2b9c",
  ],
  minimum_deposit: 1,
  visibility: "public",
  fork_cost: 10,
  strategy_address: zeroAddress,
  strategies: {
    swap_to_single: [
      "If a token has the highest number of positive social events, swap all other supported tokens into this positively trending token.",
      "This strategy focuses on capitalizing on tokens that gain traction due to strong market sentiment, news, or social media hype.",
      "For example, if a well-known investor or celebrity tweets that they are buying USDT, swap other tokens such as SONIC to USDT to take advantage of the trend.",
      "Positive events can include high-profile endorsements, major partnerships, regulatory approvals, or increased adoption.",
      "This method ensures that the portfolio is optimized for maximum growth by holding assets that are gaining momentum.",
    ],
    swap_to_many: [
      "If a token experiences the most negative social events, swap that token into other supported tokens evenly.",
      "This approach minimizes exposure to assets suffering from market downturns, negative sentiment, or bad press.",
      "For example, if a major influencer announces they are selling USDT or there is negative news like a hack or regulation issue, swap USDT to SONIC and other supported tokens.",
      "Negative events can include large sell-offs, security breaches, legal concerns, or public distrust in the asset.",
      "By distributing the affected token's value across multiple assets, risk is mitigated, and portfolio stability is maintained.",
    ],
    adjust_split_ratio: [
      "If a token has stronger potential or greater influence, recalculate the allocation ratio among supported tokens.",
      "The ratio is adjusted based on the token\u2019s market impact, social sentiment, and perceived future value.",
      "For example, if USDT is showing higher adoption and demand than SONIC, adjust the portfolio split to 80% USDT and 20% SONIC.",
      "This strategy allows dynamic portfolio adjustments, ensuring optimal distribution based on market trends and social influence.",
      "The allocation bias can be weighted using machine learning or predefined rules to emphasize tokens with greater potential.",
      "A flexible allocation model ensures the best-performing tokens receive the highest percentage in the portfolio while minimizing exposure to weaker assets.",
    ],
    none: [
      "If there are no significant positive or negative social events, no action is taken.",
      "This strategy avoids unnecessary trades, reducing transaction fees and preventing overtrading.",
      "By maintaining the current portfolio balance, the system ensures stability when no market-moving events are detected.",
      "No trades are executed unless a threshold of significance is met, ensuring decisions are based on meaningful market signals.",
      "This approach is useful during periods of low volatility, preventing reaction to minor fluctuations that do not impact overall market sentiment.",
    ],
  },
  creator: undefined,
  base_strategy_address: undefined,
};

export const tokens: Token[] = [
  {
    name: "Sonic",
    symbol: "S",
    image: "/images/sonic.png",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  },
  {
    name: "Bitcoin",
    symbol: "WBTC",
    image: "/images/wbtc.png",
    address: "0xBF67F8f661DAE74047045A31FC020b1b17640B50",
  },
  {
    name: "Ethereum",
    symbol: "WETH",
    image: "/images/weth.png",
    address: "0x5321f62032f5Cd588d5a524037672A4018B68277",
  },
];

export const llms: LLM[] = [
  {
    name: "OpenAI",
    model: "gpt-4o-mini",
    image: "/images/openai.png",
  },
  {
    name: "Galadriel",
    model: "gpt-4o-mini",
    image: "/images/galadriel.png",
  },
  {
    name: "Hyperbolic",
    model: "gpt-4o-mini",
    image: "/images/hyperbolic.png",
  },
  {
    name: "XAI",
    model: "gpt-4o-mini",
    image: "/images/xai.png",
  },
];

export const taskSources = ["twitter", "discord"];

export const taskTypes = ["Twitter", "Discord"];
