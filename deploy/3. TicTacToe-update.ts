
import { HardhatRuntimeEnvironment } from 'hardhat/types';

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  console.log(`ChainId: ${await hre.getChainId()}`)

  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer, alice } = await getNamedAccounts();
  const balance = await ethers.provider.getBalance(deployer)

  console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)

  await deploy('TicTacToe', {
    args: [
    ],
    from: deployer,
    log: true,
  });

};

module.exports.tags = ["TicTacToe-update"];

