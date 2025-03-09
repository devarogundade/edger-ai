import { defineStore } from "pinia";

export const useWalletStore = defineStore("wallet", {
  state: () => ({
    address: null as `0x${string}` | null,
    sBalance: 0 as number,
  }),
  actions: {
    setAddress(newAddress: `0x${string}` | null) {
      this.address = newAddress;
    },
    setSBalance(newSBalance: number) {
      this.sBalance = newSBalance;
    },
  },
});
