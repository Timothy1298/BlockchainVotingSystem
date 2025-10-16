FROM node:20-alpine AS build
WORKDIR /usr/src/app
ARG VITE_ENABLE_MOCK_WALLET=false
ENV VITE_ENABLE_MOCK_WALLET=${VITE_ENABLE_MOCK_WALLET}
COPY package*.json ./
# install deps, allow legacy peer deps to avoid CI build-time peer conflicts
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
# no need to install application deps; serve is installed globally below
COPY --from=build /usr/src/app/dist ./dist
# use a tiny static server
RUN npm i -g serve@14 --omit=dev
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
