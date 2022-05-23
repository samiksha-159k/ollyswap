import React from 'react'
import './THistory.css'
import _ from 'lodash'

function THistory(props) {
  console.log('props',props)

  const displayList = () => {
    var displayItems = _.map(props.data, (each, index) => {
      return (
        <tr className='sa-border' style={{borderRadius:'20px !important' }}>
            <td>
                18/04/2022 <br/> 3:47 PM
            </td>
            <td>
                BUSD/ETH
            </td>
            <td>20,8399.97 </td>
            <td><a href="#">0x23rf56...<br/>0x2dc52</a></td>
        </tr>
      )
    })
    return displayItems;
  }

  return (
    <div className=''>
        <div className="container sa-income mt-2 px-0">
          <h3 className='sa-table_head'>Trading History</h3>
          <div style={{border:'10px solid red !important'}}>

              {(typeof props.data !== 'undefined' && Array.isArray(props.data) && props.data.length > 0) ? (
                <table className="table table-borderless table-responsive-sm tabulardata ">
                    <thead>
                    <tr className="sa-table_header  ">
                        <th scope="col" className="  ">
                            DATE/TIME
                        </th>
                        <th scope="col" className="">
                            PAIR
                        </th>
                        <th scope="col" className="">
                            TOKENS
                        </th>
                        <th scope="col" className="">
                            TXN #
                        </th>
                    </tr>
                    </thead>
                    <tbody>

                      {displayList()}

                    </tbody>
                </table>
              ):
                (<div style={{ color: 'white', fontSize: 11 }}>No data found.</div>)
              }
                </div>
            </div>
    </div>
  )
}

export default THistory