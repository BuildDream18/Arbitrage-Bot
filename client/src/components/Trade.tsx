import { useEffect, useRef, useState } from "react"
import { Button, Container, makeStyles, Tab, Tabs, TextField, Toolbar, Typography } from "@material-ui/core"
import { Alert, Autocomplete, Color } from "@material-ui/lab"
import { createChart, IChartApi, ISeriesApi, ITimeScaleApi } from 'lightweight-charts';
import { createTrade, getSupportedAssets } from "../requests/PortfolioRequests"
import { useAuth } from "../context/Auth"
import { useSocket } from "../context/Socket"
import OrdersTable from "../containers/OrdersTable"
import PortfolioSelect from "./PortfolioSelect"
import { Link } from "react-router-dom"
import { Asset } from "../../../server/src/data/Asset"
import { getHistoricData } from "../requests/historyRequests";

import BTCImage from "../assets/coingroup/bitcoin.svg";
import DOGEImage from "../assets/coingroup/dogecoin.svg";
import ETHImage from "../assets/coingroup/ethereum.svg";
import USDTImage from "../assets/coingroup/usdt.svg";

import { styled } from '@material-ui/styles';
import "../styles/portfolio.css"
import { withStyles } from "@material-ui/core/styles";
import { Checkbox, 
        FormControlLabel, 
        InputAdornment,
        MenuItem,
        Slider, 
} from "@material-ui/core";
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import React from "react";
import { ListPortfoliosResponse } from "../../../server/src/responses/ListPortfoliosResponse";
import { usePortfolio } from "../context/Portfolio";

const useStyles = makeStyles(theme => ({
    banner: {
        marginBottom: "16px",
    },
    tabContainer: {
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
    tradesContainer: {
        marginTop: "100px",
        maxHeight: "250px",
        overflow: "auto"
    },
    selection: {
        minWidth: "200px",
    },
    tradeContainer: {
        margin: "16px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },
    tradeInput: {
        margin: "8px",
    },
    tradeButton: {
        margin: "16px",
    },
    selectContainer: {
        display: "flex",
        flexDirection: "column"
    },
    parentContainer: {
        width: "70%",
        marginLeft: "30px",
        background: "rgba(255, 255, 255, 0.4)",
        boxShadow: "0px 0px 100px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(35px)",
        borderRadius: "60px",
        padding: "20px 50px 50px 50px",
    },centerItem: {
        textAlign: "center"        
    },
    topLength: {
        marginTop: "10px"
    },
    centerTopItem: {
        marginTop: "10px",
        textAlign: "center"   
    },
    mainContainer: {
        background: "rgba(255, 255, 255, 0.4)",
        boxShadow: "0px 0px 100px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(35px)",
        borderRadius: "60px",
        padding: "20px 50px 50px 50px",
        minWidth: "250px"
    },
    componentWidth: {
        minWidth: "250px"
    },
    componentMargin: {
        margin: "5px 0"
    },
    errorComponentMargin: {
        margin: "5px 0",
        color: "red"
    },
    displayVisibleComponent: {
        display: "visible"
    },
    displayNoneComponent: {
        display: "none"
    },
    componentRight: {
        float: "right"
    },
    componentLeft: {
        float: "left"
    }
}))

enum TradeCode {
    BUY = 0,
    SELL = 1
}

const StyledTextField = styled(TextField)({
    marginTop: "1em",
    width: "250px"
})

const ButtonRadius = styled(Button)({
    borderRadius: "30px"
})

const ButtonDeposit = styled(Button)({
    borderRadius: "10px"
})

const currencies = [
    {
      value: 'USDT',
      label: '0 USDT',
    },
];

const NumberFormatCustom = props => {
    const { inputRef, onChange, ...other } = props;
  
    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
            isNumericString
            // prefix="$"
        />
    );
}
  
NumberFormatCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
    // name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

const PrettoSlider = withStyles({
    root: {
        color: '#52af77',
        height: 8,
    },
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        marginTop: -8,
        marginLeft: -12,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
    },
    track: {
        height: 8,
        borderRadius: 4,
    },
    rail: {
        height: 8,
        borderRadius: 4,
    },
})(Slider);

