FROM node:16-bullseye-slim as base

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
        build-essential \
        ca-certificates \
        git \
        python3 && \
    rm -fr /var/lib/apt/lists/* && \
    rm -rf /etc/apt/sources.list.d/*

RUN npm install --global --quiet npm truffle
RUN mkdir -p /home/app
WORKDIR /home/app
RUN git clone http://github.com/lacchain/permissioning-smart-contracts.git
WORKDIR /home/app/permissioning-smart-contracts
RUN git checkout feature/gasModel
RUN rm -rf package.json package-lock.json
COPY package.json /home/app/permissioning-smart-contracts/package.json
COPY truffle-config.js /home/app/permissioning-smart-contracts/truffle-config.js
RUN yarn install
RUN truffle compile
ENV NODE_INGRESS_CONTRACT_ADDRESS=0x0000000000000000000000000000000000009999
ENV ACCOUNT_INGRESS_CONTRACT_ADDRESS=0x0000000000000000000000000000000000008888
ENV BESU_NODE_PERM_KEY=8b2c4ca73a4ce874432997a1a0851ff11283996f512b39f2640d009d8dc8b408
ENV BESU_NODE_PERM_ENDPOINT=http://127.0.0.1:4545

CMD ["truffle", "version"]