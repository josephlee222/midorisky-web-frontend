import React, { useEffect, useState } from 'react'
import { Menu, MenuItem, ListItemIcon, Divider, ListItemText, useTheme } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { InfoRounded, CloseRounded, DeleteRounded, SwapHorizRounded } from '@mui/icons-material';

export default function TaskPopover(props) {
    const navigate = useNavigate()
    const theme = useTheme()

    return (
        <>
            <Menu
                id="basic-menu"
                anchorEl={props.anchorEl}
                open={props.open}
                onClose={props.onClose}
            >
                <MenuItem onClick={props.onClose}>
                    <ListItemIcon>
                        <SwapHorizRounded />
                    </ListItemIcon>
                    <ListItemText primary="Move..." />
                </MenuItem>
                {props.onTaskDetailsClick && (
                    <MenuItem onClick={props.onTaskDetailsClick}>
                        <ListItemIcon>
                            <InfoRounded />
                        </ListItemIcon>
                        <ListItemText primary="Task Details" />
                    </MenuItem>
                )}
                <Divider sx={{ my: "1rem" }} />
                <MenuItem onClick={props.onClose} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                        <CloseRounded sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Hide from Board" />
                </MenuItem>
                <MenuItem onClick={props.onClose} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                        <DeleteRounded sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Delete Task" />
                </MenuItem>
            </Menu>
        </>

    )
}