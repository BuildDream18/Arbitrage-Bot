import { Navbar } from "./Navbar"
import styled from "styled-components"
import React, { ReactNode } from "react"
import Background from "../assets/images/background.svg";

const WrapContainer = styled.div`
  background-image: url(${Background});
  background-repeat: no-repeat; 
  background-size: cover; 
  height: 100vh;
  overflow: auto;
` 

const MainContentContainer = styled.div`
  margin-top: 5em;
  padding: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Page = ({children}: { children: ReactNode}) => {
  return (
    <div style={{background: 'black'}}>
      <WrapContainer>
        <Navbar />
        <MainContentContainer>
          {children}
        </MainContentContainer>
      </WrapContainer>
    </div>
  )
}

export default Page
