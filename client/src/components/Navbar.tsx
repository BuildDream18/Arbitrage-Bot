import {AppBar, Button, createTheme, makeStyles, MuiThemeProvider, Tab, Tabs, Toolbar} from "@material-ui/core"
import { useHistory } from "react-router-dom"
import { useAuth } from "../context/Auth"
import React, {useEffect, useState} from "react"

const useStyles = makeStyles(theme => ({
  navigation: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  selectedTab: {
    textDecoration: "underline"
  },
  tabItem: {
    textTransform: "none",
    color: "red",
    fontWeight: "bold",
    fontSize: "20px"
  },
  logoutButton: {
    margin: "8px",
    textTransform: "none",
  },

}))

const theme = createTheme({
  palette: {
    secondary: {
      light: '#fff',
      main: '#fff',
      dark: '#fff',
      contrastText: '#fff',
    },
  },
});

const tabs = [
  {value: "overview", label: "Portfolio"},
  {value: "trade", label: "Trade"},
  // {value: "prices", label: "Prices"},
]

export function Navbar() {
  const history = useHistory()
  const classes = useStyles()
  const {logout} = useAuth()
  const [tabIndex, setTabIndex] = useState(Number(localStorage.getItem("selectedTab")) ?? 0)
  
  useEffect(() => {
    history.push(tabs[tabIndex].value)
  }, [])

  const handleChange = (event, newValue) => {
    localStorage.setItem("selectedTab", newValue)
    setTabIndex(newValue)
    history.push("/" + tabs[newValue].value)
  }; 

  return (
    <>
      <MuiThemeProvider theme={theme}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar className={classes.navigation}>
          <Tabs
            value={tabIndex}
            onChange={handleChange}
          >
            {
              tabs.map(tab => (
                <Tab key={tab.value} className={classes.tabItem} label={tab.label} />
              ))
            }
          </Tabs>
          <Button
            className={classes.logoutButton}
            onClick={() => logout()}
            variant="outlined"
            color="inherit">
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      </MuiThemeProvider>
    </>
  )
}
