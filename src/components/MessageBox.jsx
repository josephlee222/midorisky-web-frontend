import React from 'react'
import { Box, Typography } from '@mui/material'

function MessageBox({ message, sender }) {
    return (
        <Box sx={{ display: "flex", justifyContent: sender ? "flex-end" : "flex-start" }}>
            <Box sx={{ backgroundColor: sender ? "primary.main" : "secondary.main", color: "white.main", padding: "0.5rem", borderRadius: "0.5rem", display: "flex", flexDirection: "column", alignItems: sender ? "flex-end" : "flex-start" }}>
                <Typography fontSize={12} fontWeight={700}>{message.user.name}</Typography>
                <Typography variant="body1" textAlign={sender ? "right": "left"}>
                    {message.message}
                </Typography>
                <Typography fontSize={10} fontWeight={700} marginTop={0.5}>
                    {new Date(message.createdAt).toLocaleString()}
                </Typography>
            </Box>
        </Box>
    )
}

export default MessageBox