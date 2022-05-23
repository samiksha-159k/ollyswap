import "./Header.css";
import React, { useState } from "react";
//import Graph from "./graph/Graph";


const Header = () => {
  const [agreementOk, setAgreementOk] = useState(false);
  function ConnectToWallet(connector) {
    if (agreementOk) {
      console.log("Connect to", connector);
      let modal = document.getElementsByClassName("modal");
      modal.modal("close");
    }
  }

  return (
    <div className="header d-md-block d-none">
    <nav class="navbar ">
        <div class="container">
            <a class="navbar-brand" href="/">
                <img
                    src="images/ollygroup.png"
                    alt=""
                    width="163px"
                    height="38px"
                />
            </a>
            {/* <button
                type="button"
                className="btn connect-wallet-btn mobile"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal1"
            >
                Connect
            </button>  */}

           
           





            {/* <button class="btn btn-connect d-md-none d-block " >Connect</button> */}
        </div>
    </nav>
    {/* <div>
    <img src='images/ollygroup.png' alt='ollswap_logo' className='sa-ollyswap_logo'
    width={100} />
  </div> */}
    {/* <div className=" d-flex">
  <div className="button">OLLY</div>
    <button className="button">Exchange</button>
    <button className="button">Liquidity</button>
    <select
      value="Mining"
      placeholder="Mining"
      defaultValue="Mining"
      className="dropdown"
    >
      <option value="A">Liquidity Mining</option>
      <option value="B">Trading mining</option>
      <option value="C">vFTR</option>
    </select>
    <button className="button">Developer</button>
  </div> */}


</div>
  );
};
export default Header;
