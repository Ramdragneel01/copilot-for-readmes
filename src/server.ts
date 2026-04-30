import Fastify, { FastifyInstance } from "fastify";

import { analyzeRepo } from "./analyze";
import { generateReadme } from "./generate";

export interface ServerOptions {
  host?: string;
  port?: number;
}

export function createServer(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ status: "ok", service: "copilot-for-readmes" }));
  app.get("/ready", async () => ({ status: "ready" }));

  app.post("/v1/analyze", async (request, reply) => {
    const body = (request.body as { repoPath?: string } | undefined) ?? {};
    try {
      const signals = await analyzeRepo(body.repoPath ?? process.cwd());
      return { signals };
    } catch (error) {
      reply.code(400);
      return { error: { message: (error as Error).message } };
    }
  });

  app.post("/v1/generate", async (request, reply) => {
    const body =
      (request.body as { repoPath?: string; projectName?: string; tagline?: string } | undefined) ?? {};
    try {
      const result = await generateReadme(body.repoPath ?? process.cwd(), {
        projectName: body.projectName,
        tagline: body.tagline
      });
      return result;
    } catch (error) {
      reply.code(400);
      return { error: { message: (error as Error).message } };
    }
  });

  return app;
}

export async function startServer(options: ServerOptions = {}): Promise<FastifyInstance> {
  const host = options.host ?? process.env.CFR_HOST ?? "0.0.0.0";
  const port = Number(options.port ?? process.env.CFR_PORT ?? 8092);
  const app = createServer();
  await app.listen({ host, port });
  return app;
}
