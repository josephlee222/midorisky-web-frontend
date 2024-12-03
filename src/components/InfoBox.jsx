import React from 'react'
import { Box, Typography, Chip, Skeleton } from '@mui/material'
import { Check, Close, HourglassBottom } from '@mui/icons-material';

function InfoBox(props) {
    return (
        <Box flexGrow={props.flexGrow}>
            <Typography variant="body" fontWeight={700}>{props.title}</Typography>
            <Typography marginTop={"0.25rem"}>
                {props.loading && <Skeleton width={"100px"} />}
                {(props.boolean == null && !props.pending && !props.loading) && props.value}
                {(props.boolean != null && !props.pending && !props.loading) && <Chip size='small' icon={props.boolean ? <Check/> : <Close/>} label={props.value} color={props.boolean ? "success" : "error"} />}
                {(props.pending && !props.loading) && <Chip size='small' icon={<HourglassBottom/>} label={props.value} color="warning" />}
            </Typography>
        </Box>
    )
}

export default InfoBox