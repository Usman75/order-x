import React, { useState, useEffect } from "react";
import Header from './Header.js';
import Footer from './Footer.js';
import Wallet from './Wallet.js';
import NewOrder from './NewOrder.js';
import AllOrders from './AllOrders.js';
import MyOrders from './MyOrders.js';
import AllTrades from './AllTrades.js';
import AddToken from './AddToken.js';

const SIDE = {
  BUY: 0,
  SELL: 1
};

function App({web3, accounts, contracts}) {
  const [tokens, setTokens] = useState([]);
  const [user, setUser] = useState({
    accounts: [],
    balances: {
      tokenOrderx: 0,
      tokenWallet: 0
    },
    selectedToken: undefined
  });
  const [orders, setOrders] = useState({
    buy: [],
    sell: []
  });
  const [trades, setTrades] = useState([]);
  const [listener, setListener] = useState(undefined);

  const getBalances = async (account, token) => {
    const tokenOrderx = await contracts.orderx.methods
      .traderBalances(account, web3.utils.fromAscii(token.ticker))
      .call();
    const tokenWallet = await contracts[token.ticker].methods
      .balanceOf(account)
      .call();
    return {tokenOrderx, tokenWallet};
  }

  const getOrders = async token => {
    const orders = await Promise.all([
      contracts.orderx.methods
        .getOrders(web3.utils.fromAscii(token.ticker), SIDE.BUY)
        .call(),
      contracts.orderx.methods
        .getOrders(web3.utils.fromAscii(token.ticker), SIDE.SELL)
        .call(),
    ]);
    return {buy: orders[0], sell: orders[1]};
  }

  const listenToTrades = token => {
    const tradeIds = new Set();
    setTrades([]);
    const listener = contracts.orderx.events.NewTrade(
      {
        filter: {ticker: web3.utils.fromAscii(token.ticker)},
        fromBlock: 0
      })
      .on('data', newTrade => {
        if(tradeIds.has(newTrade.returnValues.tradeId)) return;
        tradeIds.add(newTrade.returnValues.tradeId);
        setTrades(trades => ([...trades, newTrade.returnValues]));
      });
    setListener(listener);
  }

  const selectToken = token => {
    setUser({...user, selectedToken: token});
  }

  const deposit = async amount => {
    await contracts[user.selectedToken.ticker].methods
      .approve(contracts.orderx.options.address, amount)
      .send({from: user.accounts[0]});
    await contracts.orderx.methods
      .deposit(amount, web3.utils.fromAscii(user.selectedToken.ticker))
      .send({from: user.accounts[0]});
    const balances = await getBalances(
      user.accounts[0],
      user.selectedToken
    );
    setUser(user => ({ ...user, balances}));
  }

  const withdraw = async amount => {
    await contracts.orderx.methods
      .withdraw(
        amount, 
        web3.utils.fromAscii(user.selectedToken.ticker)
      )
      .send({from: user.accounts[0]});
    const balances = await getBalances(
      user.accounts[0],
      user.selectedToken
    );
    setUser(user => ({ ...user, balances}));
  }

  const createMarketOrder = async (amount, side) => {
    await contracts.orderx.methods
      .createMarketOrder(
        web3.utils.fromAscii(user.selectedToken.ticker),
        amount,
        side
      )
      .send({from: user.accounts[0]});
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  }

  const createLimitOrder = async (amount, price, side) => {
    await contracts.orderx.methods
      .createLimitOrder(
        web3.utils.fromAscii(user.selectedToken.ticker),
        amount,
        price,
        side
      )
      .send({from: user.accounts[0]});
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  }
  const addNewToken = async (ticker, tokenAddress) => {
    const result= await contracts.orderx.methods
    .addToken(
      ticker,
      tokenAddress).send({from:user.accounts[0]});
      console.log(result);
  }

  useEffect(() => {
    const init = async () => {
      const rawTokens = await contracts.orderx.methods.getTokens().call(); 
      const tokens = rawTokens.map(token => ({
        ...token,
        ticker: web3.utils.hexToUtf8(token.ticker)
      }));
      const [balances, orders] = await Promise.all([
        getBalances(accounts[0], tokens[0]),
        getOrders(tokens[0]),
      ]);
      listenToTrades(tokens[0])
      setTokens(tokens);
      setUser({accounts, balances, selectedToken: tokens[0]});
      setOrders(orders);
    }
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      const [balances, orders] = await Promise.all([
        getBalances(
          user.accounts[0], 
          user.selectedToken
        ),
        getOrders(user.selectedToken),
      ]);
      listenToTrades(user.selectedToken);
      setUser(user => ({ ...user, balances}));
      setOrders(orders);
    }
    if(typeof user.selectedToken !== 'undefined') {
      init();
    }
  }, [user.selectedToken], () => {
    listener.unsubscribe();
  });

  if(typeof user.selectedToken === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <div id="app">
      <Header
        contracts={contracts}
        tokens={tokens}
        user={user}
        selectToken={selectToken}
      />
      <main className="container-fluid">
        <div className="row">
          <div className="col-sm-4 first-col">
            <Wallet 
              user={user}
              deposit={deposit}
              withdraw={withdraw}
            />
            {user.selectedToken.ticker !== 'BUSD' ? (
              <NewOrder 
                createMarketOrder={createMarketOrder}
                createLimitOrder={createLimitOrder}
              />
            ) : null}
          </div>
          {user.selectedToken.ticker !== 'BUSD' ? (
            <div className="col-sm-8">
              <AllTrades 
                trades={trades}
              />
              <AllOrders 
                orders={orders}
              />
              <MyOrders 
                orders={{
                  buy: orders.buy.filter(
                    order => order.trader.toLowerCase() === accounts[0].toLowerCase()
                  ),
                  sell: orders.sell.filter(
                    order => order.trader.toLowerCase() === accounts[0].toLowerCase()
                  )
                }}
              />
              {user.accounts[0] === '0xF09fA55D7c2F0064Ac5156B8f2ca4e8E321CbDbc'?(
              <AddToken
              addNewToken= {addNewToken}
              /> ): null}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
