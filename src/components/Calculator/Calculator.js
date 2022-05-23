import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import _ from "lodash";
import "./Calculator.css";
import WalletConnect from "../Wallet Connect/WalletConnect";




function Calculator({ updateChildData }) {
  console.log('props.setChildData')
  const API_URL = "https://api.ollyswap.com/v1";
  const [isMobile, setIsMobile] = useState(true);
  const [agreementOk, setAgreementOk] = useState(false);
  const [currencyList, setCurrencyList] = useState({
    allCurrencies: null,
    currencies: null,
    selectedBlockchain: null,
  });
  const [displayCurrencies, setDisplayCurrencies] = useState(null);
  const [selectedPairs, setSelectedPairs] = useState({
    tradePair: {
      ticker: "BUSD",
      blockchain: "BSC",
    },
    basePair: {
      ticker: "DSF",
      blockchain: "BSC",
    },
  });

  const [pairType, setPairType] = useState(null);
  const pairTypeRef = useRef(pairType);


  const fetchCurrencies = async () => {
    try {
      let res = await axios.get(API_URL + "/currencies");
      if (res.status === 200) {
        let currencies = res.data.data;
        let allCurrencies = [];
        _.map(currencies, (coins, blockchain) => {
          _.map(coins, (coin) => {
            allCurrencies.push({
              ...coin,
              blockchain: blockchain,
            });
          });
        });

        //console.log('allCurrencies', allCurrencies, currencies);
        setCurrencyList({
          allCurrencies: allCurrencies,
          currencies: currencies,
          selectedBlockchain: null,
        });
        //console.log('currencyList', currencyList);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loopBlockchains = () => {
    let blockchainList = _.map(currencyList.currencies, (coins, blockchain) => {
      return (
        <button
          onClick={() => selectBlockchain(blockchain)}
          className={
            currencyList.selectedBlockchain === blockchain
              ? "btn btn-active"
              : "btn mx-2"
          }
          key={blockchain}
        >
          {blockchain}
        </button>
      );
    });
    //console.log(blockchainList);
    return blockchainList;
  };

  const selectBlockchain = (blockchain = null) => {
    let displayItems = [];
    //console.log('blockchain', blockchain, currencyList);
    _.map(currencyList.allCurrencies, (currency) => {
      if (blockchain == null || currency.blockchain === blockchain) {
        //console.log(currency);
        displayItems.push(
          <div
            onClick={() => selectCurrency(currency)}
            className="token d-flex justify-content-between py-3 ps-2 pe-3 mb-3"
            key={currency.ticker}
          >
            <div className="token-img-token-name d-flex align-items-center">
              <img
                src={`./images/${currency.ticker}.png`}
                width="22px"
                height="22px"
                alt=""
              />
              <div className="token-name ms-3">
                <div className="name mb-0">{currency.ticker}</div>
                <div className="sub-name mb-0">{currency.blockchain}</div>
              </div>
            </div>
            <div className="token-rate align-self-center">
              ${currency.market_price}
            </div>
          </div>
        );
      }
    });
    //console.log(displayItems);
    setDisplayCurrencies(displayItems);
    setCurrencyList({
      ...currencyList,
      selectedBlockchain: blockchain,
    });
  };

  const selectCurrency = async (currency) => {
    console.log(currency);
    if (pairTypeRef.current === "TRADE") {
      await setSelectedPairs({
        ...selectedPairs,
        tradePair: currency,
      });
    } else {
      await setSelectedPairs({
        ...selectedPairs,
        basePair: currency,
      });
    }
    await fetchLivePrice(pairTypeRef.current, currency);
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
      for (let j = modalBDs.length; j--; ) {
        j = parseInt(j);
        if (!isNaN(j)) {
          modalBDs[j].parentNode.removeChild(modalBDs[j]);
        }
      }

      let bodyElem = document.body;
      bodyElem.classList.remove("modal-open");
      bodyElem.style.removeProperty("overflow");
    }

    closeModal();
  };

  const [tradePair, setTradePair] = useState({
    trade_blockchain: null,
    trade_currency: null,
    base_blockchain: null,
    base_currency: null,
    trade_amount: 100,
    est_base_amount: 0,
    trade_price: 0,
    base_price: 0,
    trade_liquidity: 0,
    base_liquidity: 0,
    sender_address: null,
    recipient_address: "",
  });

  async function fetchLivePrice(pairRef, currency) {
    try {
      let trade_ticker = selectedPairs.tradePair.ticker;
      let trade_blockchain = selectedPairs.tradePair.blockchain;
      let base_ticker = selectedPairs.basePair.ticker;
      let base_blockchain = selectedPairs.basePair.blockchain;
      if (!!pairRef) {
        if (pairRef === "TRADE") {
          trade_ticker = currency.ticker;
          trade_blockchain = currency.blockchain;
        } else {
          base_ticker = currency.ticker;
          base_blockchain = currency.blockchain;
        }
      }

      let res = await axios.get(
        `${API_URL}/last_price?trade_ticker=${trade_ticker}&base_ticker=${base_ticker}`
      );
      if (res.status === 200) {
        if (res.data.status) {
          let trade_price = parseFloat(res.data.data.price.toFixed(6));
          let base_price = parseFloat((1 / res.data.data.price).toFixed(6));
          let est_base_amount =
            tradePair.trade_amount * (1 - 0.002) * trade_price;
            var obj = {
              trade_blockchain: trade_blockchain,
              trade_currency: trade_ticker,
              base_blockchain: base_blockchain,
              base_currency: base_ticker,
              trade_price: trade_price,
              base_price: base_price,
              trade_liquidity: res.data.data.trade_liquidity,
              base_liquidity: res.data.data.base_liquidity,
              est_base_amount: est_base_amount,
            }
          setTradePair({
            ...tradePair,
            ...obj
          });

          updateChildData(obj)


        } else {
          // Add Error popup
        }
      } else {
        // Add Error popup
      }
    } catch (e) {
      console.error(e);
    }
  }

  const changeTradePairs = (e) => {
    const { name, value } = e.target;
    if (name === "trade_amount") {
      let est_base_amount = value * (1 - 0.002) * tradePair.trade_price;
      setTradePair({
        ...tradePair,
        trade_amount: value,
        est_base_amount: est_base_amount,
      });
    } else {
      let trade_amount = (value * (1 - 0.002)) / tradePair.trade_price;
      setTradePair({
        ...tradePair,
        trade_amount: trade_amount,
        est_base_amount: value,
      });
    }
  };

  const handleStaticChange = (e) => {
    const { name, value } = e.target;
    setTradePair({
      ...tradePair,
      [name]: value,
    });
  };

  const initTrade = async () => {
    try {
      let res = await axios.post(API_URL + "/validate_trade", {
        trade_blockchain: tradePair.trade_blockchain,
        trade_currency: tradePair.trade_currency,
        base_blockchain: tradePair.base_blockchain,
        base_currency: tradePair.base_currency,
        trade_amount: tradePair.trade_amount,
      });

      if (res.status === 200) {
        if (res.data.status) {
          let res = await axios.post(API_URL + "/trade", {
            trade_blockchain: tradePair.trade_blockchain,
            trade_currency: tradePair.trade_currency,
            base_blockchain: tradePair.base_blockchain,
            base_currency: tradePair.base_currency,
            trade_amount: tradePair.trade_amount,
            //sender_address: String(walletConnection.address).trim(),
            recipient_address: tradePair.recipient_address,
          });

          if (res.status === 200) {
            if (res.data.status) {
              let hot_wallet = res.data.data.receiving_hot_wallet;
              // await doTransaction(
              //   tradePair.trade_currency,
              //   tradePair.trade_amount,
              //   hot_wallet
              // );
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  async function swapperCoins() {
    try {
      var trade_ticker = tradePair.base_currency;
      var trade_blockchain = tradePair.base_blockchain;
      var base_ticker = tradePair.trade_currency;
      var base_blockchain = tradePair.trade_blockchain;

      setSelectedPairs({
        ...selectedPairs,
        tradePair: {
          ticker: selectedPairs.basePair.ticker,
          blockchain: selectedPairs.basePair.blockchain,
        },
        basePair: {
          ticker: selectedPairs.tradePair.ticker,
          blockchain: selectedPairs.tradePair.blockchain,
        },
      });

      //console.log('trade_ticker',trade_ticker,'trade_blockchain',trade_blockchain,'base_ticker',base_ticker, 'base_blockchain',base_blockchain)
      var apiCall = `${API_URL}/last_price?trade_ticker=${trade_ticker}&base_ticker=${base_ticker}`;
      //console.log('apiCall',apiCall)
      let res = await axios.get(apiCall);
      if (res.status === 200) {
        //console.log('res>',res.data)
        if (res.data.status) {
          let trade_price = parseFloat(res.data.data.price.toFixed(6));
          let base_price = parseFloat((1 / res.data.data.price).toFixed(6));
          let est_base_amount =
            tradePair.trade_amount * (1 - 0.002) * trade_price;

            var obj = { trade_blockchain: trade_blockchain,
            trade_currency: trade_ticker,
            base_blockchain: base_blockchain,
            base_currency: base_ticker,
            trade_price: trade_price,
            base_price: base_price,
            trade_liquidity: res.data.data.trade_liquidity,
            base_liquidity: res.data.data.base_liquidity,
            est_base_amount: est_base_amount }

          setTradePair({
            ...tradePair,
            ...obj
          });

          updateChildData(obj)

        } else {
          // Add Error popup
        }
      } else {
        // Add Error popup
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    console.log(currencyList.selectedBlockchain);
    if (currencyList.selectedBlockchain === null) {
      fetchCurrencies();
      fetchLivePrice(null, null);
    }
    document.title = "OllySwap Exchange WebApp";
    // loadGraph();

    // if (window.tronWeb) {
    //   connectTronNetwork();
    // } else {
    //   componentDidMount();
    // }
  }, []);


  return (
    <>
      <WalletConnect />

      <div className="container content-container md-2">
        <div className="content mx-auto p-4">
          <div className="heading-btns-container d-flex justify-content-between align-items-center">
            <div className="heading-text">SWAP</div>

            <div className="btn-group">
              {/* <button className="btn btn-1 ">
                  <img src="./RightSectionImages/btn1.png" alt="" />
                </button>
                <button className="btn btn-2 ms-2">
                  <img src="./RightSectionImages/btn2.png" alt="" />
                </button> */}
              {/* <button className="btn btn-3 ms-2">
                  <img src="./RightSectionImages/btn3.png" alt="" />
                </button>
                {/* <button className="btn btn-4 ms-2">
                  <img src="./RightSectionImages/btn4.png" alt="" />
                </button> */}
            </div>
          </div>
          <div className="title-input-group-w-menu my-4">
            <div className="title d-flex text-white justify-content-between">
              <div className="text">Pay</div>
              {/* <div className="text">
                  <link rel="stylesheet" href="" />
                  Available: 500
                </div> */}
            </div>
            <div className="input-group-w-menu d-flex mt-2 ">
              <button
                onClick={() => {
                  setPairType("TRADE");
                  pairTypeRef.current = "TRADE";
                  selectBlockchain();
                }}
                type="button"
                className="btn  dropdown-btn d-flex align-items-center p-3 "
                data-bs-toggle="modal"
                data-bs-target="#openTradeModal"
              >
                <div className="d-flex align-items-center pe-5">
                  <img
                    src={`./images/${selectedPairs.tradePair.ticker}.png`}
                    className="me-2"
                    alt="..."
                    width="24"
                  />
                  {selectedPairs.tradePair.ticker}
                </div>

                <img
                  src="./RightSectionIcons/arrow-down.png"
                  className=""
                  alt="..."
                />
              </button>

              <div
                className="modal fade"
                id="openTradeModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered ">
                  <div className="modal-content px-4 py-4 ">
                    <div className="modal-header align-items-start p-0 border-0">
                      <div className="modal-title" id="exampleModalLabel">
                        Select Token
                      </div>
                      <button
                        type="button"
                        className="btn-close pe-3 "
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      >
                        <img src="./RightSectionIcons/close-small.png" alt="" />
                      </button>
                    </div>
                    <div className="modal-body px-0">
                      {/* <div className="search-container d-flex align-items-center ps-3">
                          <img
                            src="./RightSectionIcons/search.png"
                            width="11.5px"
                            height="11.5px"
                            alt=""
                          />
                          <input
                            class="form-control  search-input "
                            type="search"
                            placeholder="Search token name or contract address"
                            aria-label="Search"
                          />
                        </div> */}
                      <div className="horiziontal-btn-scroll-container mt-3">
                        <button
                          onClick={() => selectBlockchain()}
                          className={
                            currencyList.selectedBlockchain === null
                              ? "btn btn-active"
                              : "btn mx-2"
                          }
                        >
                          ALL
                        </button>
                        {loopBlockchains()}
                      </div>
                    </div>
                    <div className="tokens-container">{displayCurrencies}</div>
                  </div>
                </div>
              </div>

              <input
                type="number"
                className="form-control text-end"
                aria-label="Server"
                placeholder="0"
                name="trade_amount"
                value={tradePair.trade_amount}
                onChange={changeTradePairs}
              />
            </div>
          </div>
          <div
            onClick={() => swapperCoins()}
            className=" d-flex justify-content-center my-4"
            style={{ cursor: "pointer" }}
          >
            <img
              className="card-exchange"
              src="./RightSectionIcons/ex.png  "
              alt=""
            />
          </div>
          <div className="title-input-group-w-menu ">
            <div className="title d-flex text-white justify-content-between">
              <div className="text">Receive (Estimated)</div>
              {/* <div className="text">
                  <link rel="stylesheet" href="" />
                  Available: 1,200
                </div> */}
            </div>
            <div className="input-group-w-menu d-flex mt-2 ">
              <button
                onClick={() => {
                  setPairType("BASE");
                  pairTypeRef.current = "BASE";
                  selectBlockchain();
                }}
                type="button"
                className="btn  dropdown-btn d-flex align-items-center  "
                data-bs-toggle="modal"
                data-bs-target="#exampleModal3"
              >
                <div className="d-flex align-items-center  pe-5">
                  <img
                    src={`./images/${selectedPairs.basePair.ticker}.png`}
                    className="me-2"
                    alt="..."
                    width="24"
                  />
                  {selectedPairs.basePair.ticker}
                </div>

                <img
                  src="./RightSectionIcons/arrow-down.png"
                  className=""
                  alt="..."
                />
              </button>

              <div
                className="modal fade"
                id="exampleModal3"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                // aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered ">
                  <div className="modal-content px-4 py-4 ">
                    <div className="modal-header align-items-start p-0 border-0">
                      <div className="modal-title" id="exampleModalLabel">
                        Select Token
                      </div>
                      <button
                        type="button"
                        className="btn-close pe-3 "
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      >
                        <img src="./RightSectionIcons/close-small.png" alt="" />
                      </button>
                    </div>
                    <div className="modal-body px-0">
                      {/*<div
                                                                className="search-container d-flex align-items-center ps-3">
                                                                <img
                                                                    src="./RightSectionIcons/search.png"
                                                                    width="11.5px"
                                                                    height="11.5px"
                                                                    alt=""
                                                                />
                                                                <input
                                                                    className="form-control  search-input "
                                                                    type="search"
                                                                    placeholder="Search token name or contract address"
                                                                    aria-label="Search"
                                                                />
                                                            </div>*/}
                      <div className="horiziontal-btn-scroll-container mt-3">
                        <button
                          onClick={() => selectBlockchain()}
                          className={
                            currencyList.selectedBlockchain === null
                              ? "btn btn-active"
                              : "btn mx-2"
                          }
                        >
                          ALL
                        </button>
                        {loopBlockchains()}
                      </div>
                    </div>
                    <div className="tokens-container">{displayCurrencies}</div>
                  </div>
                </div>
              </div>

              <input
                type="number"
                className="form-control text-end p-3"
                aria-label="Server"
                placeholder="0"
                name="est_base_amount"
                value={tradePair.est_base_amount}
                onChange={changeTradePairs}
              />
            </div>
          </div>
          <div className="rate-container d-flex justify-content-center my-4 ">
            <div className="rate pe-2">
              1 {selectedPairs.tradePair.ticker} = {tradePair.trade_price}{" "}
              {selectedPairs.basePair.ticker}
            </div>
            <img src="./RightSectionIcons/rate.png" alt="" className="d-none" />
          </div>
          <div className="input-group mb-3 sa-text_box">
            <input
              type="text"
              className="form-control"
              placeholder="Recipient's address"
              name="recipient_address"
              value={tradePair.recipient_address}
              onChange={handleStaticChange}
            />
          </div>
          <div className="confirm-btn-text">
            <button className="btn btn-green" onClick={() => initTrade()}>
              Confirm Order
            </button>
            {/* <div className="text text-center py-2">
                Enter an amount to see more trading details
              </div> */}
          </div>
          <div className="divider-horizontal"></div>
          <div className="bottom  d-flex justify-content-between">
            <div className="left text-start">
              {/* <div className="p">Exchange Route</div> */}
              <div className="p">Reference price</div>
              <div className="p">Fee</div>
              <div className="p">Estimated amount</div>
              <div className="p">Maximum</div>
            </div>
            <div className="right text-white text-end">
              {/* <div className="p">SWFT</div> */}
              <div className="p">
                1 {selectedPairs.tradePair.ticker} = {tradePair.trade_price}{" "}
                {selectedPairs.basePair.ticker}
              </div>
              <div className="p">0.20%</div>
              <div className="p">
                {" "}
                {tradePair.est_base_amount} {selectedPairs.basePair.ticker}
              </div>
              <div className="p">
                {" "}
                {tradePair.trade_liquidity} {selectedPairs.tradePair.ticker}
              </div>
            </div>
          </div>

          {/* <div className="trade-reward d-flex justify-content-between mt-4">
              <div className="trade d-flex align-items-center ">
                <div className="text me-2">Trade Mining</div>
                <img src="./RightSectionIcons/quetionmark.png" alt="" />
              </div>
              <div className="reward d-flex ">
                <div className="max-reward">Max Reward 5.04 DEX</div>
                <div className="dollar ms-2 ">$16.68</div>
              </div>
            </div> */}
        </div>
      </div>

      <div className="buttons pt-8 mt-8 d-none">
        <button
          type="button"
          className="chakra-button css-1fff88k"
          onClick={() => setIsMobile(!isMobile)}
        >
          <span className="chakra-button__icon css-1qx7bcs"></span>
          {isMobile === true
            ? "VIEW GRAPH/TRADING HISTORY"
            : "HIDE GRAPH/TRADING HISTORY"}
        </button>
      </div>
    </>
  );
}

export default Calculator;
