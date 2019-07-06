FROM node:latest
WORKDIR /app/
COPY package.json src/ /app/
RUN npm update && npm install && rm -rf /var/lib/apt/lists/*

FROM node:slim
WORKDIR /app/
COPY --from=0 /app/ .
CMD ["node", "server.js"]