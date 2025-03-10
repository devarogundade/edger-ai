import type { Hex } from "viem";

const Converter = {
  splitNumber(total: number, n: number): number[] {
    if (n <= 0) throw new Error("n must be greater than 0");

    let parts: number[] = [];
    let sum = 0;

    // Generate n-1 random numbers
    for (let i = 0; i < n - 1; i++) {
      let value = Math.floor(Math.random() * (total - sum - (n - i - 1))) + 1; // Ensure at least 1
      parts.push(value);
      sum += value;
    }

    // Last value to balance the sum to total
    parts.push(total - sum);

    return parts;
  },

  validateEmail: (email: string) => {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  fineAddress: function (hash: Hex, space: number) {
    if (hash.length == 0) return "- - - - -";
    return (
      hash.substring(0, space) +
      "..." +
      hash.substring(hash.length - space, hash.length)
    );
  },

  formatNumber: function (value: number) {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + "b";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + "m";
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1) + "k";
    } else {
      return value.toString();
    }
  },

  toMoney: function (amount: number, max = null) {
    let maxF = max ? max : 8;

    if (amount > 1) {
      maxF = 5;
    }

    if (amount > 10) {
      maxF = 4;
    }

    if (amount > 200) {
      maxF = 3;
    }

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: maxF,
    });

    return formatter.format(amount).replace("$", "");
  },

  fullMonth: function (date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      minute: "2-digit",
      hour: "2-digit",
      day: "2-digit",
      month: "short",
      hour12: false,
    };
    return date.toLocaleString("en-US", options);
  },

  nFormatter: function (amount: number, digits: number) {
    if (amount > 1000) return this.toMoney(amount);

    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return amount >= item.value;
      });
    const result = item
      ? (amount / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
    return result.replace("$", "");
  },
};

export default Converter;
