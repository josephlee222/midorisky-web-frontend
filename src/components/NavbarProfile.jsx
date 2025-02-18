import { useState, useContext, useEffect } from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Popover, Divider, Typography, Button, colors, Menu, MenuItem, Chip } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import ProfilePicture from "./ProfilePicture";
import { AppContext } from "../App";

import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { enqueueSnackbar } from "notistack";
import { Diversity3Rounded, ShoppingBagRounded, ShoppingCartRounded } from "@mui/icons-material";
import { signOut } from "aws-amplify/auth";

export default function NavbarProfile() {
    const { user, setUser, userRoles, connection } = useContext(AppContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const staffRoles = ["Farmer", "Admin", "FarmManager"];
    const [role, setRole] = useState(null)
    const isStaff = userRoles.some(item => staffRoles.includes(item));
    const navigate = useNavigate()
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
                    right: 24,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
            },
        },
    }

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        console.log(user)
        setIsPopoverOpen(true);
    }

    function handleLogout() {
        setIsPopoverOpen(false)
        signOut()
        setUser(null)
        connection.send(JSON.stringify({ type: "logout" }))
        enqueueSnackbar("Successfully logged out", { variant: "success" })
        navigate("/")
    }

    useEffect(() => {
        if (userRoles.includes("Admin")) {
            setRole("Admin")   
        } else if (userRoles.includes("FarmManager")) {
            setRole("Farm Manager")
        } else if (userRoles.includes("Farmer")) {
            setRole("Farmer")
        } else {
            setRole("Customer")
        }
    }, [userRoles])

    // Profile picture should be implemented later
    return (
        <>
            <IconButton onClick={(e) => handlePopoverOpen(e)}>
                <ProfilePicture user={user} />
            </IconButton>
            <Menu
                id={"userPopover"}
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={() => setIsPopoverOpen(false)}
                onClick={() => setIsPopoverOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    horizontal: 'right',
                }}
                slotProps={menuSlotProps}
            >
                <MenuItem component={Link} to="/profile">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ProfilePicture sx={{marginLeft: 0}} user={user} />
                        <Box marginLeft={"0.5rem"}>
                            <Typography variant="subtitle1" fontWeight={700}>{user.name}</Typography> 
                            <Typography variant="body2" mb={"0.5rem"}>{user.email}</Typography>
                            <Chip label={role} color="primary" size="small" />
                        </Box>
                    </Box>
                </MenuItem>
                <Divider />
                {isStaff &&
                    <MenuItem component={Link} to="/staff">
                        <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                        <ListItemText primary={"Staff Panel"} />
                    </MenuItem>}
                <MenuItem onClick={() => handleLogout()} sx={{ color: colors.red[500] }}>
                    <ListItemIcon><LogoutIcon sx={{ color: colors.red[500] }} /></ListItemIcon>
                    <ListItemText primary={"Logout"} />
                </MenuItem>
                {/* <List>
                    <ListItem key={"My Profile"} disablePadding>
                        <ListItemButton component={Link} to="/profile" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary={"My Profile"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Cart"} disablePadding sx={{ display: { xs: "initial", md: "none" } }}>
                        <ListItemButton component={Link} to="/cart" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><ShoppingCartRounded /></ListItemIcon>
                            <ListItemText primary={"Cart"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Friends & Groups"} disablePadding sx={{ display: { xs: "initial", md: "none" } }}>
                        <ListItemButton component={Link} to="/groupList" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><Diversity3Rounded /></ListItemIcon>
                            <ListItemText primary={"Friends & Groups"} />
                        </ListItemButton>
                    </ListItem>
                    {isStaff &&
                        <ListItem key={"Staff Panel"} disablePadding>
                            <ListItemButton component={Link} to="/staff" onClick={() => setIsPopoverOpen(false)}>
                                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                                <ListItemText primary={"Staff Panel"} />
                            </ListItemButton>
                        </ListItem>}
                    <ListItem key={"Logout"} disablePadding>
                        <ListItemButton onClick={() => handleLogout()} sx={{ color: colors.red[500] }}>
                            <ListItemIcon><LogoutIcon sx={{ color: colors.red[500] }} /></ListItemIcon>
                            <ListItemText primary={"Logout"} />
                        </ListItemButton>
                    </ListItem>
                </List> */}
            </Menu>
        </>
    )
}