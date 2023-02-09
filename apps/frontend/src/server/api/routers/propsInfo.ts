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

type PropData = {
  propId: number;
  txHash: string;
  proposer: string;
  description: string;
  targets: string[];
  wasExecuted: boolean;
};

export const propsInfoRouter = createTRPCRouter({
  getAllProps: publicProcedure.query(async ({ ctx }) => {
    try {
      const propNums = (await contract.proposalCount()) as BigNumber;
      const parsePropNums = parseInt(propNums?._hex.toString());
      const events = await contract.queryFilter("ProposalCreated", 12985453);

      const dbData = await Promise.all(
        events.map(async (event, idx) => {
          if (!event.args || events.length !== parsePropNums || idx >= 3) {
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
          const propInfo = (await contract.proposals(propId)) as number;
          const wasExecuted = propInfo.executed as boolean;

          return {
            propId,
            txHash,
            proposer,
            description: description.slice(0, 140),
            targets,
            wasExecuted,
          };
        })
      );

      console.log(dbData);
      return [];
    } catch (error) {
      console.error(error);
    }

    //   await ctx.prisma.propInfo.createMany({
    //     data: propsData,
    //   });
  }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
