FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json vitest.config.ts ./
COPY src ./src
COPY tests ./tests
RUN npm run build

FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

EXPOSE 8092

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8092/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/cli.js", "serve", "--host", "0.0.0.0", "--port", "8092"]
