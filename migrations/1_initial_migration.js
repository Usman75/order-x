const Busd = artifacts.require('mocks/Busd.sol');
const Wbnb = artifacts.require('mocks/Wbnb.sol');
const Cake = artifacts.require('mocks/Cake.sol');
const Dot = artifacts.require('mocks/Dot.sol');
const Orderx = artifacts.require("Orderx.sol");

const [BUSD, WBNB, CAKE, DOT] = ['BUSD', 'WBNB', 'CAKE', 'DOT']
  .map(ticker => web3.utils.fromAscii(ticker));

const SIDE = {
  BUY: 0,
  SELL: 1
};

module.exports = async function(deployer, _network, accounts) {
  const [trader1, trader2, trader3, trader4, _] = accounts;
  await Promise.all(
    [Busd, Wbnb, Cake, Dot, Orderx].map(contract => deployer.deploy(contract))
  );
  const [busd, wbnb, cake, dot, orderx] = await Promise.all(
    [Busd, Wbnb, Cake, Dot, Orderx].map(contract => contract.deployed())
  );

  await Promise.all([
    orderx.addToken(BUSD, busd.address),
    orderx.addToken(WBNB, wbnb.address),
    orderx.addToken(CAKE, cake.address),
    orderx.addToken(DOT, dot.address)
  ]);

  const amount = web3.utils.toWei('1000');
  const seedTokenBalance = async (token, trader) => {
    await token.faucet(trader, amount)
    await token.approve(
      orderx.address, 
      amount, 
      {from: trader}
    );
    const ticker = await token.name();
    await orderx.deposit(
      amount, 
      web3.utils.fromAscii(ticker),
      {from: trader}
    );
  };
  await Promise.all(
    [busd, wbnb, cake, dot].map(
      token => seedTokenBalance(token, trader1) 
    )
  );
  await Promise.all(
    [busd, wbnb, cake, dot].map(
      token => seedTokenBalance(token, trader2) 
    )
  );
  await Promise.all(
    [busd, wbnb, cake, dot].map(
      token => seedTokenBalance(token, trader3) 
    )
  );
  await Promise.all(
    [busd, wbnb, cake, dot].map(
      token => seedTokenBalance(token, trader4) 
    )
  );

  const increaseTime = async (seconds) => {
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: 0,
    }, () => {});
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 0,
    }, () => {});
  }

  //create trades
  await orderx.createLimitOrder(WBNB, 1000, 10, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(WBNB, 1000, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(WBNB, 1200, 11, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(WBNB, 1200, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(WBNB, 1200, 15, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(WBNB, 1200, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(WBNB, 1500, 14, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(WBNB, 1500, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(WBNB, 2000, 12, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(WBNB, 2000, SIDE.SELL, {from: trader2});

  await orderx.createLimitOrder(CAKE, 1000, 2, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(CAKE, 1000, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(CAKE, 500, 4, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(CAKE, 500, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(CAKE, 800, 2, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(CAKE, 800, SIDE.SELL, {from: trader2});
  await increaseTime(1);
  await orderx.createLimitOrder(CAKE, 1200, 6, SIDE.BUY, {from: trader1});
  await orderx.createMarketOrder(CAKE, 1200, SIDE.SELL, {from: trader2});

  //create orders
  await Promise.all([
    orderx.createLimitOrder(WBNB, 1400, 10, SIDE.BUY, {from: trader1}),
    orderx.createLimitOrder(WBNB, 1200, 11, SIDE.BUY, {from: trader2}),
    orderx.createLimitOrder(WBNB, 1000, 12, SIDE.BUY, {from: trader2}),

    orderx.createLimitOrder(CAKE, 3000, 4, SIDE.BUY, {from: trader1}),
    orderx.createLimitOrder(CAKE, 2000, 5, SIDE.BUY, {from: trader1}),
    orderx.createLimitOrder(CAKE, 500, 6, SIDE.BUY, {from: trader2}),

    orderx.createLimitOrder(DOT, 4000, 12, SIDE.BUY, {from: trader1}),
    orderx.createLimitOrder(DOT, 3000, 13, SIDE.BUY, {from: trader1}),
    orderx.createLimitOrder(DOT, 500, 14, SIDE.BUY, {from: trader2}),

    orderx.createLimitOrder(WBNB, 2000, 16, SIDE.SELL, {from: trader3}),
    orderx.createLimitOrder(WBNB, 3000, 15, SIDE.SELL, {from: trader4}),
    orderx.createLimitOrder(WBNB, 500, 14, SIDE.SELL, {from: trader4}),

    orderx.createLimitOrder(CAKE, 4000, 10, SIDE.SELL, {from: trader3}),
    orderx.createLimitOrder(CAKE, 2000, 9, SIDE.SELL, {from: trader3}),
    orderx.createLimitOrder(CAKE, 800, 8, SIDE.SELL, {from: trader4}),

    orderx.createLimitOrder(DOT, 1500, 23, SIDE.SELL, {from: trader3}),
    orderx.createLimitOrder(DOT, 1200, 22, SIDE.SELL, {from: trader3}),
    orderx.createLimitOrder(DOT, 900, 21, SIDE.SELL, {from: trader4}),
  ]);
};
