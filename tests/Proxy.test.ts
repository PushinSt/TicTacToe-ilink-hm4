import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareSigners, prepareERC20Tokens, prepareProxy, prepareTicTacToe, prepareWallet } from "./utils/prepare"
import { BigNumber } from "ethers"


use(waffle.solidity)
describe("Proxy contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareERC20Tokens(this, this.bob)
        //await prepareTicTacToe(this, this.bob)
        await prepareWallet(this, this.bob)
        await prepareProxy(this, this.bob)
        await this.token1.connect(this.bob).transfer(this.token6.address, 1000000);
    })

    describe("Testing #1", function () {
        it("points to an implementation contract", async function () {
            expect(await this.token6.getImplementation()).to.eq(this.Tic_v1.address);
            expect(await this.myProxy.connect(this.bob).getCommission()).to.eq(10);
            expect(await this.myProxy.balancePlayer(this.token6.address)).to.eq(10 ** 6)
        })

        it("сheck functionality before upgrading", async function () {
            await this.myProxy.connect(this.misha).incGameAcc({ value: ethers.utils.parseUnits((2 * this.amount1).toString(), "finney") });
            await this.myProxy.connect(this.tema).incGameAcc({ value: ethers.utils.parseUnits((2 * this.amount1).toString(), "finney") });
            expect(await this.myProxy.balancePlayer(this.token6.address)).to.eq(10 ** 6 - 4 * this.amount1)
            await this.token1.connect(this.misha).approve(this.token6.address, this.amount1); // Миша разрешает отправку ERC на контракт
            await this.myProxy.connect(this.misha).withdrawalGameAcc(this.amount1);
            expect(await this.myProxy.balancePlayer(this.token6.address)).to.eq(10 ** 6 - 3 * this.amount1)
            await this.token1.connect(this.misha).approve(this.token6.address, this.bid); // Миша разрешает отправку ERC на контракт
            await this.myProxy.connect(this.misha).createGame(this.timeWait[0], this.bid); //  Миша создает игру и делает ставку
            await this.myProxy.connect(this.misha).createGame(this.timeWait[0], 0, { value: ethers.utils.parseUnits("10", "finney") });
            await this.token1.connect(this.tema).approve(this.token6.address, this.bid);
            await this.myProxy.connect(this.tema).joinGame(0);
            await this.myProxy.connect(this.tema).joinGame(1, { value: ethers.utils.parseUnits("10", "finney") });
        })

        it("Check update contract", async function () {
            expect(await this.myProxy.getTest()).to.eq(10) //getTest
            await this.myProxy.connect(this.misha).createGame(this.timeWait[0], 0, { value: ethers.utils.parseUnits("10", "finney") });
            await this.myProxy.connect(this.tema).createGame(this.timeWait[0], 0, { value: ethers.utils.parseUnits("10", "finney") });
            await this.myProxy.connect(this.bob).createGame(this.timeWait[0], 0, { value: ethers.utils.parseUnits("10", "finney") });
            expect((await this.myProxy.statisticsGames())[0]).to.eq(BigNumber.from(3)); // Создано три игры

            await this.token6.setImplementation(this.Tic_v3.address);
            expect(await this.myProxy.getTest()).to.eq(20) //getTest
            expect((await this.myProxy.statisticsGames())[0]).to.eq(BigNumber.from(3)); // Создано три игры
        })



        it("check increase game account", async function () {
            await this.token6.setImplementation(this.Tic_v3.address);
            expect(await this.myProxy.getTest()).to.eq(20) //getTest
            

            await this.tema.sendTransaction({
                to: this.token6.address,
                value: ethers.utils.parseUnits(this.amount1.toString(), "finney"),
            }); // Тёма закидывает на свой счет 100 токенов

            expect(await this.myProxy.balancePlayer(this.tema.address)).to.eq(BigNumber.from(this.amount1)); 



        })


        it("cannot be initialized twice", async function () {
            await expect(this.myProxy.initialize(this.token1.address)).to.be.revertedWith("Initializable: contract is already initialized");
        })

        it("address collision", async function () {
            await this.myProxy.setWallet(this.token5.address);
            expect(await this.myProxy.getWallet()).to.eq(this.token5.address);
            await this.token6.setImplementation(this.Tic_v2.address);
            expect(await this.myProxy.getWallet()).to.eq(this.token1.address);
        })



        it("check cancel game", async function () {
            await this.myProxy.connect(this.tema).incGameAcc({ value: ethers.utils.parseUnits(this.amount1.toString(), "finney") });  // Тёма закидывает на свой счет 100 токенов
            await this.myProxy.connect(this.misha).incGameAcc({ value: ethers.utils.parseUnits(this.amount1.toString(), "finney") });  // Миша закидывает на свой счет 100 токенов
            await this.myProxy.setWallet(this.token5.address);
            await this.token1.connect(this.tema).approve(this.token6.address, this.bid); // Тёма разрешает отправку ERC на контракт
            await this.myProxy.connect(this.tema).createGame(this.timeWait[0], this.bid);
            this.result2 = await this.token1.balanceOf(this.tema.address);
            await this.myProxy.connect(this.tema).cancelGame(0);
            this.result3 = await this.token1.balanceOf(this.tema.address);
            expect(this.result3).to.eq(BigNumber.from(this.result2).add(BigNumber.from(this.bid)));
            await this.myProxy.connect(this.tema).createGame(this.timeWait[0], 0, { value: ethers.utils.parseUnits(this.bid.toString(), "finney") });
            this.result2 = await ethers.provider.getBalance(this.tema.address)
            await this.myProxy.connect(this.tema).cancelGame(1);
            expect(await ethers.provider.getBalance(this.tema.address)).to.above(BigNumber.from(this.result2));
            await this.token1.connect(this.tema).approve(this.token6.address, this.bid);
            await this.myProxy.connect(this.tema).createGame(this.timeWait[0], this.bid);
            await expect(this.myProxy.connect(this.misha).cancelGame(2)).to.be.reverted;
            await this.token1.connect(this.misha).approve(this.token6.address, this.bid);
            await this.myProxy.connect(this.misha).joinGame(2)
            await expect(this.myProxy.connect(this.tema).cancelGame(0)).to.be.reverted;
            await expect(this.myProxy.connect(this.tema).cancelGame(1)).to.be.reverted;
            await expect(this.myProxy.connect(this.tema).cancelGame(2)).to.be.reverted;
        })


    })



})


