import { useContext, useEffect } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../errors/NotFound'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { validateAdmin, validateStaffRoles } from '../../functions/user'
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
import ViewSWeather from './farms/ViewSWeather'
import ViewSYield from './farms/ViewSYield'
import ViewFarms from './farms/ViewFarms'

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
        validateStaffRoles(["Farmer", "Admin", "FarmManager"]).then((isAdmin) => {
            if (!isAdmin) {
                enqueueSnackbar("You must be an admin to view this page", { variant: "error" });
                navigate("/")
            }
        })
    }, [])

    return (
        <Container maxWidth="xl">
            <Grid container spacing={2} maxWidth={"xl"}>
                <Grid item xs="12">
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/farms/statistics/weather" element={<ViewSWeather />} />
                        <Route path="/farms/statistics/yield" element={<ViewSYield />} />
                        <Route path="/farms" element={<ViewFarms />} />
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

