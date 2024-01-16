import React from 'react'
import ReactLoading from "react-loading";
import { styled } from '@mui/material/styles';

const RootDiv = styled('div')(({ theme }) => ({
    width: "100%",
    height: "100",
    display: "flex",
    marginTop: '20%',
    justifyContent: "center",
    alignItems: "center"
}));

const Loading = ({ style }) => {
    return (
        <RootDiv style={style}>
            <ReactLoading type="bars" color="#F83737" height="8%" width="8%" />
        </RootDiv>
    )
}

export default Loading