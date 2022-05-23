import React ,{useState, useEffect, useRef} from 'react';

import Header from './Header/Header';
import Calculator from './Calculator/Calculator';
import Graph from './Graph/Graph';
import WalletConnectComponent from './Wallet Connect/WalletConnect';

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(true);
  const [childData, setChildData] = useState({ })
  const childDataRef = useRef(childData)

  const updateChildData = (obj) => {
    console.log('change>>>>>',obj)
    setChildData(prev => ({...prev, ...obj }) )
    childDataRef.current = obj
  }

  useEffect(()=> {
    console.log('now new value is ',childData)
    console.log('window.innerWidth',window.innerWidth)
    //setIsMobile(window.innerWidth > 768 ? false : true)
  },[childData])

  return (
    <div>
        <div className="row " style={{backgroundColor:"#23242f"}}>
        <div className="col-md-8 col-12 flex-column p-0">
          <Header />
          <div className="graph d-md-block d-none">
            <Graph childData={childData} isMobile={isMobile} />
          </div>

        </div>
          <div className="col-md-4 col-12 d-flex flex-column RightSectionMain px-0" >
            {isMobile ? <Calculator updateChildData={updateChildData} /> : <Graph isMobile={isMobile} childData={childData} />}
          </div>
        </div>
        <div className="buttons pt-8 mt-8">
        <button
          type="button"
          className="c-button css"
          onClick={() => setIsMobile(!isMobile)}
        >
          <span className="c-button__icon css-1qx7bcs"></span>
          {isMobile === true
            ? "VIEW GRAPH/TRADING HISTORY"
            : "HIDE GRAPH/TRADING HISTORY"}
        </button>
      </div>
    </div>
  )
}

export default Dashboard
