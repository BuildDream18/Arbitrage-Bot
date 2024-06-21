import React, { useEffect, useRef, useState } from "react"
import { getPortfolioAssets, getSupportedAssets, getSupportedCurrencies } from "../requests/PortfolioRequests"
import {Button} from "@material-ui/core"
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from "@material-ui/styles";
import { Link } from "react-router-dom"
import { coinsWithImageLink } from "../constants";
import { Typography } from "@material-ui/core";
import { Asset } from "../../../server/src/data/Asset";
import BTCImage from "../assets/coingroup/bitcoin.svg";
import BNBImage from "../assets/coingroup/bnb.svg";
import ETHImage from "../assets/coingroup/ethereum.svg";
import USDTImage from "../assets/coingroup/usdt.svg";
import { getApi } from "../requests/DefaultRequest";
import { usePortfolio } from "../context/Portfolio";
import { useSocket } from "../context/Socket";

const useStyles = makeStyles(theme => ({
  mainContainer: {
    background: "rgba(255, 255, 255, 0.4)",
    boxShadow: "0px 0px 100px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(35px)",
    borderRadius: "60px",
    padding: "50px",
  },
  btnContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px"
  },
  btnContentGroupContainer: {
    display: "flex", 
    alignItems: "center", 
    margin: "0.5rem 1rem"
  },
  buttonLabel: {
    color: 'white', 
    fontWeight: 'bold', 
    marginLeft: '10px'
  },
  tableContainer: {
    minWidth: "800px",
    width: "100%"
  },
  icon: {
    height: "32px",
    width: "32px"
  },
  tableCell: {
    width: "150px"
  },
  message: {
    marginTop: "50px"
  }
}))

const coinData = {
  BTC: {
    label: "BTCUSDT",
    image: "",
    price: ""
  },
  ETH: {
    label: "ETHUSDT",
    image: "",
    price: ""
  },
  BNB: {
    label: "BNBUSDT",
    image: "",
    price: ""
  }
}

const PortfolioData = ({ portfolioId, loadingPortfolio, assets, loadingData }
  : { portfolioId: string, loadingPortfolio: boolean, assets: Asset[], loadingData: boolean }) => {
  const classes = useStyles()
  const [coinStatus, setCoinStatus] = useState("BTC")
  const { requestAssets } = usePortfolio()
  const { priceData } = useSocket()

  async function getSupportedCurrencyPairs(): Promise<string[]> {
    // const supportedAssets: string[] = await getApi("https://crypto.johnturkson.com/GetSupportedAssets").then(response => response.data)
    // const supportedAssets = ["BTC", "ETH", "DOGE"]
    const supportedAssets = await getSupportedAssets()
    // const supportedCurrencies: string[] = await getApi("https://crypto.johnturkson.com/GetSupportedCurrencies").then(response => response.data)
    // const supportedCurrencies = ["USD"]
    const supportedCurrencies = await getSupportedCurrencies()
    return supportedAssets.flatMap(asset => supportedCurrencies.map(currency => `${asset}-${currency}`))
  }

  useEffect(() => {
    const getPortfolioData = async () => {
      await requestAssets()
    }

    getPortfolioData()
  }, [portfolioId])
  
  const getSum = () => {
    let sum = 0;
    assets.forEach(asset => {
      sum += priceData[asset.name] ? parseFloat(priceData[asset.name]) * parseFloat(asset.amount) : 0
    })
    return sum.toFixed(2)
  }



  const tokenSelect = (coinLabel) => {
    setCoinStatus(coinLabel);
  }

  return (
    <div id="portfolio_data_container" className={classes.mainContainer}>
      {/* <div className={classes.btnContainer}>
        <Button
          // className={classes.coinChooseBtn}
          style={{background: coinStatus === "BTCUSDT" ? "#044f9c" : "#193049"}}
          onClick={() => tokenSelect(coinData.BTC.label)}
          variant="outlined"
          color="white">
            <div className={classes.btnContentGroupContainer}>
              <img src={BTCImage} width="24px"/><img src={USDTImage} width="24px"/><span className={classes.buttonLabel}>{coinData.BTC.label}</span>
            </div>
        </Button>
        <Button
          className={classes.coinChooseBtn}
          style={{background: coinStatus === "ETHUSDT" ? "#044f9c" : "#193049"}}
          onClick={() => tokenSelect(coinData.ETH.label)}
          variant="outlined"
          color="inherit">
            <div className={classes.btnContentGroupContainer}>
              <img src={ETHImage} width="24px"/><img src={USDTImage} width="24px"/>
              <span className={classes.buttonLabel}>
                {coinData.ETH.label}
              </span>
            </div>
        </Button>
        <Button
          className={classes.coinChooseBtn}
          style={{background: coinStatus === "BNBUSDT" ? "#044f9c" : "#193049"}}
          onClick={() => tokenSelect(coinData.BNB.label)}
          variant="outlined"
          color="inherit">
            <div className={classes.btnContentGroupContainer}>
              <img src={BNBImage} width="24px"/><img src={USDTImage} width="24px"/>
              <span className={classes.buttonLabel}>
                {coinData.BNB.label}
              </span>
            </div>
        </Button>
      </div> */}
      <TableContainer className={classes.tableContainer}>
        <Table>
          <TableHead>
              <TableRow>
                <TableCell align="center" className={classes.tableCell}>Asset</TableCell>
                <TableCell align="center" className={classes.tableCell}>Name</TableCell>
                <TableCell align="center" className={classes.tableCell}>Amount</TableCell>
                <TableCell align="center" className={classes.tableCell}>Value</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            { assets.map(asset => (
              <TableRow key={asset.name}>
                <TableCell align="center" className={classes.tableCell}>
                    {
                      coinsWithImageLink.hasOwnProperty(asset.name) &&
                      // <Link to={`/coin/${coinsWithImageLink[asset.name].name}`}>
                        <img src={coinsWithImageLink[asset.name].imageUrl} className={classes.icon}/>
                      // </Link>
                    }
                </TableCell>
                <TableCell align="center" className={classes.tableCell}>{asset.name}</TableCell>
                <TableCell align="center" className={classes.tableCell}>{asset.amount}</TableCell>
                <TableCell align="center" className={classes.tableCell}>
                  {
                    priceData.hasOwnProperty(asset.name) ?
                    `${(parseFloat(priceData[asset.name]) * parseFloat(asset.amount)).toFixed(2)}` :
                    "Loading..."
                  }
                </TableCell>
              </TableRow>
            ))}
            {
              assets.length != 0 &&
              <TableRow>
                <TableCell align="center" className={classes.tableCell}>
                  <img src={"total.png"} className={classes.icon}/>
                </TableCell>
                <TableCell align="center" >Total</TableCell>
                <TableCell align="center" ></TableCell>
                <TableCell align="center">{getSum()}</TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
      {
        // loadingData ?
        // <Typography align="center" variant="h6" className={classes.message}>Loading...</Typography> :
        assets.length == 0 ?
        <Typography align="center" variant="h6" className={classes.message}>No assets</Typography> : null
      }
    </div>
  )
}

export default PortfolioData
