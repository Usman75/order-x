const { expectRevert } = require('@openzeppelin/test-helpers');
const Busd = artifacts.require('mocks/Busd.sol');
const Wbnb = artifacts.require('mocks/Wbnb.sol');
const Cake = artifacts.require('mocks/Cake.sol');
const Dot = artifacts.require('mocks/Dot.sol');
const Orderx = artifacts.require('Orderx.sol');

const SIDE = {
  BUY: 0,
  SELL: 1
};

contract('Orderx', (accounts) => {
  let busd, wbnb, cake, dot, orderx;
  const [trader1, trader2] = [accounts[1], accounts[2]];
  const [BUSD, WBNB, CAKE, DOT] = ['BUSD', 'WBNB', 'CAKE', 'DOT']
    .map(ticker => web3.utils.fromAscii(ticker));

  beforeEach(async() => {
    ([busd, wbnb, cake, dot] = await Promise.all([
      Busd.new(), 
      Wbnb.new(), 
      Cake.new(), 
      Dot.new()
    ]));
    orderx = await Orderx.new();
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
  });

  it('should deposit tokens', async () => {
    const amount = web3.utils.toWei('100');

    await orderx.deposit(
      amount,
      BUSD,
      {from: trader1}
    );

    const balance = await orderx.traderBalances(trader1, BUSD);
    assert(balance.toString() === amount);
  });

  it('should NOT deposit tokens if token does not exist', async () => {
    await expectRevert(
      orderx.deposit(
        web3.utils.toWei('100'),
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        {from: trader1}
      ),
      'this token does not exist'
    );
  });

  it('should withdraw tokens', async () => {
    const amount = web3.utils.toWei('100');

    await orderx.deposit(
      amount,
      BUSD,
      {from: trader1}
    );

    await orderx.withdraw(
      amount,
      BUSD,
      {from: trader1}
    );

    const [balanceOrderx, balanceBusd] = await Promise.all([
      orderx.traderBalances(trader1, BUSD),
      busd.balanceOf(trader1)
    ]);
    assert(balanceOrderx.isZero());
    assert(balanceBusd.toString() === web3.utils.toWei('1000')); 
  });

  it('should NOT withdraw tokens if token does not exist', async () => {
    await expectRevert(
      orderx.withdraw(
        web3.utils.toWei('1000'),
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        {from: trader1}
      ),
      'this token does not exist'
    );
  });

  it('should NOT withdraw tokens if balance too low', async () => {
    await orderx.deposit(
      web3.utils.toWei('100'),
      BUSD,
      {from: trader1}
    );

    await expectRevert(
      orderx.withdraw(
        web3.utils.toWei('1000'),
        BUSD,
        {from: trader1}
      ),
      'balance too low'
    );
  });

  it('should create limit order', async () => {
    await orderx.deposit(
      web3.utils.toWei('100'),
      BUSD,
      {from: trader1}
    );
  
    await orderx.createLimitOrder(
      CAKE,
      web3.utils.toWei('10'),
      10,
      SIDE.BUY,
      {from: trader1}
    );
  
    let buyOrders = await orderx.getOrders(CAKE, SIDE.BUY);
    let sellOrders = await orderx.getOrders(CAKE, SIDE.SELL);
    assert(buyOrders.length === 1);
    assert(buyOrders[0].trader === trader1);
    assert(buyOrders[0].ticker === web3.utils.padRight(CAKE, 64));
    assert(buyOrders[0].price === '10');
    assert(buyOrders[0].amount === web3.utils.toWei('10'));
    assert(sellOrders.length === 0);
  
    await orderx.deposit(
      web3.utils.toWei('200'),
      BUSD,
      {from: trader2}
    );
  
    await orderx.createLimitOrder(
      CAKE,
      web3.utils.toWei('10'),
      11,
      SIDE.BUY,
      {from: trader2}
    );
  
    buyOrders = await orderx.getOrders(CAKE, SIDE.BUY);
    sellOrders = await orderx.getOrders(CAKE, SIDE.SELL);
    assert(buyOrders.length === 2);
    assert(buyOrders[0].trader === trader2);
    assert(buyOrders[1].trader === trader1);
    assert(sellOrders.length === 0);
  
    await orderx.deposit(
      web3.utils.toWei('200'),
      BUSD,
      {from: trader2}
    );
  
    await orderx.createLimitOrder(
      CAKE,
      web3.utils.toWei('10'),
      9,
      SIDE.BUY,
      {from: trader2}
    );
  
    buyOrders = await orderx.getOrders(CAKE, SIDE.BUY);
    sellOrders = await orderx.getOrders(CAKE, SIDE.SELL);
    assert(buyOrders.length === 3);
    assert(buyOrders[0].trader === trader2);
    assert(buyOrders[1].trader === trader1);
    assert(buyOrders[2].trader === trader2);
    assert(sellOrders.length === 0);
  });

  it('should NOT create limit order if token balance too low', async () => {
    await orderx.deposit(
      web3.utils.toWei('99'),
      CAKE,
      {from: trader1}
    );

    await expectRevert(
      orderx.createLimitOrder(
        CAKE,
        web3.utils.toWei('100'),
        10,
        SIDE.SELL,
        {from: trader1}
      ),
      'token balance too low'
    );
  });

  it('should NOT create limit order if busd balance too low', async () => {
    await orderx.deposit(
      web3.utils.toWei('99'),
      BUSD,
      {from: trader1}
    );

    await expectRevert(
      orderx.createLimitOrder(
        CAKE,
        web3.utils.toWei('10'),
        10,
        SIDE.BUY,
        {from: trader1}
      ),
      'busd balance too low'
    );
  });

  it('should NOT create limit order if token is BUSD', async () => {
    await expectRevert(
      orderx.createLimitOrder(
        BUSD,
        web3.utils.toWei('1000'),
        10,
        SIDE.BUY,
        {from: trader1}
      ),
      'cannot trade BUSD'
    );
  });

  it('should NOT create limit order if token does not not exist', async () => {
    await expectRevert(
      orderx.createLimitOrder(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('1000'),
        10,
        SIDE.BUY,
        {from: trader1}
      ),
      'this token does not exist'
    );
  });

  it('should create market order & match', async () => {
    await orderx.deposit(
      web3.utils.toWei('100'),
      BUSD,
      {from: trader1}
    );
  
    await orderx.createLimitOrder(
      CAKE,
      web3.utils.toWei('10'),
      10,
      SIDE.BUY,
      {from: trader1}
    );
  
    await orderx.deposit(
      web3.utils.toWei('100'),
      CAKE,
      {from: trader2}
    );
  
    await orderx.createMarketOrder(
      CAKE,
      web3.utils.toWei('5'),
      SIDE.SELL,
      {from: trader2}
    );
  
    const balances = await Promise.all([
      orderx.traderBalances(trader1, BUSD),
      orderx.traderBalances(trader1, CAKE),
      orderx.traderBalances(trader2, BUSD),
      orderx.traderBalances(trader2, CAKE),
    ]);
    const orders = await orderx.getOrders(CAKE, SIDE.BUY);
    assert(orders.length === 1);
    assert(orders[0].filled = web3.utils.toWei('5'));
    assert(balances[0].toString() === web3.utils.toWei('50'));
    assert(balances[1].toString() === web3.utils.toWei('5'));
    assert(balances[2].toString() === web3.utils.toWei('50'));
    assert(balances[3].toString() === web3.utils.toWei('95'));
  });

  it('should NOT create market order if token balance too low', async () => {
    await expectRevert(
      orderx.createMarketOrder(
        CAKE,
        web3.utils.toWei('101'),
        SIDE.SELL,
        {from: trader2}
      ),
      'token balance too low'
    );
  });

  it('should NOT create market order if busd balance too low', async () => {
    await orderx.deposit(
      web3.utils.toWei('100'),
      CAKE,
      {from: trader1}
    );
  
    await orderx.createLimitOrder(
      CAKE,
      web3.utils.toWei('100'),
      10,
      SIDE.SELL,
      {from: trader1}
    );

    await expectRevert(
      orderx.createMarketOrder(
        CAKE,
        web3.utils.toWei('101'),
        SIDE.BUY,
        {from: trader2}
      ),
      'busd balance too low'
    );
  });

  it('should NOT create market order if token is BUSD', async () => {
    await expectRevert(
      orderx.createMarketOrder(
        BUSD,
        web3.utils.toWei('1000'),
        SIDE.BUY,
        {from: trader1}
      ),
      'cannot trade BUSD'
    );
  });

  it('should NOT create market order if token does not not exist', async () => {
    await expectRevert(
      orderx.createMarketOrder(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('1000'),
        SIDE.BUY,
        {from: trader1}
      ),
      'this token does not exist'
    );
  });
});
