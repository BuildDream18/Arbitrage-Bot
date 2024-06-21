import WebSocket from "ws"
import { PublishCommand } from "@aws-sdk/client-sns"
import { PriceData } from "./data/PriceData"
import { snsClient } from "./resources/Clients"
import axios from "axios"

const connection = new WebSocket("wss://ws-feed.pro.coinbase.com")
const updateInterval = 1000 * 2
const lastUpdateTimes = new Map()

connection.on("open", async () => {
    const supportedCurrencyPairs = await getSupportedCurrencyPairs()
    supportedCurrencyPairs.forEach(pair => lastUpdateTimes.set(pair, 0))
    const message = {"type": "subscribe", "channels": [{"name": "ticker", "product_ids": supportedCurrencyPairs}]}
    connection.send(JSON.stringify(message))
})

connection.on("message", (data: any) => {
    [data]
        .filter(update => typeof update === "string")
        .map(update => update as string)
        .map(update => JSON.parse(update))
        .filter(update => update.type === "ticker")
        .map(update => ({
            source: "Coinbase",
            asset: update.product_id,
            price: update.price,
            open: update.open_24h,
            high: update.high_24h,
            low: update.low_24h,
            volume: update.volume_24h,
            time: Date.now()
        }))
        .forEach((update: PriceData) => {
            if (update.time > lastUpdateTimes.get(update.asset) + updateInterval) {
                lastUpdateTimes.set(update.asset, update.time)
                snsClient.send(new PublishCommand({
                    TopicArn: process.env.DATA_STREAM_TOPIC as string,
                    Message: JSON.stringify(update)
                }))
            }
        })
})

async function getSupportedCurrencyPairs(): Promise<string[]> {
    const supportedAssets: string[] = await axios.get("https://evq61d9tpl.execute-api.us-east-1.amazonaws.com/GetSupportedAssets").then(response => response.data)
    const supportedCurrencies: string[] = await axios.get("https://evq61d9tpl.execute-api.us-east-1.amazonaws.com/GetSupportedCurrencies").then(response => response.data)
    return supportedAssets.flatMap(asset => supportedCurrencies.map(currency => `${asset}-${currency}`))
}
