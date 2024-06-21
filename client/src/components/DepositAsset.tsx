import { styled } from '@material-ui/core/styles';
// import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { depositAssetRequest, getPortfolioAssets, getSupportedAssets, getSupportedCurrencies } from '../requests/PortfolioRequests';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import { useAuth } from '../context/Auth';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import { usePortfolio } from '../context/Portfolio';

const StyledCard = styled(Card)({
    padding: "1em",
    display: "flex",
    flexDirection: "column",
    // marginTop: "20px",
    background: "transparent",
    border: "none",
    boxShadow: "none"
})

const StyledTypography = styled(Typography)({
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textDecorationColor: "#3f51b5",
    textUnderlineOffset: "0.2em"
})

const StyledMessage = styled(Typography)({
    marginTop: "0.5em",
    fontSize: "14px"
})

const StyledForm = styled(FormControl)({
    marginTop: "20px"
})

const StyledMenuItem = styled(MenuItem)({
    backgroundColor: "white !important",
})

const StyledAlert = styled(Alert)({
    width: "175px",
    alignSelf: "center",
    marginTop: "10px"
})

const StyledTextField = styled(TextField)({
    marginTop: "1em",
    width: "225px"
})

const StyledButton = styled(Button)({
    alignSelf: "center",
    marginTop: "0.75em",
    backgroundColor: "#3f51b5",
    color: "white",

    "&:hover": {
        color: "#3f51b5"
    }
})

const useStyles = makeStyles(theme => ({
    menuPaper: {
        maxHeight: "300px"
    }
}))

const DepositAsset = ({ portfolioId, wallets, loadingPortfolio }) => {
    const classes = useStyles()
    const [currencies, setCurrencies] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [chosenCurrency, setChosenCurrency] = useState("")
    const [amount, setAmount] = useState("")
    const [showError, setShowError] = useState(false)
    const { userId, authToken } = useAuth()
    const { requestAssets } = usePortfolio()
    const wallet = wallets?.filter(wal => wal.portfolio === portfolioId) ?? []

    useEffect(() => {
        const getCurrencies = async () => {
            const supportedAssets = await getSupportedAssets()
            const supportedCurrencies = await getSupportedCurrencies()
            setCurrencies(supportedAssets.concat(supportedCurrencies as string[]))
            setLoading(false)
        }

        getCurrencies()
    }, [])

    const submitHandler = async () => {
        if (chosenCurrency == "" || amount == "" || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setShowError(true)
        } else {
            setShowError(false)
            setAmount("")
            await depositAssetRequest(authToken as string, userId as string, portfolioId, chosenCurrency, amount)
            await requestAssets()
        }
    }

    const shortText = wallet[0]?.address ? wallet[0]?.address.slice(0, 6) + " ... " + wallet[0]?.address.slice(-4) : ""

    const copyAddress = () => (
        navigator.clipboard.writeText(wallet[0]?.address)
    )

    return (
        <StyledCard>
            <StyledTypography align="left" variant="h6">Deposit Asset</StyledTypography>
            {
                loading || loadingPortfolio ?
                    <StyledMessage align="left" variant="h6">Loading...</StyledMessage> :
                    portfolioId == "" ?
                    <StyledMessage align="left" variant="h6">No portfolios found</StyledMessage> :
                    <>
                        <StyledMessage align="center" variant="h6">
                            {shortText}
                            <Button
                                style={{ marginLeft: "0.5rem" }}
                                onClick={copyAddress}
                            >
                                copy
                            </Button>
                        </StyledMessage>
                        <StyledForm variant="outlined">
                            <Select
                                id="select_portfolio"
                                onChange={(e: ChangeEvent<{ value: unknown }>) => setChosenCurrency(e.target.value as string)}
                                value={chosenCurrency}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left"
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left"
                                    },
                                    getContentAnchorEl: null,
                                    classes: { paper: classes.menuPaper }
                                }}
                                style={{height: "2.5rem"}}
                            >
                                {currencies.map(currency => <StyledMenuItem key={currency} value={currency}>{currency}</StyledMenuItem>)}
                            </Select>
                        </StyledForm>
                        <StyledTextField
                            id="standard-basic"
                            label="Deposit amount" 
                            variant="filled"
                            size="small"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        { showError && <StyledAlert severity="error">Invalid input!</StyledAlert> }
                        <StyledButton variant="outlined" size="small" onClick={() => submitHandler()} >Submit</StyledButton>
                    </>
            }
        </StyledCard>
    )
}

export default DepositAsset