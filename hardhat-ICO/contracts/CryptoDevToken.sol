// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDev.sol";

contract CryptoDevToken is ERC20, Ownable {
  ICryptoDev CryptoDevsNFT;
  uint256 public constant tokensPerNFT = 10 * 10 ** 18;
  uint256 public constant tokenPrice = 0.001 ether;
  uint256 public constant maxTotalSupply = 10000 * 10 ** 18;
  // check if the nft token has claimed to avoid claiming twice
  mapping(uint256 => bool) public tokenIdsClaimed;

  constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", " CDT") {
    CryptoDevsNFT = ICryptoDev(_cryptoDevsContract);
  }

  // public mint of token for people without the Nft
  function mint(uint256 amount) public payable {
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount, "Ether not sufficient");
    uint256 amountWithDecimals = amount * 10 ** 18;
    require(
      totalSupply() + amountWithDecimals <= maxTotalSupply,
      "Exceeds the max total supply availabe"
    );
    _mint(msg.sender, amountWithDecimals);
  }

  function claim() public {
    address sender = msg.sender;
    uint256 balance = CryptoDevsNFT.balanceOf(sender);
    require(balance > 0, "You dont own crypto devs NFT");
    uint256 amount = 0;
    for (uint256 i = 0; i < balance; i++) {
      // works with the mapping to check if nft has claimed
      uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
      if (!tokenIdsClaimed[tokenId]) {
        amount += 1;
        tokenIdsClaimed[tokenId] = true;
      }
    }

    require(amount > 0, "You have already claimed you tokens");
    _mint(msg.sender, amount * tokensPerNFT);
  }

  receive() external payable {}

  fallback() external payable {}
}
