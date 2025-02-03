import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Menu, ListItem, MenuItem, ListItemIcon, Divider, ListItemText } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ForestRounded, DeviceThermostatRounded, SettingsRounded, AddRounded, GrassRounded, InfoRounded, GroupRounded, PersonAddRounded, MapRounded, DashboardRounded, TaskAlt, TaskAltRounded, WarningRounded } from '@mui/icons-material';

export default function StaffMenu(props) {
    const navigate = useNavigate()
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false)
    const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false)
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
    const [navbarAnchorEl, setNavbarAnchorEl] = useState(null)

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



    return (
        <>
            <Stack direction="row" spacing={1}>
                <Button sx={{ fontWeight: 700 }} startIcon={<ForestRounded />} variant="text" color="inherit" onClick={handleFarmClick}>Farms</Button>
                <Button sx={{ fontWeight: 700 }} startIcon={<DeviceThermostatRounded />} variant="text" color="inherit" onClick={handleDeviceClick}>Devices</Button>
                <Button sx={{ fontWeight: 700 }} startIcon={<SettingsRounded />} variant="text" color="inherit" onClick={handleSettingsClick}>Settings</Button>
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
                <MenuItem onClick={() => navigate("/staff/tasks")}>
                    <ListItemIcon>
                        <TaskAltRounded />
                    </ListItemIcon>
                    <ListItemText primary="My Tasks" />
                    <Typography variant="caption" color="text.secondary"></Typography>
                </MenuItem>
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
                <MenuItem onClick={() => navigate("/staff/farms/create")}>
                    <ListItemIcon>
                        <AddRounded />
                    </ListItemIcon>
                    <ListItemText primary="New Farm..." />
                </MenuItem>
                <MenuItem onClick={() => navigate("/farms/map")}>
                    <ListItemIcon>
                        <MapRounded />
                    </ListItemIcon>
                    <ListItemText primary="Farm Map" />
                    <Typography sx={{ marginLeft: "2rem" }} variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate("/plots")}>
                    <ListItemIcon>
                        <GrassRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage Individual Plots" />
                    <Typography sx={{ marginLeft: "2rem" }} variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/plots/create")}>
                    <ListItemIcon>
                        <AddRounded />
                    </ListItemIcon>
                    <ListItemText primary="New Plot..." />
                </MenuItem>
            </Menu>
            <Menu
                anchorEl={navbarAnchorEl}
                open={isDeviceMenuOpen}
                onClose={() => setIsDeviceMenuOpen(false)}
                onClick={() => setIsDeviceMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/devices/alerts")}>
                    <ListItemIcon>
                        <WarningRounded />
                    </ListItemIcon>
                    <ListItemText primary="Device Alerts" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate("/staff/devices")}>
                    <ListItemIcon>
                        <DeviceThermostatRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage All Devices" />
                    <Typography sx={{ marginLeft: "2rem" }} variant="caption" color="text.secondary"></Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/staff/devices/create")}>
                    <ListItemIcon>
                        <AddRounded />
                    </ListItemIcon>
                    <ListItemText primary="New Device..." />
                </MenuItem>
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