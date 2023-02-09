import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { nounsDaoABI } from "../../../generated";
import type { BigNumber } from "ethers";
import { Contract, ethers } from "ethers";

const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  process.env.NEXT_PUBLIC_ALCHEMY_KEY
);

const contract = new Contract(
  "0x6f3E6272A167e8AcCb32072d08E0957F9c79223d",
  nounsDaoABI,
  provider
);

export const propsInfoRouter = createTRPCRouter({
  getAllProps: publicProcedure.query(async () => {
    const propNums = (await contract.proposalCount()) as BigNumber;
    const parsePropNums = parseInt(propNums?._hex.toString());
    const events = await contract.queryFilter("ProposalCreated", 12985453);

    events.map(async (event) => {
      if (!event.args || events.length !== parsePropNums) {
        return {
          error: "could not ingest contract event data",
        };
      }
      const propIdHex = event.args.id as BigNumber;
      const propId = parseInt(propIdHex._hex.toString());
      const txHash = event.transactionHash;
      const proposer = event?.args.proposer as string;
      const description = event?.args.description as string;
      const targets = event?.args.targets as string[];
      const propInfo = await contract.proposals(propId) as number;
      const wasExecuted = propInfo.executed as boolean;

      console.log({
        propId,
        txHash,
        proposer,
        description: description.slice(0, 140),
        targets,
        wasExecuted,
      });
    });

    return {
      data: [],
    };
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
