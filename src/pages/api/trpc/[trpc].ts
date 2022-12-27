/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { formProc, publicProcedure, router } from "~/server/trpc";

const postsDb = [
  {
    id: "1",
    title: "hello world",
  },
];

const post = router({
  list: publicProcedure.query(() => postsDb),
  add: formProc
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation((opts) => {
      postsDb.push({
        ...opts.input,
        id: Math.random().toString(),
      });
      return postsDb;
    }),
});

const appRouter = router({
  post,
  getFormProcInput: publicProcedure
    .input(
      z.object({
        path: z.string(),
      }),
    )
    .query(({ input }) => {
      const procedures = appRouter._def.procedures as any;
      return procedures;
    }),
});

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
