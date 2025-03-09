import { walletConnect } from "@wagmi/connectors";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { sonic } from "viem/chains";

const metadata = {
  name: "EdgerAI",
  description: "EdgerAI",
  url: "https://edgerai.xyz",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const chains = [sonic];

export const config = defaultWagmiConfig({
  // @ts-ignore
  chains,
  projectId: import.meta.env.VITE_PROJECT_ID,
  metadata,
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_PROJECT_ID,
    }),
  ],
});
