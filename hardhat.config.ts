import "dotenv/config"
import { HardhatUserConfig } from "hardhat/types"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "hardhat-deploy"
import "@typechain/hardhat"
import "hardhat-abi-exporter"
import "@nomiclabs/hardhat-etherscan"
import "@openzeppelin/hardhat-upgrades"
import "solidity-coverage"
import "hardhat-gas-reporter"
import "./tasks"

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [
            {
                version: "0.8.9",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    paths: {
        tests: "./tests",
        artifacts: "./build/artifacts",
        cache: "./build/cache",
        deployments: "./build/deployments",
    },
    typechain: {
        outDir: "./build/typechain",
    },
    gasReporter: {
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: process.env.TOKEN,
        gasPriceApi: process.env.GAS_PRICE_API,
        enabled: process.env.REPORT_GAS === "true",
        maxMethodDiff: 10,
    },
    networks: {
        hardhat: {
        },
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
            //gas: 6000000, 
        },

        kovan: {
            url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
            //gas: 6000000, 
        },


        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
            //gas: 85000000000, 
            gasPrice: 500000000000,
        },
        avalanche: {
            url: "https://api.avax.network/ext/bc/C/rpc",
            gasPrice: 85000000000,
            gasMultiplier: 2,
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
        },
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            gasMultiplier: 2,
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
        },
    },
    namedAccounts: {
        deployer: 0,
        admin: 1,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "API_KEY_WEB",
    },
    abiExporter: {
        path: "./build/abis",
        runOnCompile: true,
        clear: true,
        flat: true,
        only: [],
        spacing: 2,
        pretty: false,
    },
}

export default config
