import { AppBar, Toolbar, Typography, Box, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Chip, Skeleton, ListItemButton, Stack, useTheme } from "@mui/material"
import { Link } from "react-router-dom"
import { useState, useContext } from "react"
import LoginIcon from '@mui/icons-material/LoginRounded';
import { AppContext } from "../App";
import NavbarProfile from "./NavbarProfile";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import NavbarNotifications from "./NavbarNotifications";
import { BackpackRounded, CardMembershipRounded, CelebrationRounded, DashboardRounded, DeviceThermostatRounded, ForestRounded, GroupRounded, InfoRounded, LogoutRounded, LoyaltyRounded, MapRounded, MenuRounded, PersonRounded, QuestionAnswerRounded, Settings, SettingsRounded, StorefrontRounded, TaskAltRounded, ThermostatRounded } from "@mui/icons-material";
import { HomeRounded } from "@mui/icons-material";
import NavbarFriends from "./NavbarFriends";
import NavbarCart from "./NavbarCart";
import StaffMenu from "./StaffMenu";


export default function Navbar() {
    const { user, adminPage, userLoading, title } = useContext(AppContext);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false)
    const theme = useTheme()

    return (
        <>
            <AppBar position="sticky">
                <Toolbar>
                    <Box sx={{ flexGrow: 1, alignItems: "center", display: "flex" }}>
                        <Box sx={{ flexGrow: 1, display: ["none", "none", "flex"], alignItems: "center" }}>
                            <Link to="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 700, display: "flex", alignItems: "center" }}>MidoriSKY</Link>
                            <Divider orientation="vertical" flexItem sx={{ mx: "1rem" }} />
                            {/* {!adminPage &&
                                <Stack direction="row" spacing={1}>
                                    <Button sx={{ fontWeight: 700 }} startIcon={<CelebrationRounded />} LinkComponent={Link} variant="text" color="inherit" to="/activityList">All Experiences</Button>
                                    <Button sx={{ fontWeight: 700 }} startIcon={<LoyaltyRounded />} LinkComponent={Link} variant="text" color="inherit" to="/fou">Friends Of UPLay</Button>
                                    <Button sx={{ fontWeight: 700 }} startIcon={<QuestionAnswerRounded />} LinkComponent={Link} variant="text" color="inherit" to="/faq">FAQ</Button>
                                </Stack>
                            } */}

                            {adminPage && <StaffMenu />}
                        </Box>
                        <Box sx={{ flexGrow: 1, display: ["flex", "flex", "none"], alignItems: "center" }}>
                            {!adminPage && <IconButton color="inherit" sx={{ marginRight: "1rem" }} onClick={() => setIsDrawerOpen(true)}><MenuRounded /></IconButton>}
                            {adminPage && <IconButton color="inherit" sx={{ marginRight: "1rem" }} onClick={() => setIsAdminDrawerOpen(true)}><MenuRounded /></IconButton>}
                            <Typography variant="h6" component="div">
                                {title}
                            </Typography>
                        </Box>
                        {(!user && userLoading) && <Skeleton variant="circular" width={32} height={32} sx={{ m: "8px" }} animation="wave" />}
                        {(!user && userLoading) && <Skeleton variant="circular" width={32} height={32} sx={{ m: "8px", display: { xs: "none", md: "initial" } }} animation="wave" />}
                        {(!user && userLoading) && <Skeleton variant="circular" width={32} height={32} sx={{ m: "8px", display: { xs: "none", md: "initial" } }} animation="wave" />}
                        {(!user && userLoading) && <Skeleton variant="circular" width={40} height={40} sx={{ m: "8px" }} animation="wave" />}
                        {(!user && !userLoading) && <Button LinkComponent={Link} variant="text" color="inherit" to="/login" startIcon={<LoginIcon />}>Login</Button>}
                        {/* {user && <NavbarCart />}
                        {user && <NavbarFriends />} */}
                        {user && <NavbarNotifications />}
                        {user && <NavbarProfile />}
                    </Box>

                </Toolbar>
            </AppBar>
            <Drawer
                anchor={"left"}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            >
                <List sx={{ width: "250px" }}>
                    <Box marginX={"1rem"} marginY={".5rem"}>
                        <Typography variant="h6" fontWeight={700}>MidoriSKY</Typography>
                        <Typography variant="body">Navigation Menu</Typography>
                    </Box>
                    <Divider sx={{ marginBottom: 1 }} />
                    <ListItem key={"Home"} disablePadding>
                        <ListItemButton component={Link} to="/" onClick={() => setIsDrawerOpen(false)}>
                            <ListItemIcon><HomeRounded /></ListItemIcon>
                            <ListItemText primary={"Home"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"About Us"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/about-farm" onClick={() => setIsDrawerOpen(false)}>
                            <ListItemIcon><InfoRounded /></ListItemIcon>
                            <ListItemText primary={"About Farm"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Drawer
                anchor={"left"}
                open={isAdminDrawerOpen}
                onClose={() => setIsAdminDrawerOpen(false)}
            >
                <List sx={{ width: "250px" }}>
                    <Box marginX={"1rem"} marginY={".5rem"}>
                        <Typography variant="h6" fontWeight={700}>MidoriSKY</Typography>
                        <Typography variant="body">Staff Panel</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <ListItem key={"Overview"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/staff" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><DashboardRounded /></ListItemIcon>
                            <ListItemText primary={"Overview"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Farms"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/staff/tasks" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><TaskAltRounded /></ListItemIcon>
                            <ListItemText primary={"My Tasks"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Farm Map"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/farm/map" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><MapRounded /></ListItemIcon>
                            <ListItemText primary={"Farm Map"} />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem key={"Farms"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/staff/farms" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><ForestRounded /></ListItemIcon>
                            <ListItemText primary={"Farms"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Devices"} disablePadding>
                        <ListItemButton onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><ThermostatRounded /></ListItemIcon>
                            <ListItemText primary={"Devices"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Users"} disablePadding>
                        <ListItemButton LinkComponent={Link} to="/staff/users" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><PersonRounded /></ListItemIcon>
                            <ListItemText primary={"Users"} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key={"Settings"} disablePadding>
                        <ListItemButton onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><SettingsRounded /></ListItemIcon>
                            <ListItemText primary={"Settings"} />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItem key={"Home"} disablePadding sx={{ color: theme.palette.error.main }}>
                        <ListItemButton LinkComponent={Link} to="/" onClick={() => setIsAdminDrawerOpen(false)}>
                            <ListItemIcon><LogoutRounded sx={{ color: theme.palette.error.main }} /></ListItemIcon>
                            <ListItemText primary={"Exit Admin"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
        </>
    )
}