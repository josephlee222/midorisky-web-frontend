import { useState, useContext } from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Popover, Divider, Typography, Button, colors } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import ProfilePicture from "./ProfilePicture";
import { AppContext } from "../App";

import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/PersonRounded';
import SupportIcon from '@mui/icons-material/Support';
import { enqueueSnackbar } from "notistack";
import { Diversity3Rounded, ShoppingBagRounded, ShoppingCartRounded } from "@mui/icons-material";
import { signOut } from "aws-amplify/auth";

export default function NavbarProfile() {
    const { user, setUser } = useContext(AppContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const navigate = useNavigate()

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        console.log(user)
        setIsPopoverOpen(true);
    }

    function handleLogout() {
        setIsPopoverOpen(false)
        signOut()
        setUser(null)
        enqueueSnackbar("Successfully logged out", { variant: "success" })
        navigate("/")
    }

    // Profile picture should be implemented later
    return (
        <>
            <IconButton onClick={(e) => handlePopoverOpen(e)}>
                <ProfilePicture user={user} />
            </IconButton>
            <Popover
                id={"userPopover"}
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={() => setIsPopoverOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    horizontal: 'right',
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", margin: "1rem" }}>
                    <ProfilePicture user={user} />
                    <Box marginLeft={"1rem"}>
                        <Typography variant="subtitle1" fontWeight={700}>{user.name}</Typography>
                        <Typography variant="body2">{user.email}</Typography>
                    </Box>
                </Box>
                <Divider sx={{ marginTop: "1rem" }} />
                <List>
                    <ListItem key={"My Profile"} disablePadding>
                        <ListItemButton component={Link} to="/profile" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><PersonIcon /></ListItemIcon>
                            <ListItemText primary={"My Profile"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Cart"} disablePadding sx={{display: {xs: "initial", md: "none"}}}>
                        <ListItemButton component={Link} to="/cart" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><ShoppingCartRounded /></ListItemIcon>
                            <ListItemText primary={"Cart"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Friends & Groups"} disablePadding sx={{display: {xs: "initial", md: "none"}}}>
                        <ListItemButton component={Link} to="/groupList" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><Diversity3Rounded /></ListItemIcon>
                            <ListItemText primary={"Friends & Groups"} />
                        </ListItemButton>
                    </ListItem>
                    { user.isAdmin && 
                    <ListItem key={"Admin Panel"} disablePadding>
                        <ListItemButton component={Link} to="/admin" onClick={() => setIsPopoverOpen(false)}>
                            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                            <ListItemText primary={"Admin Panel"} />
                        </ListItemButton>
                    </ListItem> }
                    <ListItem key={"Logout"} disablePadding>
                        <ListItemButton onClick={() => handleLogout()}  sx={{color: colors.red[500]}}>
                            <ListItemIcon><LogoutIcon sx={{color: colors.red[500]}} /></ListItemIcon>
                            <ListItemText primary={"Logout"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Popover>
        </>
    )
}