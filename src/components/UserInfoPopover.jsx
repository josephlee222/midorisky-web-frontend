import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Menu, ListItem, MenuItem, ListItemIcon, Divider, ListItemText, Box, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, Link } from 'react-router-dom';
import { ForestRounded, DeviceThermostatRounded, SettingsRounded, AddRounded, GrassRounded, InfoRounded, GroupRounded, PersonAddRounded, MapRounded, DashboardRounded, TaskAlt, TaskAltRounded, WarningRounded, EmailRounded, PhoneRounded } from '@mui/icons-material';
import { get } from 'aws-amplify/api';
import ProfilePicture from './ProfilePicture';

export default function UserInfoPopover(props) {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        handleGetUser()
    }, [props.userId])

    const handleGetUser = async () => {
        setLoading(true)
        var userdata = get({
            apiName: "midori",
            path: "/users/" + props.userId,
        })

        var res = await userdata.response
        var userdata = await res.body.json()
        setUser(userdata)
        setLoading(false)
    }

    const menuSlotProps = {
        paper: {
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 0.5,
                '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                },
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 24,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
            },
        },
    }


    return (
        <>
            <Menu
                id={"userPopover"}
                open={props.open}
                anchorEl={props.anchor}
                onClose={props.onClose}
                onClick={props.onClose}
                slotProps={menuSlotProps}
            >
                {loading && (
                    <Box sx={{ display: "flex", alignItems: "center", mx: "6rem", my: "1rem" }} >
                        <CircularProgress />
                    </Box>
                )}
                {(user && !loading) && (
                    <>
                        <MenuItem>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ProfilePicture sx={{ marginLeft: 0 }} user={user} />
                                <Box marginLeft={"0.5rem"}>
                                    <Typography variant="subtitle1" fontWeight={700}>{user.name} ({user.username})</Typography>
                                    <Typography variant="body2">{user.email}</Typography>
                                </Box>
                            </Box>
                        </MenuItem>
                        <Divider />
                        <MenuItem component={Link} to={"mailto:" + user.email}>
                            <ListItemIcon><EmailRounded /></ListItemIcon>
                            <ListItemText primary={"E-mail..."} />
                        </MenuItem>
                        <MenuItem disabled={!user.phone_number} component={Link} to={"tel:" + user.phone_number}>
                            <ListItemIcon><PhoneRounded /></ListItemIcon>
                            <ListItemText primary={"Call..."} />
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>

    )
}