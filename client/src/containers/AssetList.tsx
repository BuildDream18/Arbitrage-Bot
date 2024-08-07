import React, {useEffect, useState} from "react"
import {makeStyles} from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Paper from "@material-ui/core/Paper"
import Asset from "../components/data/Asset"

const useStyles = makeStyles({
    root: {
        "& > *": {
            borderBottom: "unset",
        },
    },
    icon: {
        minWidth: 50,
        width: 10
    },
})

const connection = new WebSocket("wss://24pxxf78wk.execute-api.us-east-1.amazonaws.com/production")

export default function AssetList() {
    let bitcoinURL = "/BTC.png"
    let ethereumURL = "/ETH.png"
    let dogeCoinURL = "/DOGE.png"

    const [bitcoinJSON, setBitcoinJSON] = useState({})
    const [ethereumJSON, setEthereumJSON] = useState({})
    const [dogeCoinJSON, setDogeCoinJSON] = useState({})

    useEffect(() => {
        connection.onmessage = message => {
            let json = JSON.parse(message.data)
            if (json["asset"] == "BTC-USD") {
                setBitcoinJSON(json)
            } else if (json["asset"] == "ETH-USD") {
                setEthereumJSON(json)
            } else if (json["asset"] == "DOGE-USD") {
                setDogeCoinJSON(json)
            }
        }
    })

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell>Coin</TableCell>
                        <TableCell align="right">Name</TableCell>
                        <TableCell align="right">Price (USD$)</TableCell>
                        <TableCell align="right">Daily Change (%)</TableCell>
                        <TableCell align="right">Daily Net Change (USD$)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <Asset json={bitcoinJSON}
                           name={"BTC"}
                           url={bitcoinURL}
                           price={0}
                           amountOwned={0}
                           portfolio={false}/>
                    <Asset json={ethereumJSON}
                           name={"ETH"}
                           url={ethereumURL}
                           price={0}
                           amountOwned={0}
                           portfolio={false}/>
                    <Asset json={dogeCoinJSON}
                           name={"DOGE"}
                           url={dogeCoinURL}
                           price={0}
                           amountOwned={0}
                           portfolio={false}/>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
