import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useAuth } from "./Auth"
import { SubscribeToDepositUpdatesRequest } from "../../../server/src/requests/SubscribeToDepositUpdatesRequest"
import { Asset } from "../../../server/src/data/Asset"
import { usePortfolio } from "./Portfolio"

interface SocketContextType {
    loading: boolean
    priceData: any
    // login: (e: string, p: string) => Promise<UserToken | undefined>
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({children}: { children: ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(true)
    const { userId, authToken } = useAuth()
    const { requestAssets } = usePortfolio()
    const [priceData, setPriceData] = useState<any>({ "USD": 1 })

    let currData = {...priceData}
    useEffect(() => {
        const ws = new WebSocket("wss://24pxxf78wk.execute-api.us-east-1.amazonaws.com/production")
        ws.onmessage = message => {
          const json = JSON.parse(message.data)
    
          const assetName = json["asset"].split("-")[0]
          const price = json["price"]
          
          currData[assetName] = price
          console.log(currData);
          console.log(priceData);
    
          setPriceData(currData)
        }
    
        return () => ws.close()
      }, [])
    
    useEffect(() => {
        const ws = new WebSocket("wss://jzp71xvre4.execute-api.us-east-1.amazonaws.com/production")
        if(ws) {
            ws.onopen = () => {
                const subscribeToDepositUpdatesRequest: SubscribeToDepositUpdatesRequest = {
                    authorization: authToken as string,
                    user: userId as string,
                    type: "SubscribeToDepositUpdatesRequest"
                }
                ws.send(JSON.stringify(subscribeToDepositUpdatesRequest))
            }

            try {
                ws.onmessage = async message => {
                    let json = JSON.parse(message.data)
                    await requestAssets()
                }
            } catch (error) {
            } finally {
                setLoading(false)
            }

            return () => {
                ws.close();
            };
        }
        setLoading(false)
    }, [])

    return (
        loading ?
            <div>Loading</div> :
            <SocketContext.Provider value={{loading, priceData}}>
                {children}
            </SocketContext.Provider>
    )
}
