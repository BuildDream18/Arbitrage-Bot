import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from "react-router-dom"
import { ReactNode } from "react"
import Page from "./components/Page"
import { Overview, Prices, Profile } from "./pages"
import { Landing } from "./pages/Landing"
import { SignIn } from "./pages/SignIn"
import { SignUp } from "./pages/SignUp"
import { TradePage } from "./pages/TradePage"
import CoinPage from "./pages/CoinPage"
import { AuthProvider, useAuth } from "./context/Auth"
import { PortfolioProvider } from "./context/Portfolio"
import { SocketProvider, useSocket } from "./context/Socket"
import React from "react"

const PrivateRoute = ({path, children}: { path: string, children: any }) => {
  const {isAuthed} = useAuth()
  return (
    isAuthed ?
      <Route path={path}>
        {children}
      </Route> :
      <Redirect to="/sign-in"/>
  )
}

const NoAuthRoute = ({path, children}: { path: string, children }) => {
  const {isAuthed} = useAuth()
  return (
    !isAuthed ?
      <Route path={path}>
        {children}
      </Route> :
      <Redirect to="/overview" />
  )
}

function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <SocketProvider>
          <Router>
            <Switch>
              <NoAuthRoute path="/sign-in">
                <SignIn/>
              </NoAuthRoute>
              <NoAuthRoute path="/sign-up">
                <SignUp/>
              </NoAuthRoute>
                <PrivateRoute path="/overview">
                  <Page>
                    <Overview/>
                  </Page>
                </PrivateRoute>
                <PrivateRoute path="/trade">
                  <Page>
                    <TradePage/>
                  </Page>
                </PrivateRoute>
              {/* <PrivateRoute path="/prices">
                <Page>
                  <Prices/>
                </Page>
              </PrivateRoute> */}
              {/* <PrivateRoute path="/profile">
                <Page>
                  <Profile/>
                </Page>
              </PrivateRoute>
              <PrivateRoute path="/coin/:name">
                <Page>
                  <CoinPage name = {"/coin/:name".split('/')[1]}/>
                </Page>
              </PrivateRoute> */}
              <NoAuthRoute path="/">
                <Landing/>
              </NoAuthRoute>
            </Switch>
          </Router>
        </SocketProvider>
      </PortfolioProvider>
    </AuthProvider>
  )
}

export default App
