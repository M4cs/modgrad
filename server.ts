import index from "./demo/index.html";

const server = Bun.serve({
  port: Number(Bun.env.PORT) || 4242,
  routes: {
    "/": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`\n  modgrad demo → ${server.url}\n`);
