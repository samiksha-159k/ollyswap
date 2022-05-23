import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Area } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import Chart from "react-apexcharts";
import THistory from "../Trading History/THistory";
import "./graph.css";

const data = [];
for (let num = 30; num >= 0; num--) {
  data.push({
    date: subDays(new Date().getTime(), num).toISOString().substr(0, 10),
    value: 1 + Math.random(),
  });
}

export default function Home({ childData }) {
  console.log('childData',childData)
  const [graphData, setGraphData] = useState(null);
  const [graphType, setgraphType] = useState("candlestick");
  const [currencyList, setCurrencyList] = useState({
    allCurrencies: null,
    currencies: null,
    selectedBlockchain: null,
  });
  const graphOptions = {
    stroke: {
      curve: "smooth",
    },
    fill: {
      colors: ["#1a6352"],
    },

    chart: {
      type: { graphType },
      height: 50,
      colors: ["orange", "white"],
    },
    // title: {
    //   text: `${graphType} Chart`,
    //   align: "center",
    // },
    xaxis: {
      type: "datetime",

    },
    yaxis: {
      tooltip: {
        enabled: true,

      },
      min: -1,
      max: 3,
      labels: {
        style: {
          colors: ["white"],
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: ["white"],
        },
      },
    },
    dataLabels: {
      style: {
        colors: ["orange", "white"],
      },
    },

  };

  const loadGraph = () => {
    let data = [];
    for (let num = 30; num >= 0; num--) {
      data.push({
        x: subDays(new Date().getTime(), num).toISOString().substr(0, 10),
        y: [
          (1 + Math.random()).toFixed(2),
          (1 + Math.random()).toFixed(2),
        (1 + Math.random()).toFixed(2),
        (1 + Math.random()).toFixed(2),
        ],
      });
    }
    //setGraphData(data);
    setGraphData([{ data }]);
  };
  const toggleMapType = () => {
    const g = graphType === "candlestick" ? "area" : "candlestick";
    setgraphType(g);
  };

  useEffect(() => {
    console.log(currencyList.selectedBlockchain);
    // if (currencyList.selectedBlockchain === null) {
    //   fetchCurrencies();
    //   fetchLivePrice(null, null);
    // }
    document.title = "OllySwap Exchange WebApp";
    loadGraph();

    // if (window.tronWeb) {
    //   connectTronNetwork();
    // } else {
    //   componentDidMount();
    // }
  }, []);

  return (
    <div className="graph-container-info-container container ">
      <div className="info-container ">
        <div className="row">
          <div className="ic-token-name-refresh-button d-flex align-items-center py-3">
            { Object.keys(childData).length > 0 ? <img
                src={`./images/${childData.trade_currency}.png`}
                width="26.59px"
                height="26.67px"
                alt=""
                className="busd-img"
              /> : ''}

            { Object.keys(childData).length > 0 ?
            <img
              src={`./images/${childData.base_currency}.png`}
              width="26.59px"
              height="26.67px"
              alt=""
              className="usdc-img"
            /> : ''}
            <div className="token-name text-white px-2">{ Object.keys(childData).length > 0 ? `${childData.trade_currency} / ${childData.base_currency}` : ''}</div>
            {/*
            <img
              src="./RightSectionIcons/rate.png"
              width={18}
              height={17}
              alt=""
              className=""
            />
            */}
          </div>
          <div className="MainText token-number text-white ">{ Object.keys(childData).length > 0 ? `${childData.trade_price} ${childData.base_currency}` :  ''}</div>
          <div className="token-duration "></div>
        </div>
      </div>
      <div className="duration-wise-data-updated d-flex justify-content-between flex-md-nowrap flex-wrap">
        {/* <div className="past-24-hours text-white ">
          <div className="text-green pt-2">
            +227.543364 USDC <span className="text-white">Past 24 Hours</span>
          </div>
        </div> */}
        {/* <div className="month-week-hours-btns mx-md-0 mx-auto">
          <button className="mwh-btn m-2" style={{backgroundColor:"#3B3C4E", color:"white", borderRadius:"12px",border:"none",fontWeight: "400px"}}>24H</button>
          <button className="mwh-btn2 m-2">1W</button>
          <button className="mwh-btn2 m-2">1M</button>
        </div> */}
      </div>


      <div className="d-flex justify-content">
        <button
          className="btn d-block justify-content-between"
          style={{ backgroundColor: "#B3D992", }}
          onClick={() => toggleMapType()}
        >
          {graphType === "area" ? "CandleStick" : "Area"}
        </button>
      </div>
      <ResponsiveContainer className="image-fluid" width="100%" height={500}>
        {graphData !== null && (
          <Chart
            options={graphOptions}
            series={graphData}
            type={graphType}
            height={350}
            width={window.innerWidth > 1200 ? 740 : (window.innerWidth < 1200 && window.innerWidth > 769) ? 550 : window.innerWidth - 40 }
          />
        )}
      </ResponsiveContainer>
      <THistory/>
    </div>

  );
}
