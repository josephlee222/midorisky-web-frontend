import React, { useEffect, useContext } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Menu, ListItem, MenuItem, ListItemIcon, Divider, ListItemText } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ForestRounded, DeviceThermostatRounded, SettingsRounded, AddRounded, GrassRounded, InfoRounded, GroupRounded, PersonAddRounded, MapRounded, DashboardRounded, TaskAlt, TaskAltRounded, WarningRounded, RouterRounded } from '@mui/icons-material';
import { AppContext } from '../App';

export default function StaffMenu(props) {
    const navigate = useNavigate()
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false)
    const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false)
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
    const [navbarAnchorEl, setNavbarAnchorEl] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isFarmManager, setIsFarmManager] = useState(false)
    const { userRoles } = useContext(AppContext)

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

    const handleFarmClick = (event) => {
        setNavbarAnchorEl(event.currentTarget)
        setIsFarmMenuOpen(true)
    }

    const handleDeviceClick = (event) => {
        setNavbarAnchorEl(event.currentTarget)
        setIsDeviceMenuOpen(true)
    }

    const handleSettingsClick = (event) => {
        setNavbarAnchorEl(event.currentTarget)
        setIsSettingsMenuOpen(true)
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            // if (event.shiftKey) {
            //     switch (event.key) {
            //         case "F":
            //             navigate("/staff/farms")
            //             break;
            //         case "P":
            //             navigate("/staff/plots")
            //             break;
            //         case "D":
            //             navigate("/devices")
            //             break;
            //         case "O":
            //             navigate("/staff")
            //             break;
            //         case "T":
            //             navigate("/tasks")
            //             break;
            //         case "M":
            //             navigate("/farms/map")
            //             break;
            //         default:
            //             break;
            //     }
            // }
        }

        const handleResize = () => {
            if (window.innerWidth < 600) {
                setIsFarmMenuOpen(false)
                setIsDeviceMenuOpen(false)
                setIsSettingsMenuOpen(false)
            }
        }

        // Add event listener for keydown
        window.addEventListener("keydown", handleKeyDown);

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);
    }, [])

    useEffect(() => {
        if (userRoles.includes("Admin")) {
            setIsAdmin(true)
            setIsFarmManager(true)
        } else if (userRoles.includes("FarmManager")) {
            setIsFarmManager(true)
        }
    }, [userRoles])



    return (
        <>
            <Stack direction="row" spacing={1}>
                <Button sx={{ fontWeight: 700 }} startIcon={<ForestRounded />} variant="text" color="inherit" onClick={handleFarmClick}>Farms</Button>
                <Button sx={{ fontWeight: 700 }} startIcon={<RouterRounded />} variant="text" color="inherit" onClick={handleDeviceClick}>Devices</Button>

                {isAdmin &&
                    <Button sx={{ fontWeight: 700 }} startIcon={<SettingsRounded />} variant="text" color="inherit" onClick={handleSettingsClick}>Settings</Button>
                }
            </Stack>
            <Menu
                anchorEl={navbarAnchorEl}
                open={isFarmMenuOpen}
                onClose={() => setIsFarmMenuOpen(false)}
                onClick={() => setIsFarmMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/staff")}>
                    <ListItemIcon>
                        <DashboardRounded />
                    </ListItemIcon>
                    <ListItemText primary="Operations Overview" />
                    <Typography variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/staff/tasks/my")}>
                    <ListItemIcon>
                        <TaskAltRounded />
                    </ListItemIcon>
                    <ListItemText primary="My Tasks" />
                    <Typography variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                {isFarmManager &&
                    <MenuItem onClick={() => navigate("/staff/tasks/all")}>
                        <ListItemIcon>
                            <TaskAltRounded />
                        </ListItemIcon>
                        <ListItemText primary="Manage All Tasks" />
                        <Typography variant="caption" color="text.secondary"></Typography>
                    </MenuItem>
                }
                <Divider />
                <MenuItem onClick={() => navigate("/staff/farms/dashboard")}>
                    <ListItemIcon>
                        <DashboardRounded />
                    </ListItemIcon>
                    <ListItemText primary="Farms Dashboard" />
                    <Typography variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/staff/farms")}>
                    <ListItemIcon>
                        <ForestRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage Farms" />
                    <Typography variant="caption" color="text.secondary"></Typography>
                </MenuItem>
            </Menu>
            <Menu
                anchorEl={navbarAnchorEl}
                open={isDeviceMenuOpen}
                onClose={() => setIsDeviceMenuOpen(false)}
                onClick={() => setIsDeviceMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/staff/devices")}>
                    <ListItemIcon>
                        <RouterRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage All Devices" />
                    <Typography sx={{ marginLeft: "2rem" }} variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                {isFarmManager &&
                    <MenuItem onClick={() => navigate("/staff/devices?create=true")}>
                        <ListItemIcon>
                            <AddRounded />
                        </ListItemIcon>
                        <ListItemText primary="New Device..." />
                    </MenuItem>
                }
            </Menu>
            <Menu
                anchorEl={navbarAnchorEl}
                open={isSettingsMenuOpen}
                onClose={() => setIsSettingsMenuOpen(false)}
                onClick={() => setIsSettingsMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/staff/users")}>
                    <ListItemIcon>
                        <GroupRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage Users" />
                </MenuItem>
                <MenuItem onClick={() => navigate("/staff/users/create")}>
                    <ListItemIcon>
                        <PersonAddRounded />
                    </ListItemIcon>
                    <ListItemText primary="New User..." />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate("/settings")}>
                    <ListItemIcon>
                        <SettingsRounded />
                    </ListItemIcon>
                    <ListItemText primary="MidoriSKY Configuration" />
                </MenuItem>
                <MenuItem onClick={() => navigate("/about")}>
                    <ListItemIcon>
                        <InfoRounded />
                    </ListItemIcon>
                    <ListItemText primary="About MidoriSKY" />
                </MenuItem>
            </Menu>
        </>

    )
}