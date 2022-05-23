import React, { useState,useEffect } from "react";
import "./WalletConnect.css";
//import '../Calculator/Calculator.css'
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import Web3 from "web3";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { DAI_CONTRACT } from "../AssetContractABI";
import { BscConnector } from '@binance-chain/bsc-connector';

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
            rpc: {
                56: "https://bsc-dataseed.binance.org/",
            },
            network: "BSC",
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
    // coinbaseWallet: {
    //     package: CoinbaseWalletSDK, // Required
    //     options: {
    //         appName: "OllySwap", // Required
    //         infuraId: "d92aa38df8c441c5beda785607b37c85", // Required
    //         rpc: "", // Optional if `infuraId` is provided; otherwise it's required
    //         chainId: 56, // Optional. It defaults to 1 if not provided
    //         darkMode: true, // Optional. Use dark theme, defaults to false
    //     },
    // },
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

const WalletConnectComponent = () => {
    const [status, setstatus] = useState(false);
    const [agreementOk, setAgreementOk] = useState(false);
    const [walletConnection, setWalletConnection] = useState(INITIAL_STATE);
    const [network, setNetwork] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [tronWeb, setTronWeb] = useState(null);
    const [isMobile, setIsMobile] = useState(true);

    const resetApp = async () => {
        const { web3 } = walletConnection;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await web3Modal.clearCachedProvider();
        setWalletConnection({ ...INITIAL_STATE });
    };

    function closeModal() {
        let modals = document.getElementsByClassName("modal");
        for (let i in modals) {
            i = parseInt(i);
            if (!isNaN(i)) {
                modals[i].classList.remove("show");
                modals[i].style.display = "none";
            }
        } //modal-backdrop

        let modalBDs = document.getElementsByClassName("modal-backdrop");
        for (let j = modalBDs.length; j--;) {
            j = parseInt(j);
            if (!isNaN(j)) {
                modalBDs[j].parentNode.removeChild(modalBDs[j]);
            }
        }

        let bodyElem = document.body;
        bodyElem.classList.remove("modal-open");
        bodyElem.style.removeProperty("overflow");
    }

    const subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => resetApp());
        provider.on("accountsChanged", async (accounts) => {
            await setWalletConnection({ ...walletConnection, address: accounts[0] });
            //await getAccountAssets();
        });
        provider.on("chainChanged", async (chainId) => {
            const { web3 } = walletConnection;
            const networkId = await web3.eth.net.getId();
            await setWalletConnection({ ...walletConnection, chainId, networkId });
            //await getAccountAssets();
        });

        provider.on("networkChanged", async (networkId) => {
            const { web3 } = walletConnection;
            const chainId = await web3.eth.chainId();
            await setWalletConnection({ ...walletConnection, chainId, networkId });
            //await getAccountAssets();
        });
    };

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

    const onWeb3Connect = async (provider_key = null) => {
        const provider = await web3Modal.connect();
        await subscribeProvider(provider);
        await provider.enable();
        const web3 = initWeb3(provider);
        const accounts = await web3.eth.getAccounts();
        const address = accounts[0];
        const networkId = await web3.eth.net.getId();
        const chainId = await web3.eth.chainId();
        await setWalletConnection({
            ...walletConnection,
            web3,
            provider,
            connected: true,
            address,
            chainId,
            networkId,
        });
        //await getAccountAssets();
    };

    const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        providerOptions,
    });

    async function connectWallet(_provider) {
        if (
            [
                "walletConnect",
                "coinbaseWallet",
                "binanceChainWallet",
                "metaMaskWallet",
                "trustWallet",
            ].indexOf(_provider) !== -1
        ) {
            await onWeb3Connect(_provider);
            setNetwork("BSC");
        } else if (["TokenPocket", "TronLink"].indexOf(_provider) !== -1) {
            if (window.tronLink && window.tronLink.ready) {
                setTronWeb(window.tronLink);
                await connectTronNetwork();
                setNetwork("TRON");
            } else if (window.tronWeb && window.tronWeb.ready) {
                try {
                    setTronWeb(window.tronWeb);
                    await connectTronNetwork();
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

    function ConnectToWallet(connector) {
        if (agreementOk) {
            console.log("Connect to", connector);
            connectWallet(connector);
            setWalletConnected(true);
            closeModal();
        }
    }

    function isTronConnected() {
        return !!(window.tronWeb && window.tronWeb.defaultAddress.base58);
    }

    async function connectTronNetwork() {
        //tronWeb.request('')
        return new window.Promise(async function (resolve, reject) {
            if (window.tronLink && window.tronLink.ready) {
                await window.tronLink.request({ method: "tron_requestAccounts" });
                window.tronWeb = window.tronLink.tronWeb;
            }
            let timeLimit = 30 * 1000;
            let currentTime = 0;
            let timer = setInterval(function () {
                if (isTronConnected()) {
                    window.tronWeb.on("addressChanged", async function () {
                        await connectTronNetwork();
                    });
                    clearInterval(timer);
                    setTronWeb(window.tronWeb);
                    setWalletConnection({
                        ...walletConnection,
                        web3: window.tronWeb,
                        address: window.tronWeb.defaultAddress.base58,
                        provider: window.tronWeb,
                        connected: true,
                        chainId: 0,
                        networkId: 0,
                    });
                    resolve(true);
                } else {
                    if (currentTime >= timeLimit) {
                        clearInterval(timer);
                        reject(false);
                    }
                    currentTime += 100;
                }
            }, 100);
        });
    }

    const shortWallet = () => {
        if (!walletConnection.address) {
            return "";
        } else {
            let address = String(walletConnection.address).trim();
            return (
                address.substring(0, 5) +
                "..." +
                address.substring(address.length - 3, address.length)
            );
        }
    };

    async function fetchWalletAddress() {
        if (network === "TRON") {
            if (isTronConnected()) {
                return tronWeb.defaultAddress.base58;
            } else {
                return null;
            }
        } else if (network === "BSC") {
            return walletConnection.address;
        }
    }

    async function initWeb3Transaction(amount, toAddress) {
        const { web3, address, chainId } = walletConnection;

        if (!web3) {
            return null;
        }
        const from = address;
        const to = toAddress;
        const _nonce = await web3.eth.getTransactionCount(from);
        const gas_price = await web3.eth.getGasPrice();
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
            setWalletConnection({
                ...walletConnection,
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

            setWalletConnection({
                ...walletConnection,
                web3,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (e) {
            console.error(e);
            setWalletConnection({
                ...walletConnection,
                web3,
                pendingRequest: false,
                result: null,
            });
        }
    }

    async function initWeb3Transfer(ticker, amount, toAddress) {
        const { web3, address, chainId } = walletConnection;

        if (!web3) {
            return null;
        }
        const from = address;
        const to = toAddress;
        const _nonce = await web3.eth.getTransactionCount(from);
        const gas_price = await web3.eth.getGasPrice();
        const gas = 60000;
        const value = web3.utils.toWei(amount.toString(), "ether");

        try {
            function callTransfer() {
                return new Promise(async (resolve, reject) => {
                    const dai = DAI_CONTRACT[ticker];
                    const contract = new web3.eth.Contract(dai.abi, dai.address);
                    await contract.methods.transfer(to, value).send(
                        {
                            from: address,
                            nonce: _nonce,
                            gas_price: gas_price,
                            gas: gas,
                        },
                        (err, data) => {
                            if (err) {
                                reject(err);
                            }
                            resolve(data);
                        }
                    );
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
            setWalletConnection({
                ...walletConnection,
                web3,
                pendingRequest: false,
                result: formattedResult || null,
            });
        } catch (e) {
            console.error(e);
            setWalletConnection({
                ...walletConnection,
                web3,
                pendingRequest: false,
                result: null,
            });
        }
    }

    async function initTronTransaction(amount, toAddress) {
        if (isTronConnected()) {
            try {
                const value = amount * 1e6;
                console.log(toAddress, value, walletConnection.address, 1);
                let tx = await tronWeb.transactionBuilder.sendTrx(toAddress, value);
                console.log(toAddress, value, walletConnection.address, 2);
                let signedTx = await tronWeb.trx.sign(tx);
                console.log(toAddress, value, walletConnection.address, 3);
                let receipt = await tronWeb.trx.sendRawTransaction(signedTx);
                console.log(toAddress, value, walletConnection.address, 4);
                /*let tx = await tronWeb.trx.sendTransaction(toAddress, value).send({
                                            from: walletConnection.address,
                                            shouldPollResponse: true,
                                            feeLimit: 100000000,
                                        })*/

                console.log(receipt);
                const formattedResult = {
                    action: "TRON_TRANSACTION",
                    txHash: receipt["txid"],
                    from: walletConnection.address,
                    to: toAddress,
                    value: value,
                    amount: amount,
                };
                setWalletConnection({
                    ...walletConnection,
                    pendingRequest: false,
                    result: formattedResult,
                });
            } catch (e) {
                console.error(e);
                setWalletConnection({
                    ...walletConnection,
                    pendingRequest: false,
                    result: null,
                });
            }
        } else {
            setWalletConnection({
                ...walletConnection,
                pendingRequest: false,
                result: null,
            });
        }
    }

    async function initTronTransfer(ticker, amount, toAddress) {
        try {
            const dai = DAI_CONTRACT[ticker];
            let contract = await tronWeb.trx.getContract(dai.address);
            if (!contract) {
                setWalletConnection({
                    ...walletConnection,
                    pendingRequest: false,
                    result: null,
                });
            } else {
                contract = await tronWeb.contract(contract.abi.entrys, dai.address);
                const value = amount * 1e6;
                const tx = await contract.transfer(toAddress, value).send({
                    callValue: 0,
                    shouldPollResponse: true,
                    feeLimit: 100000000,
                    from: walletConnection.address,
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
                setWalletConnection({
                    ...walletConnection,
                    pendingRequest: false,
                    result: formattedResult,
                });
            }
        } catch (e) {
            console.error(e);
            setWalletConnection({
                ...walletConnection,
                pendingRequest: false,
                result: null,
            });
        }
    }




    




    return (
      <>
  <div className="container">
                <div className="top  d-flex  justify-content-md-center justify-content-between ">
                <img
                className="d-md-none d-block"
                    src="images/ollygroup.png"
                    alt=""
                    width="120px"
                    height="38px"
                />
                  <div className="address d-md-block d-none">
                    <div className="eth d-flex align-items-center px-3">
                      <img src="./RightSectionIcons/Group.png" alt="" />
                      {walletConnected && (
                        <div className="dropdown ms-1">
                          <button
                            className="btn connect-wallet-btn dropdown-toggle"
                            type="button"
                            id="dropdownMenuButton1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {shortWallet()}
                          </button>
                          <ul
                            className="dropdown-menu p-2"
                            aria-labelledby="dropdownMenuButton1"
                          >
                            <li className="p-0">
                              <a className="dropdown-item p-0" href="/">
                                Disconnect
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="address d-flex">
                    {walletConnected && (
                      <div className="eth d-flex align-items-center px-2">
                        <img src="./RightSectionIcons/vector.png" alt="" />
                        <div className="eth-name text-white px-1 ">
                          {network}
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                      
                        type="button"
                        className="btn connect-wallet-btn mobile "
                        data-bs-toggle="modal"
                        data-bs-target="#connectWalletLG"
                       
                      >
                        Connect
                      </button>

                      <div
                        className="modal fade"
                        id="connectWalletLG"
                        tabIndex="-2"
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog">
                          <div className="modal-content sa-modal-content">
                            <div className="modal-body sa-modal-body">
                              <div className="container sa-container ">
                                <div className="sa-bgclr sa-width">
                                  <div>
                                  
                                    <div className=" sa-heading d-flex align-items-baseline justify-content-between">
                                      
                                      Connect {" "}
                                      <span>
                                        <button
                                          type="button"
                                          className="btn-close "
                                          data-bs-dismiss="modal"
                                          aria-label="Close"
                                        >
                                          <img
                                           
                                            src="./RightSectionIcons/close-small.png"
                                            alt=""
                                          />
                                        </button>
                                        {/* <i className="fa-solid fa-xmark sa-font_Awesome"></i> */}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="sa-inside_bgclr">
                                    <div className="form-check">
                                      <input
                                        className=" sa-box form-check-input"
                                        type="checkbox"
                                        value=""
                                        id="flexCheckDefault"
                                        onClick={() =>
                                          setAgreementOk(!agreementOk)
                                        }
                                      />
                                      <label
                                        className="form-check-label sa-check"
                                        htmlFor="flexCheckDefault"
                                      >
                                        I have read, understand, and agree to{" "}
                                        <span className="sa-break">
                                          the <a href="/">Terms of Service.</a>
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() =>
                                      ConnectToWallet("metaMaskWallet")
                                    }
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/metamask.png"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                      >
                                        {" "}
                                        Meta Mask
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() =>
                                      ConnectToWallet("binanceChainWallet")
                                    }
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/Layer.png"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                      
                                      >
                                        {" "}
                                        Binance Chain Wallet
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() =>
                                      ConnectToWallet("walletConnect")
                                    }
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/wconnect.png"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                       
                                        //onClick={() =>alert("Please")}
                                      >
                                        {" "}
                                        WalletConnect
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() =>
                                      ConnectToWallet("metaMaskWallet")
                                    }
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/TrustWallet.png"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                      >
                                        {" "}
                                        TrustWallet
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() =>
                                      ConnectToWallet("TokenPocket")
                                    }
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/TokenPocket.png"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                      >
                                        {" "}
                                        Token Pocket
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    onClick={() => ConnectToWallet("TronLink")}
                                    style={{ cursor: "pointer" }}
                                    className="d-flex sa-inside_bgclr"
                                  >
                                    <div className="d-flex">
                                      <img
                                        src="images/TronLink.jpg"
                                        alt=""
                                        className="sa-vector_image"
                                        width={40}
                                        height={30}
                                      />
                                      <div
                                        className={
                                          agreementOk
                                            ? "sa-active_text"
                                            : "sa-chain_text"
                                        }
                                      >
                                        {" "}
                                        TronLink
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <button className="btn  connect-wallet-btn "  >
                Connect to a Wallet </button> */}
                    {/* <div className="logoo">
            <img src='images/ollygroup.png' alt='ollswap_logo'
              width={100} />
             </div>
               <div>
               <div>
  {/* <!-- Button trigger modal --> */}
                    {/* <button >
              &nbsp;&nbsp; Connect &nbsp; &nbsp;
              </button> */}
                  </div>
                  {/* <img src='/images/btn.png' style={{marginLeft:'10px'}} className="image" /> */}
                  {/* <div className=" mining-menu align-self-center ms-4">
              <img src="./RightSectionImages/btn.png" alt="" />
            </div> */}
                </div>
              </div>
      </>
    );
};

export default WalletConnectComponent;
