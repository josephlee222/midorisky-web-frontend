import { useContext, useEffect } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../errors/NotFound'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { validateAdmin } from '../../functions/user'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, createTheme, ThemeProvider } from '@mui/material'
import PersonIcon from '@mui/icons-material/PersonRounded';
import GroupIcon from '@mui/icons-material/GroupRounded';
import BackpackIcon from '@mui/icons-material/BackpackRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import AdminUsersRoutes from './users/AdminUsersRoutes'
import AdminActivitiesRoutes from './activities/AdminActivitiesRoutes'
import AdminShopRoutes from './shop/AdminShopRoutes'
import AdminGroupsRoutes from './groups/AdminGroupsRoutes'
import AdminHome from './AdminHome'

export default function AdminRoutes() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const styles = createTheme({
        components: {
            MuiListItem: {
                defaultProps: {
                    style: {
                        fontWeight: 700,
                        color: "#E8533F",
                        backgroundColor: "#E8533F32",
                        '&:hover': {
                            backgroundColor: "#E8533F80",
                        },
                        borderRadius: 20,
                        overflow: "hidden"
                    }
                }
            },
            MuiListItemText: {
                defaultProps: {
                    style: {
                        fontWeight: 700,
                        textAlign: "center",
                    }
                },
            },
        }
    })

    useEffect(() => {
        setAdminPage(true)
        validateAdmin().then((isAdmin) => {
            if (!isAdmin) {
                enqueueSnackbar("You must be an admin to view this page", { variant: "error" });
                navigate("/")
            }
        })
    }, [])

    return (
        <Container maxWidth="xl">
            <Grid container spacing={2} maxWidth={"xl"}>
                <Grid item xs="0" md="3" display={{ xs: "none", md: "initial" }}>
                    <Card sx={{ mt: "1rem" }}>
                        <CardContent>
                            <ThemeProvider theme={styles}>
                                <ListItem key={"Users"} disablePadding sx={{ mb: "1rem" }}>
                                    <ListItemButton LinkComponent={Link} to="/admin/users">
                                        <PersonIcon />
                                        <ListItemText disableTypography primary={"Users"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Groups"} disablePadding sx={{ mb: "1rem" }}>
                                    <ListItemButton LinkComponent={Link} to="/admin/groups">
                                        <GroupIcon />
                                        <ListItemText disableTypography primary={"Groups"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Activities"} disablePadding sx={{ mb: "1rem" }}>
                                    <ListItemButton LinkComponent={Link} to="/admin/activities">
                                        <BackpackIcon />
                                        <ListItemText disableTypography primary={"Activities"} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem key={"Shop Settings"} disablePadding>
                                    <ListItemButton LinkComponent={Link} to="/admin/shop">
                                        <StorefrontIcon />
                                        <ListItemText disableTypography primary={"Shop Settings"} />
                                    </ListItemButton>
                                </ListItem>
                            </ThemeProvider>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md="9">
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/users/*" element={<AdminUsersRoutes />} />
                        <Route path="/activities/*" element={<AdminActivitiesRoutes />} />
                        <Route path="/shop/*" element={<AdminShopRoutes />} />
                        <Route path="/groups/*" element={<AdminGroupsRoutes />} />
                    </Routes>
                </Grid>
            </Grid>
        </Container>
    )
}

