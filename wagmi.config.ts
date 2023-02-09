import "dotenv/config";

import { defineConfig, loadEnv } from "@wagmi/cli";
import { actions, etherscan, react } from "@wagmi/cli/plugins";
import { env } from "./src/env.mjs";
import { mainnet, goerli } from "wagmi/chains";
import { nounsDaoABI } from "./src/core/NousDAOAbi.js";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    react(),
    actions({
      readContract: true,
    }),
  ],

  contracts: [
    {
      name: "NounsDAO",
      abi: nounsDaoABI,
      address: "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
    },
  ],
});
