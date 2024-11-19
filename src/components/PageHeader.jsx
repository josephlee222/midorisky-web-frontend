import React, {useContext} from 'react'
import { Typography, Box } from '@mui/material'
import { useTheme } from '@emotion/react';
import { AppContext } from '../App';

export default function PageHeader(props) {
    const theme = useTheme();
    const {setIcon, setTitle} = useContext(AppContext)
    setTitle(props.navTitle ? props.navTitle : props.title)

    return (
        <Box display={["none", "none", "flex"]} sx={{ py: "3rem", justifyContent: "center", alignItems: "center", flexDirection: "column", backgroundColor: theme.palette.background.paper, backgroundImage: "url('" + props.background + "')", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
            <props.icon sx={{ height: "72px", width: "72px", color: "primary" }} color="primary" />
            <Typography fontWeight={700} variant="h4" component="h1" align="center" mt={"0.5rem"}>
                {props.title}
            </Typography>
        </Box>
    )
}