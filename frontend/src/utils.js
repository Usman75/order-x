import Web3 from 'web3';
import Orderx from './contracts/Orderx.json';
import ERC20Abi from './ERC20Abi.json';

const getWeb3 = () => {
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "http://localhost:9545"
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });
};

const getContracts = async web3 => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = Orderx.networks[networkId];
  const orderx = new web3.eth.Contract(
    Orderx.abi,
    // deployedNetwork && deployedNetwork.address,
    '0xFb2659C50778Ce810124B2b322dED92a7233C3eC'
  );
  const tokens = await orderx.methods.getTokens().call();
  const tokenContracts = tokens.reduce((acc, token) => ({
    ...acc,
    [web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(
      ERC20Abi,
      token.tokenAddress
    )
  }), {});
  return { orderx, ...tokenContracts };
}

export { getWeb3, getContracts };
