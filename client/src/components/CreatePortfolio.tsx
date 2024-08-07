import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { styled } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { createPortfolioRequest } from '../requests/PortfolioRequests';
import { useAuth } from '../context/Auth';

const StyledCard = styled(Card)({
    padding: "1em",
    display: "flex",
    flexDirection: "column",
    // marginTop: "20px",
    background: "transparent",
    border: "none",
    boxShadow: "none"
})

const StyledTypography = styled(Typography)({
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textDecorationColor: "#3f51b5",
    textUnderlineOffset: "0.2em"
})

const StyledTextField = styled(TextField)({
    marginTop: "1em",
    width: "225px"
})

const StyledButton = styled(Button)({
    alignSelf: "center",
    marginTop: "0.75em",
    backgroundColor: "#3f51b5",
    color: "white",

    "&:hover": {
        color: "#3f51b5"
    }
})

const CreatePortfolio = ({ addHandler, setShowSuccessAlert }) => {
    const [name, setName] = useState("")
    const { userId } = useAuth()

    const toggleSuccessAlert = () => {
        setShowSuccessAlert(true)
        setTimeout(() => {
            setShowSuccessAlert(false)
        }, 3000)
    }

    const submitHandler = async () => {
        try {
            const newPortfolio = await createPortfolioRequest(userId as string, name)
            addHandler(newPortfolio)
            toggleSuccessAlert()
            setName("")
        } catch (e) {
            
        }
    }

    return (
        <StyledCard>
            <StyledTypography align="left" variant="h6" >Create Portfolio</StyledTypography>
            <StyledTextField
                id="standard-basic"
                label="Portfolio name"
                name="Portfolioname"
                variant="filled"
                size="small"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <StyledButton variant="outlined" size="small" onClick={() => submitHandler()} >Submit</StyledButton>
        </StyledCard>
    )
}

export default CreatePortfolio
