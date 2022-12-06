const { ethers } = require("hardhat");

const { CRYPTO_DEV_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const cryptoDevTokenContract = await ethers.getContractFactory(
    "CryptoDevToken"
  );
  const deployCryptoDevTokenContract = await cryptoDevTokenContract.deploy(
    CRYPTO_DEV_NFT_CONTRACT_ADDRESS
  );
  console.log(
    `the contract address is ${deployCryptoDevTokenContract.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
