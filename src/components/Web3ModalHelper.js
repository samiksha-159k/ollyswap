import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { useState } from "react";
import { DAI_CONTRACT } from "./AssetContractABI";

const INITIAL_STATE = {
  fetching: false,
  address: "",
  web3: null,
  provider: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: null,
  showModal: false,
  pendingRequest: false,
  result: null,
};

const providerOptions = {
  walletConnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "d92aa38df8c441c5beda785607b37c85",
      chainId: 56,
      darkMode: true,
    },
    display: {
      name: "Mobile",
      logo: "__link_to_ollyswap_logo__",
      description: "Scan qrcode with your mobile wallet",
    },
  },
  trustWallet: {
    package: WalletConnectProvider,
    options: {
      infuraId: "d92aa38df8c441c5beda785607b37c85",
      chainId: 56,
      darkMode: true,
    },
    display: {
      name: "Mobile",
      logo: "__link_to_ollyswap_logo__",
      description: "Scan qrcode with your mobile wallet",
    },
  },
  coinbaseWallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "OllySwap", // Required
      infuraId: "d92aa38df8c441c5beda785607b37c85", // Required
      rpc: "", // Optional if `infuraId` is provided; otherwise it's required
      chainId: 56, // Optional. It defaults to 1 if not provided
      darkMode: true, // Optional. Use dark theme, defaults to false
    },
  },
  binanceChainWallet: {
    package: true,
    options: {
      chainId: 56,
      darkMode: true,
    },
  },
  metaMaskWallet: {
    package: true,
    options: {
      chainId: 56,
      darkMode: true,
    },
  },
};

const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions,
});

const [provider, setProvider] = useState(null);
const [web3, setWeb3] = useState(null);
const [tronWeb, setTronWeb] = useState(null);
const [network, setNetwork] = useState(null);
const [state, setState] = useState(INITIAL_STATE);

function isTronConnected() {
  return !!(window.tronWeb && window.tronWeb.defaultAddress.base58);
}

async function connectTronNetwork() {
  return new window.Promise(function (resolve, reject) {
    let timeLimit = 30 * 1000;
    let currentTime = 0;
    let timer = setInterval(function () {
      if (isTronConnected()) {
        window.tronWeb.on("addressChanged", async function () {
          await connectTronNetwork();
        });
        clearInterval(timer);
        resolve(true);
      } else {
        if (currentTime >= timeLimit) {
          window.tronWeb = null;
          clearInterval(timer);
          reject(false);
        }
        currentTime += 100;
      }
    }, 100);
  });
}