const marks = [
    {
      value: 0,
      label: '',
    },
    {
      value: 10,
      label: '10',
    },
    {
      value: 20,
      label: '20',
    },
    {
      value: 30,
      label: '30',
    },
    {
      value: 40,
      label: '40',
    },
    {
      value: 40,
      label: '40',
    },
    {
      value: 50,
      label: '50',
    },
];

const coinData = {
    BTC: {
      label: "BTC",
      image: "",
      price: ""
    },
    ETH: {
      label: "ETH",
      image: "",
      price: ""
    },
    BNB: {
      label: "BNB",
      image: "",
      price: ""
    },
    DOGE: {
        label: "DOGE",
        image: "",
        price: ""
    }
  }

let chart = {} as IChartApi
let lineSeries = {} as ISeriesApi<"Line">
let timeScale = {} as ITimeScaleApi

export function Trade() {
    const classes = useStyles()
    const [selectedTab, setSelectedTab] = useState(TradeCode.BUY)
    const [currencyOptions, setCurrencyOptions] = useState<string[]>([])
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>("BTC")
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
    const [quantity, setQuantity] = useState("10.00")
    const [price, setPrice] = useState("")
    const [showBanner, setShowBanner] = useState(false)
    const [banner, setBanner] = useState("")
    const [bannerType, setBannerType] = useState("")
    const [loadingSum, setLoadingSum] = useState(true)
    const [historicData, setHistoricData] = useState<any[]>([])
    const [coinStatus, setCoinStatus] = useState("BTC")
    
    // const ws = useRef<WebSocket>(null)
    // const ws1 = useRef<WebSocket>(null)
    const chartRef = useRef<HTMLDivElement | null>(null)
    
    const [priceData, setPriceData] = useState<any>({})
    
    const {userId, authToken} = useAuth()
    const { loading: loadingPortfolios, loadingData, portfolios, wallets, portfolioId, assets, setPortfolioId, requestAssets, onCreatePortfolio } = usePortfolio()
    const {loading: loadingSocket} = useSocket()

    const tradable = !!portfolioId && parseFloat(quantity) > 0 && parseFloat(price) > 0

    const options = { 
        width: 800,
        height: 300,
        kineticScroll: {
            mouse: true
        },
        minBarSpacing: 10,
        timeVisible: false,
        layout: {
            backgroundColor: '#253248',
            textColor: 'rgba(255, 255, 255, 0.9)',
        },
        priceScale: {
            borderColor: '#485c7b',
        },
        timeScale: {
            borderColor: '#485c7b',
        },
    }

    useEffect(() => {
        chart = createChart(chartRef.current as HTMLElement, options);
        lineSeries = chart.addLineSeries();
        timeScale = chart.timeScale()
    }, []);
    
    useEffect(() => {
        getHistoricData(coinStatus).then(data => {
            const result = data.reverse().map(el => {
                const date = new Date(parseInt(el[0]) * 1000)
                const time = date.toISOString().slice(0, 10)
                return {time: time, value: el[4]}
            })
            setHistoricData(result)
            lineSeries.setData(result);
            timeScale.fitContent();
        })
    }, [coinStatus])

    useEffect(() => {
        // const assetName = update["asset"].split("-")[0]
        // currData[assetName] = update["price"]
        if(priceData[coinStatus]) {
            lineSeries.update({time: new Date().toISOString().slice(0, 10), value: priceData[coinStatus]["price"]})
            timeScale.fitContent();
        }
    }, [coinStatus, priceData])
    
    const updateCurrencyOptions = async (tab) => {
        setCurrencyOptions(["Loading..."])
        if (tab === TradeCode.BUY) {
            const supportedAssets = await getSupportedAssets()
            setCurrencyOptions(supportedAssets)
        } else if (tab === TradeCode.SELL) {
            if (assets !== null) {
                const supportedAssets = await getSupportedAssets()
                const currencyOptions = assets.map(asset => asset.name).filter(assetName => supportedAssets.includes(assetName))
                setCurrencyOptions(currencyOptions)
            }
        }
    }
    
    useEffect(() => {
        updateCurrencyOptions(selectedTab)
    }, [portfolioId])
    
    const tradeHandler = async (tab) => {
        if (portfolios.length > 0) {
            const ids = (portfolios).map((portfolio) => portfolio.id)
            const portfolioId = ids.find((id) => portfolioId === id)
            
            if (quantity === "0") {
                setShowBanner(true)
                setBannerType("error")
                setBanner("Invalid Quantity")
                return
            }
            
            if (priceData[coinStatus] === "0") {
                setShowBanner(true)
                setBannerType("error")
                setBanner("Invalid Price")
                return
            }
            
            const trade = await createTrade(
                userId as string,
                authToken as string,
                portfolioId as string,
                coinStatus + "-USD",
                tab === TradeCode.BUY ? "buy" : "sell",
                quantity,
                price
            )
            
            setShowBanner(true)
            setBannerType(trade.success ? "success" : "error")
            setBanner(trade.success ? "Trade Created" : (trade?.error ?? "Something went wrong"))
        }
    }

    const [tradeAmount, setTradeAmount] = useState("10.00")
    const [leverageAmount, setLeverageAmount] = useState(30)

    const [tradingType, setTradingType] = useState<boolean>(true)
    const [currency, setCurrency] = useState('USDT');
    const [showDepositError, setShowDepositError] = useState<boolean>(false)
    const [showTradeAmountBtn, setShowTradeAmountBtn] = useState<boolean>(false)
    const [tpSelect, setTpSelect] = useState<boolean>(false)
    const [tpValue, setTpValue] = useState(3)
    const [slSelect, setSlSelect] = useState<boolean>(false)
    const [slValue, setSlValue] = useState(3)


    useEffect(() => {
        setTradeAmount("10.00")
        setTpSelect(false)
    }, [])

    const handleLeverageSlide = (e, newValue) => {
        setLeverageAmount(newValue)
    }

    const handleLeverageInputChange = (e) => {
        setLeverageAmount(e.target.value === '' ? 0 : Number(e.target.value));
    };
    
    const handleLeverageBlur = () => {
        if (leverageAmount < 0) {
            setLeverageAmount(0);
        } else if (leverageAmount > 50) {
            setLeverageAmount(50);
        }
    };

    const changeTPStatus = (e) => {
        setTpSelect(e.target.checked)
    }

    const calcTpValue = (e) => {
        setTpValue(e.target.value)
    }

    const changeSLStatus = (e) => {
        setSlSelect(e.target.checked)
    }

    const calcSlValue = (e) => {
        setSlValue(e.target.value)
    }
    
    const min = 0
    const max = selectedAsset === null ? 0 : selectedAsset.amount
    
    const tokenSelect = (coinLabel) => {
        setCoinStatus(coinLabel);
    }
    

    return (
        <div id="portfolio_container">
            <div id="portfolio_column_container" className={classes.mainContainer}>
                <div className={classes.centerItem}>
                    <h2>New { tradingType ? "trade" : "order"}</h2>
                </div>
                {/* <div className={classes.centerTopItem}>
                    <ButtonRadius 
                        variant={tradingType? "outlined" : "text"}
                        onClick={() => setTradingType(true)}>
                        Market
                    </ButtonRadius>
                    <ButtonRadius 
                        variant={tradingType? "text" : "outlined"}
                        onClick={() => setTradingType(false)}>
                        Limit/Stop
                    </ButtonRadius>
                </div> */}
                {/* <div className={classes.topLength}>
                    <h4 className={classes.componentMargin}>Wallet to deposit</h4>
                    <TextField
                        id="outlined-select-currency"
                        select
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={currency}
                        variant="outlined"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AttachMoneyIcon />
                                </InputAdornment>
                            ),
                        }}
                        className={classes.componentWidth}
                        onFocus={() => setShowDepositError(true)}>
                        {currencies.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <div className={showDepositError? classes.displayVisibleComponent : classes.displayNoneComponent}>
                        <h6 className={classes.errorComponentMargin}>
                            This wallet is empty. Want to make a deposit?
                        </h6>
                        <ButtonDeposit 
                            variant="contained"
                            onClick={() => setShowDepositError(false)}>
                            Deposit USDT
                        </ButtonDeposit>
                    </div>
                </div> */}
                <PortfolioSelect
                    portfolios={portfolios}
                    portfolioId={portfolioId}
                    setPortfolioId={setPortfolioId}
                    isLoading={loadingPortfolios}
                />
                {portfolios.length === 0 ? (<Button component={Link} to="/overview" variant="contained" color="primary">
                    Create Portfolio
                </Button>) : ""}
                {/* <div>
                    <Autocomplete
                        value={selectedCurrency}
                        className={`${classes.tradeInput} ${classes.selection}`}
                        options={["USDT"]}
                        onChange={(event, value) => {
                            setShowBanner(false)
                            if (value === null) {
                                setQuantity("")
                            }
                            if (selectedTab === TradeCode.SELL) {
                                const userAsset = (assets.find(asset => asset.name === value))
                                setQuantity(userAsset?.amount as string)
                                setSelectedAsset(userAsset as Asset)
                            }
                            setSelectedCurrency(value as string)
                        }}
                        renderInput={params => (<TextField {...params} label="Currency" />)}
                    />
                </div> */}
                {/* <div className={classes.topLength}>
                    <StyledTextField
                        id="standard-basic"
                        label="Trade amount" 
                        variant="filled"
                        size="small"
                        value={tradeAmount}
                        onChange={e => setTradeAmount(e.target.value)}
                        onFocus={() => setShowTradeAmountBtn(true)}
                        // onBlur={() => setShowTradeAmountBtn(false)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">USDT</InputAdornment>,
                            inputComponent: NumberFormatCustom,
                        }}
                    />
                    <div className={showTradeAmountBtn? classes.displayVisibleComponent : classes.displayNoneComponent}>
                        <ButtonDeposit 
                            variant="contained" 
                            size="small"
                            onClick={() => {
                                setShowTradeAmountBtn(false);
                                setShowDepositError(true);
                                setTradeAmount("10.00");
                            }}>
                            10.00
                        </ButtonDeposit>
                    </div>
                </div>
                <div className={classes.topLength}>
                    <StyledTextField
                        id="standard-basic"
                        label="Leverage" 
                        variant="filled"
                        size="small"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">x</InputAdornment>,
                        }}
                        value={leverageAmount}
                        onChange={handleLeverageInputChange}
                        onBlur={handleLeverageBlur}
                    />
                </div> */}
                <div className={classes.topLength}>
                    {/* <PrettoSlider 
                        valueLabelDisplay="off"
                        aria-label="input-slider"
                        defaultValue={leverageAmount}
                        marks={marks}
                        max={50}
                        onChange={handleLeverageSlide}
                    /> */}
                </div>
                {/* <div className={classes.topLength}>
                    <label className={classes.componentLeft}>Volume</label>
                    <label className={classes.componentRight}>{Number(tradeAmount) * leverageAmount} USDT</label>
                </div> */}
                {/* <div className={classes.topLength}>
                    <label className={classes.componentLeft}>Volume in BTC </label>
                    <label className={classes.componentRight}>{Number(coinData.BTC.price) > 0 ? Number(tradeAmount) * leverageAmount / Number(coinData.BTC.price) : 0}</label>
                </div> */}
                {/* <div className={classes.topLength}>
                    <label className={classes.componentLeft}>Commission </label>
                    <label className={classes.componentRight}>0.04%</label>
                </div> */}
                {/* <div className={classes.topLength}>
                    <FormControlLabel 
                        control={<Checkbox 
                                    checked={tpSelect} 
                                    onChange={changeTPStatus} 
                                />} 
                        label="TP Take Profit" />
                    <br/>
                    <TextField
                        id="outlined-number"
                        type="number"
                        value={tpSelect? tpValue: ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">
                                                USDT&nbsp;&nbsp;&nbsp;&nbsp;{tpSelect? '+' + tpValue * 10 + "% |": ""}
                                            </InputAdornment>
                        }}
                        onChange={calcTpValue}
                        onFocus={() => setTpSelect(true)}
                        style={{width: "250px"}}
                    />
                </div>
                <div className={classes.topLength}>
                    <FormControlLabel 
                        control={<Checkbox 
                            checked={slSelect} 
                            onChange={changeSLStatus} 
                        />} 
                        label="SL Stop Loss" />
                    <br/>
                    <TextField
                        id="outlined-number"
                        type="number"
                        value={slSelect? slValue: ""}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">
                                                USDT&nbsp;&nbsp;&nbsp;&nbsp;{slSelect? '-' + slValue * 10 + "% |": ""}
                                            </InputAdornment>
                        }}
                        onChange={calcSlValue}
                        onFocus={() => setSlSelect(true)}
                        style={{width: "250px"}}
                    />
                </div> */}
                {/* <div className={classes.topLength}>
                    <FormControlLabel control={<Checkbox />} label="AI Auto increase" />
                </div> */}
                {/* <div className={classes.centerTopItem}>
                    <ButtonRadius
                        disabled={!tradable}
                        variant="contained"
                        onClick={() => tradeHandler("sell")}
                    >
                        Sell
                    </ButtonRadius>
                    <ButtonRadius
                        disabled={!tradable}
                        variant="contained"
                        style={{marginLeft: "20px"}}
                        onClick={() => tradeHandler("buy")}
                    >
                        Buy
                    </ButtonRadius>
                </div> */}
                <Container className={classes.tabContainer}>
                    <Toolbar>
                        <Tabs value={selectedTab}
                            onChange={(event, index) => {
                                setSelectedTab(index)
                                updateCurrencyOptions(index)
                                setSelectedCurrency(assets[0]?.name??"")
                                setQuantity("")
                                setPrice("")
                                setShowBanner(false)
                            }}
                            textColor="primary"
                            indicatorColor="primary">
                            <Tab style={{minWidth: "100px"}} label="Buy"></Tab>
                            <Tab style={{minWidth: "100px"}} label="Sell"></Tab>
                        </Tabs>
                    </Toolbar>
                    
                    {/* <Container className={classes.tradeContainer}> */}
                        <Autocomplete
                            value={selectedCurrency}
                            className={`${classes.tradeInput} ${classes.selection}`}
                            options={currencyOptions}
                            onChange={(event, value) => {
                                setShowBanner(false)
                                if (value === null) {
                                    setQuantity("")
                                }
                                else if (selectedTab === TradeCode.SELL) {
                                    const userAsset = (assets.find(asset => asset.name === value))
                                    setQuantity((userAsset?.amount as string).trim())
                                    setSelectedAsset(userAsset ?? null)
                                }
                                setSelectedCurrency(value)
                            }}
                            renderInput={params => (<TextField {...params} label="Currency"/>)}
                        />
                        <TextField
                            className={classes.tradeInput}
                            variant="outlined"
                            value={quantity}
                            inputProps={{min, max}}
                            onChange={(event) => {
                                setShowBanner(false)
                                
                                let value = event.target.value
                                if (isNaN(+value)) {
                                    setQuantity(quantity.trim())
                                    return
                                }
                                if (selectedTab === TradeCode.SELL) {
                                    if (value !== "") {
                                        if (parseFloat(value) > max) {
                                            setShowBanner(true)
                                            setBannerType("warning")
                                            setBanner("This trade may not fulfill due to insufficient balance.")
                                        } else if (parseFloat(value) < min) {
                                            value = min.toString()
                                        }
                                    }
                                } else if (selectedTab === TradeCode.BUY) {
                                    setShowBanner(false)
                                    // if (parseFloat(value) === 0) {
                                    //     value = ""
                                    // }
                                }
                                setQuantity(value.trim())
                            }}
                            disabled={!currencyOptions.includes(selectedCurrency as string)}
                            label="Quantity"/>
                        <TextField
                            className={classes.tradeInput}
                            variant="outlined"
                            value={price}
                            onChange={event => {
                                setShowBanner(false)
                                let value = event.target.value
                                if (value === "") {
                                    value = ""
                                } else if (isNaN(+value)) {
                                    value = price
                                } else if (parseFloat(value) < 0) {
                                    value = price
                                }
                                
                                const currency = assets.filter(asset => asset.name === "USD")[0]?.amount
                                
                                if (currency !== undefined && selectedTab === TradeCode.BUY) {
                                    if (parseFloat(quantity) * parseFloat(value) > parseFloat(currency)) {
                                        setShowBanner(true)
                                        setBannerType("warning")
                                        setBanner("This trade may not fulfill due to insufficient balance.")
                                    }
                                }
                                
                                if (selectedTab === TradeCode.SELL) {
                                    if (parseFloat(quantity) > parseFloat(selectedAsset?.amount as string)) {
                                        setShowBanner(true)
                                        setBannerType("warning")
                                        setBanner("This trade may not fulfill due to insufficient balance.")
                                    }
                                }
                                
                                setPrice(value.trim())
                            }}
                            disabled={quantity === "" || quantity === "0"}
                            label="Price"/>
                    {/* </Container> */}
                    
                    <Typography>{
                        (selectedCurrency === null) ? "" :
                            (priceData[selectedCurrency] === undefined) ? "LOADING.." : (selectedCurrency + " Market Price: $" + parseFloat(priceData[selectedCurrency]).toFixed(4) + " USD")
                    }</Typography>
                    
                    <Button
                        className={classes.tradeButton}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            tradeHandler(selectedTab)
                        }}
                        disabled={!tradable}
                    >
                        Trade
                    </Button>
                </Container>
                <Container className={classes.banner}>
                    {showBanner ? <Alert severity={bannerType as Color}>{banner}</Alert> : ""}
                </Container>
            </div>
            <div className={classes.parentContainer}>
            <h2>{parseFloat(priceData[coinStatus]??0).toFixed(2)}</h2>
            <div style={{ width: "fit-content", margin: "auto" }} ref={chartRef}>
                <div className={classes.btnContainer}>
                    <Button
                        // className={classes.coinChooseBtn}
                        style={{background: coinStatus === "BTCUSDT" ? "#044f9c" : "#193049"}}
                        onClick={() => tokenSelect(coinData.BTC.label)}
                        variant="outlined"
                        color="inherit"
                    >
                        <div className={classes.btnContentGroupContainer}>
                        <img src={BTCImage} width="24px"/><img src={USDTImage} width="24px"/><span className={classes.buttonLabel}>{coinData.BTC.label}</span>
                        </div>
                    </Button>
                    <Button
                        // className={classes.coinChooseBtn}
                        style={{background: coinStatus === "ETHUSDT" ? "#044f9c" : "#193049"}}
                        onClick={() => tokenSelect(coinData.ETH.label)}
                        variant="outlined"
                        color="inherit"
                    >
                        <div className={classes.btnContentGroupContainer}>
                        <img src={ETHImage} width="24px"/><img src={USDTImage} width="24px"/>
                        <span className={classes.buttonLabel}>
                            {coinData.ETH.label}
                        </span>
                        </div>
                    </Button>
                    <Button
                        // className={classes.coinChooseBtn}
                        style={{background: coinStatus === "BNBUSDT" ? "#044f9c" : "#193049"}}
                        onClick={() => tokenSelect(coinData.DOGE.label)}
                        variant="outlined"
                        color="inherit"
                    >
                        <div className={classes.btnContentGroupContainer}>
                        <img src={DOGEImage} width="24px"/><img src={USDTImage} width="24px"/>
                        <span className={classes.buttonLabel}>
                            {coinData.DOGE.label}
                        </span>
                        </div>
                    </Button>
                </div>
            </div>
            <Container className={classes.tradesContainer}>
                <h4>Recent Trades</h4>
                <OrdersTable portfolios={portfolios} selectedPortfolioId={portfolioId}/>
            </Container>
            </div>
        </div>
    )
}

export default Trade
