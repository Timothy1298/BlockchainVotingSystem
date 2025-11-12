FROM node:18-bullseye
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production
COPY server/ ./
CMD ["npm", "run", "start"]
