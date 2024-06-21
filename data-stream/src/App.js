"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const client_sns_1 = require("@aws-sdk/client-sns");
const Clients_1 = require("./resources/Clients");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connection = new ws_1.default("wss://ws-feed.pro.coinbase.com");
const updateInterval = 1000 * 2;
const lastUpdateTimes = new Map();
connection.on("open", async () => {
    const supportedCurrencyPairs = await getSupportedCurrencyPairs();
    supportedCurrencyPairs.forEach(pair => lastUpdateTimes.set(pair, 0));
    const message = { "type": "subscribe", "channels": [{ "name": "ticker", "product_ids": supportedCurrencyPairs }] };
    connection.send(JSON.stringify(message));
});
connection.on("message", (data) => {
    [data]
        .filter(update => typeof update === "string")
        .map(update => update)
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
        .forEach((update) => {
        if (Math.floor(update.time / updateInterval) > Math.floor(lastUpdateTimes.get(update.asset) / updateInterval)) {
            Clients_1.snsClient.send(new client_sns_1.PublishCommand({
                TopicArn: process.env.DATA_STREAM_TOPIC,
                Message: JSON.stringify(update)
            }));
            console.log(update);
        }
        lastUpdateTimes.set(update.asset, update.time);
    });
});
async function getSupportedCurrencyPairs() {
    const supportedAssets = await axios_1.default.get("https://evq61d9tpl.execute-api.us-east-1.amazonaws.com/GetSupportedAssets").then(response => response.data);
    const supportedCurrencies = await axios_1.default.get("https://evq61d9tpl.execute-api.us-east-1.amazonaws.com/GetSupportedCurrencies").then(response => response.data);
    return supportedAssets.flatMap(asset => supportedCurrencies.map(currency => `${asset}-${currency}`));
}
