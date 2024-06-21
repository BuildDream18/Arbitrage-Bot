import CreatePortfolio from "../components/CreatePortfolio"
import PortfolioData from "../components/PortfolioData"
import PortfolioSelect from "../components/PortfolioSelect"
import React, { useEffect, useState } from "react"
import { getPortfolioAssets, getPortfoliosRequest, getWalletsRequest } from "../requests/PortfolioRequests"
import { Portfolio, PortfolioWithWallet } from "../../../server/src/data/Portfolio"
import { Wallet } from "../../../server/src/data/Wallet"
import Alert from '@material-ui/lab/Alert';
import Grow from '@material-ui/core/Grow';
import { styled } from '@material-ui/styles';
import { Asset } from "../../../server/src/data/Asset"
import { useAuth } from "../context/Auth"
import DepositAsset from "../components/DepositAsset"
import WithdrawAsset from "../components/WithdrawAsset"

import "../styles/portfolio.css"
import { makeStyles } from "@material-ui/core"
import { useSocket } from "../context/Socket"
import { usePortfolio } from "../context/Portfolio"

const StyledSuccessAlert = styled(Alert)({
    marginTop: "-90px",
    marginBottom: "10px"
})

const useStyles = makeStyles(theme => ({
    mainContainer: {
        background: "rgba(255, 255, 255, 0.4)",
        boxShadow: "0px 0px 100px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(35px)",
        borderRadius: "60px",
        padding: "20px 50px 50px 50px",
        minWidth: "250px"
    },
}))

const PortfolioContainer = () => {
    const classes = useStyles()
    const [showSuccessAlert, setShowSuccessAlert] = useState(false)
    const { loading, loadingData, portfolios, wallets, portfolioId, assets, setPortfolioId, requestAssets, onCreatePortfolio } = usePortfolio()
    // useEffect(() => {
    //     setOnMessage(setAssets, getPortfolioAssets, portfolioId)
    // }, [portfolioId])

    return (
        <div id="portfolio_column_container" style={{marginTop: "50px"}}>
            <Grow in={showSuccessAlert}>
                <StyledSuccessAlert severity="success">Portfolio created successfully!</StyledSuccessAlert>
            </Grow>
            <div id="portfolio_container">
                <div id="portfolio_column_container" className={classes.mainContainer}>
                    <PortfolioSelect portfolios={portfolios} portfolioId={portfolioId} setPortfolioId={id => setPortfolioId(id)} isLoading={loading} />
                    <DepositAsset portfolioId={portfolioId} wallets={wallets} loadingPortfolio={loading} />
                    <WithdrawAsset
                        portfolioId={portfolioId}
                        assets={assets}
                        loadingData={loadingData}
                    />
                    <CreatePortfolio
                        addHandler={portfolio => onCreatePortfolio(portfolio)}
                        setShowSuccessAlert={b => setShowSuccessAlert(b)}
                    />
                </div>
                <PortfolioData
                    portfolioId={portfolioId}
                    loadingPortfolio={loading}
                    assets={assets}
                    loadingData={loadingData}
                />
            </div>
        </div>
    )
}

export default PortfolioContainer