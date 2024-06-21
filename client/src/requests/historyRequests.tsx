import { getApi, postApi } from "./DefaultRequest"

export const getHistoricData = async (token: string): Promise<string[]> => {
    return getApi<string[]>(`https://api.pro.coinbase.com/products/${token}-USD/candles?start=2022-07-18T5:00:00&end=2022-07-28T5:00:00&granularity=86400`)
}
