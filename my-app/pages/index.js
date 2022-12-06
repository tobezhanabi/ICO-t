import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useRef, useEffect } from "react";
import Web3Modal from "web3modal";
import { BigNumber, Contract, utils, providers } from "ethers";
import {
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfCryptoDeVTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async function (needSigner = false) {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change network to goerli");
      throw new Error("change to goerli network");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getTokenToBeClaimed = async function () {
    try {
      const provider = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (error) {
      console.log(error);
      setTokensToBeClaimed(zero);
    }
  };

  const getBalanceOfCryptoDevTokens = async function () {
    try {
      const provider = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfCryptoDevTokens(balance);
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalTokensMinted = async function () {
    try {
      const provider = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (error) {
      console.log(error);
    }
  };

  const mintCryptoDevToken = async function (amount) {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You minted crypto dev tokens, congrats!!");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokenToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };
  const claimCryptoDevTokens = async function () {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const tx = await tokenContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("successfully claimed crypto dev tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokenToBeClaimed();
    } catch (error) {
      console.log(error);
    }
  };

  const getOwner = async function () {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        provider
      );
      const _owner = await tokenContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        signer
      );
      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async function () {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokenToBeClaimed();
      withdrawCoins();
    }
  }, [walletConnected]);

  const renderButton = function () {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>loading ...</button>
        </div>
      );
    }
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button1} onClick={withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      );
    }
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of token"
            className={styles.input}
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          />
          <button
            className={styles.button}
            disabled={!(tokenAmount > 0)}
            onClick={() => mintCryptoDevToken(tokenAmount)}
          >
            Mint Tokens
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto dev ICO</title>
        <meta name="description" content="ICO-dapp"></meta>
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Welcome to crypto dev ICO</h1>
          <div className={styles.description}>
            You can claim or mint CryptoDev token
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfCryptoDeVTokens)}{" "}
                crypto dev tokens
              </div>

              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button className={styles.button} onClick={connectWallet}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Tobez</footer>
    </div>
  );
}