function initWeb3(provider) {
  const web3 = new Web3(provider);
  web3.eth.extend({
    methods: [
      {
        name: "chainId",
        call: "eth_chainId",
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });
  return web3;
}

async function componentDidMount() {
  if (web3Modal.cachedProvider) {
    await onWeb3Connect();
  }
}

const onWeb3Connect = async (provider_key) => {
  const provider = await web3Modal.connectTo(provider_key);

  await subscribeProvider(provider);

  await provider.enable();
  const web3 = initWeb3(provider);

  const accounts = await web3.eth.getAccounts();

  const address = accounts[0];

  const networkId = await web3.eth.net.getId();

  const chainId = await web3.eth.chainId();

  await setState({
    ...state,
    web3,
    provider,
    connected: true,
    address,
    chainId,
    networkId,
  });
  await getAccountAssets();
};

const apiGetAccountAssets = async () => {
  return null;
};

const getAccountAssets = async () => {
  const { address, chainId } = state;
  await setState({
    ...state,
    fetching: true,
  });
  try {
    // get account balances
    const assets = await apiGetAccountAssets(address, chainId);
    await setState({
      ...state,
      fetching: false,
      assets,
    });
  } catch (error) {
    console.error(error); // tslint:disable-line
    await setState({
      ...state,
      fetching: false,
    });
  }
};

const subscribeProvider = async (provider) => {
  if (!provider.on) {
    return;
  }
  provider.on("close", () => resetApp());
  provider.on("accountsChanged", async (accounts) => {
    await setState({ ...state, address: accounts[0] });
    //await getAccountAssets();
  });
  provider.on("chainChanged", async (chainId) => {
    const { web3 } = state;
    const networkId = await web3.eth.net.getId();
    await setState({ ...state, chainId, networkId });
    //await getAccountAssets();
  });

  provider.on("networkChanged", async (networkId) => {
    const { web3 } = state;
    const chainId = await web3.eth.chainId();
    await setState({ ...state, chainId, networkId });
    //await getAccountAssets();
  });
};

const resetApp = async () => {
  const { web3 } = this.state;
  if (web3 && web3.currentProvider && web3.currentProvider.close) {
    await web3.currentProvider.close();
  }
  await web3Modal.clearCachedProvider();
  this.setState({ ...INITIAL_STATE });
};

export async function connectWallet(_provider) {
  if (
    [
      "walletConnect",
      "coinbaseWallet",
      "binanceChainWallet",
      "metaMaskWallet",
      "trustWallet",
    ].indexOf(_provider) !== -1
  ) {
    await onWeb3Connect();
    setNetwork("BSC");
  } else if (["TokenPocket", "TronLink"].indexOf(_provider) !== -1) {
    if (window.tronWeb && window.tronWeb.ready) {
      try {
        await connectTronNetwork();
        setProvider(window.tronWeb);
        setNetwork("TRON");
      } catch (e) {
        console.error(e);
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export async function fetchWalletAddress() {
  if (network === "TRON") {
    if (isTronConnected()) {
      return provider.defaultAddress.base58;
    } else {
      return null;
    }
  } else if (network === "BSC") {
    return state.address;
  }
}

async function initWeb3Transaction(amount, toAddress) {
  const { web3, address, chainId } = state;

  if (!web3) {
    return null;
  }
  const from = address;
  const to = toAddress;
  const _nonce = web3.eth.getTransactionCount(from);
  const gas_price = web3.eth.getGasPrice();
  const gas = 60000;
  const value = web3.utils.toWei(amount.toString(), "ether");
  const data = "0x";
  const tx = {
    from,
    to,
    _nonce,
    gas_price,
    gas,
    value,
    data,
  };

  try {
    setState({
      ...state,
      pendingRequest: true,
    });

    function sendTransaction(_tx) {
      return new Promise((resolve, reject) => {
        web3.eth
          .sendTransaction(_tx)
          .once("transactionHash", (txHash) => resolve(txHash))
          .catch((err) => reject(err));
      });
    }

    const result = await sendTransaction(tx);
    const formattedResult = {
      action: "ETH_SEND_TRANSACTION",
      txHash: result,
      from: from,
      to: to,
      value: amount,
    };

    setState({
      ...state,
      web3,
      pendingRequest: false,
      result: formattedResult || null,
    });
  } catch (e) {
    console.error(e);
    setState({ ...state, web3, pendingRequest: false, result: null });
  }
}

async function initWeb3Transfer(ticker, amount, toAddress) {
  const { web3, address, chainId } = state;

  if (!web3) {
    return null;
  }
  const from = address;
  const to = toAddress;
  const _nonce = web3.eth.getTransactionCount(from);
  const gas_price = web3.eth.getGasPrice();
  const gas = 60000;
  const value = web3.utils.toWei(amount.toString(), "ether");
  const dai = DAI_CONTRACT[ticker];
  try {
    function callTransfer() {
      return new Promise(async (resolve, reject) => {
        const dai = new web3.eth.Contract(dai.abi, dai.address);
        await dai.methods
          .transfer(to, value)
          .send({ from: address }, (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data);
          });
      });
    }

    const result = await callTransfer();
    const formattedResult = {
      action: "ETH_TOKEN_TRANSFER",
      txHash: result["transactionHash"],
      from: from,
      to: to,
      value: amount,
    };
    setState({
      ...state,
      web3,
      pendingRequest: false,
      result: formattedResult || null,
    });
  } catch (e) {
    console.error(e);
    setState({ ...state, web3, pendingRequest: false, result: null });
  }
}

async function initTronTransaction(amount, toAddress) {
  if (isTronConnected()) {
    const value = amount * 1e6;
    const tx = await provider.trx.sendTransaction(toAddress, value);
    console.log(tx);
    const formattedResult = {
      action: "TRON_TRANSACTION",
      txHash: tx["transaction"]["txID"],
      from: fetchWalletAddress(),
      to: toAddress,
      value: value,
      amount: amount,
    };
    setState({
      ...state,
      pendingRequest: false,
      result: formattedResult,
    });
  } else {
    setState({
      ...state,
      pendingRequest: false,
      result: null,
    });
  }
}

async function initTronTransfer(ticker, amount, toAddress) {
  try {
    const dai = DAI_CONTRACT[ticker];
    let contract = await provider.trx.getContract(dai.address);
    if (!contract) {
      setState({
        ...state,
        pendingRequest: false,
        result: null,
      });
    } else {
      contract = await provider.contract(contract.abi.entrys, dai.address);
      const value = amount * 1e6;
      const tx = await contract.transfer(toAddress, value).send({
        callValue: 0,
        shouldPollResponse: true,
        feeLimit: 100000000,
      });
      console.log(tx);
      const formattedResult = {
        action: "TRON_TOKEN_TRANSFER",
        txHash: tx,
        from: fetchWalletAddress(),
        to: toAddress,
        value: value,
        amount: amount,
      };
      setState({
        ...state,
        pendingRequest: false,
        result: formattedResult,
      });
    }
  } catch (e) {
    console.error(e);
    setState({
      ...state,
      pendingRequest: false,
      result: null,
    });
  }
}

export async function doTransaction(ticker, amount, toAddress) {
  if (network === "TRON" && ["TRX", "USDT"].indexOf(ticker) !== -1) {
    // Tron Transaction
    if (ticker === "TRX") {
      await initTronTransaction(amount, toAddress);
    } else {
      await initTronTransfer(ticker, amount, toAddress);
    }
  } else if (
    network === "BSC" &&
    ["BNB", "BUSD", "USDC", "SHIB"].indexOf(ticker) !== -1
  ) {
    // BSC transaction
    if (ticker === "BNB") {
      await initWeb3Transaction(amount, toAddress);
    } else {
      await initWeb3Transfer(ticker, amount, toAddress);
    }
  } else {
    return null;
  }
}

module.exports ={doTransaction, fetchWalletAddress, isTronConnected, setState,};