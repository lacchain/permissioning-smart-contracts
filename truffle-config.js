const HDWalletProvider = require('truffle-hdwallet-provider');
const path = require("path");
const dotenv = require('dotenv');

dotenv.config();

/* The adress used when sending transactions to the node */
var address = process.env.BESU_NODE_PERM_ACCOUNT;

/* The private key associated with the address above */
var privateKey = process.env.BESU_NODE_PERM_KEY;

/* The endpoint of the Ethereum node */
var endpoint = process.env.BESU_NODE_PERM_ENDPOINT;
if (endpoint === undefined) {
  endpoint = "http://34.75.103.207:4545";
}

module.exports = {
  networks: {
    development: {
     provider: () => new HDWalletProvider(privateKey, endpoint),
     host: "34.75.103.207",
     port: 4545,
     network_id: "*",
     from: address,
     gasPrice: 0
    },
    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
    }
  },

  contracts_build_directory: path.join(__dirname, "src/chain/abis"),

  compilers: {
    solc: {
      version: "0.5.9",
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       },
      }
    }
  },

  mocha: {
    useColors: true,
    reporter: 'mocha-multi-reporters',
    reporterOptions: {
      configFile: './mocha-reporter-config.json',
    },
  },

  plugins: ['solidity-coverage']
};
