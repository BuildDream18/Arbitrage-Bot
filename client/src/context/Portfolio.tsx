import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { useAuth } from "./Auth"
import { SubscribeToDepositUpdatesRequest } from "../../../server/src/requests/SubscribeToDepositUpdatesRequest"
import { Asset } from "../../../server/src/data/Asset"
import { Portfolio, PortfolioWithWallet } from "../../../server/src/data/Portfolio"
import { Wallet } from "../../../server/src/data/Wallet"
import { getPortfolioAssets, getPortfoliosRequest, getWalletsRequest } from "../requests/PortfolioRequests"

interface PortfolioContextType {
    loading: boolean
    loadingData: boolean
    portfolios: Portfolio[]
    wallets: Wallet[]
    portfolioId: string
    assets: Asset[]
    setPortfolioId: Dispatch<SetStateAction<string>>
    requestAssets: () => Promise<void>
    onCreatePortfolio: (p: PortfolioWithWallet) => void
    // login: (e: string, p: string) => Promise<UserToken | undefined>
}

const PortfolioContext = createContext<PortfolioContextType>({} as PortfolioContextType)

export const usePortfolio = () => useContext(PortfolioContext)

export const PortfolioProvider = ({children}: { children: ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingData, setLoadingData] = useState<boolean>(true)
    const { userId, authToken } = useAuth()
    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [wallets, setWallets] = useState<Wallet[]>([])
    const [portfolioId, setPortfolioId] = useState<string>("")
    const [assets, setAssets] = useState<Asset[]>([])

    useEffect(() => {
        const getPortfolios = async () => {
            const data = await getPortfoliosRequest(userId as string)
            setPortfolios(data)
            if (data.length > 0) {
                setPortfolioId(data[0].id)
            }

            const walletData = await getWalletsRequest(userId as string)
            setWallets(walletData)

            setLoading(false)
        }

        getPortfolios()
    }, [])

    useEffect(() => {
        requestAssets()
    }, [portfolioId])

    const onPortfolioSelect = (portfolioId: string) => {
        setPortfolioId(portfolioId)
    }

    const requestAssets = async () => {
        setLoadingData(true)
        if (!loading) {
            if (portfolioId != "") {
              const data = await getPortfolioAssets(portfolioId)
              setAssets(data)
            }
            setLoadingData(false)
        }
    }

    const onCreatePortfolio = (portfolio: PortfolioWithWallet) => {
        setPortfolios([...portfolios, {id: portfolio.id, user: portfolio.user, name: portfolio.name}])
        setWallets([...wallets, portfolio.wallet])
        setPortfolioId(portfolio.id)
    }

    return (
        loading ?
            <div>Loading</div> :
            <PortfolioContext.Provider value={{loading, loadingData, portfolios, wallets, portfolioId, assets, setPortfolioId, requestAssets, onCreatePortfolio}}>
                {children}
            </PortfolioContext.Provider>
    )
}
