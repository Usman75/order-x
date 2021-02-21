pragma solidity 0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';

contract Dot is ERC20, ERC20Detailed {
  constructor() ERC20Detailed('DOT', 'Polkadot mock token', 18) public {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}
