pragma solidity 0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';

contract Cake is ERC20, ERC20Detailed {
  constructor() ERC20Detailed('CAKE', 'PancakeSwap mock token', 18) public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}
