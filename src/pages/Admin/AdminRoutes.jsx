import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../errors/NotFound'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { validateAdmin, validateStaffRoles } from '../../functions/user'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, createTheme, ThemeProvider } from '@mui/material'
import AdminUsersRoutes from './users/AdminUsersRoutes'
import AdminActivitiesRoutes from './activities/AdminActivitiesRoutes'
import AdminShopRoutes from './shop/AdminShopRoutes'
import AdminGroupsRoutes from './groups/AdminGroupsRoutes'
import AdminHome from './AdminHome'
import TaskRoutes from './tasks/TaskRoutes'
import FarmRoutes from './farms/FarmRoutes'
import DeviceRoutes from './devices/DeviceRoutes'

export const LayoutContext = createContext(null);

export default function AdminRoutes() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const [containerWidth, setContainerWidth] = useState("xl");
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        setAdminPage(true)
        validateStaffRoles(["Farmer", "Admin", "FarmManager"]).then((isStaff) => {
            if (!isStaff) {
                enqueueSnackbar("You must be a staff member to view this page", { variant: "error" });
                navigate("/")
            }
        })
    }, [])

    return (
        <>
            <LayoutContext.Provider value={{ containerWidth, setContainerWidth }}>
                <Container maxWidth={containerWidth}>
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<AdminHome />} />
                        <Route path="/farms/*" element={<FarmRoutes />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/users/*" element={<AdminUsersRoutes />} />
                        <Route path="/activities/*" element={<AdminActivitiesRoutes />} />
                        <Route path="/shop/*" element={<AdminShopRoutes />} />
                        <Route path="/groups/*" element={<AdminGroupsRoutes />} />
                        <Route path='/tasks/*' element={<TaskRoutes />} />
                        <Route path='/devices/*' element={<DeviceRoutes />} />
                    </Routes>
                </Container>
            </LayoutContext.Provider>
        </>
    )
}

