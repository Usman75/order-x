pragma solidity 0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';

contract Busd is ERC20, ERC20Detailed {
  constructor() ERC20Detailed('BUSD', 'Binanace Stablecoin mock token', 18) public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}
