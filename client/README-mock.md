# Building the client with Mock Wallet enabled

This document shows how to build a client Docker image that enables the mock wallet
for CI or local testing. The mock wallet prevents remote WalletConnect calls and
injects a minimal `window.ethereum` provider for E2E tests.

Build the image with the environment variable set at build time:

```bash
docker build --pull \
  --build-arg VITE_ENABLE_MOCK_WALLET=true \
  -t bv-client:mock .
```

Or use docker-compose to set the env and run the built image (example override):

```yaml
# docker-compose.override.mock.yml
version: '3.8'
services:
  client:
    build:
      context: ./client
      args:
        - VITE_ENABLE_MOCK_WALLET=true
    environment:
      - VITE_ENABLE_MOCK_WALLET=true
    ports:
      - '5173:5173'

```

Note: Vite embeds `import.meta.env` at build time. Ensure the build-arg or env is
present during `docker build` or when running `npm run build` so the mock connector
is included in the production bundle.
