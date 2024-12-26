import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { LayoutContext } from '../AdminRoutes'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import { CellTowerRounded, List } from '@mui/icons-material'
import ViewUsers from './ViewUsers'
import CreateUser from './CreateUser'
import EditUser from './EditUser'
import BroadcastNotification from './BroadcastNotification'
import { validateStaffRoles } from '../../../functions/user'

export const CategoryContext = createContext(null);
export default function AdminUsersRoutes() {
    const [activePage, setActivePage] = useState(null);
    const { setContainerWidth } = useContext(LayoutContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setContainerWidth("xl")
        validateStaffRoles(["Admin"]).then((isAdmin) => {
            if (!isAdmin) {
                enqueueSnackbar("You must be an admin to view this page", { variant: "error" });
                navigate("/")
            }
        })
    }, [])

    const handleTabChange = (event, newValue) => {
        setActivePage(newValue);
        switch (newValue) {
            case 0:
                navigate("/staff/users");
                break;
            case 1:
                navigate("/staff/users/create");
                break;
            case 2:
                navigate("/staff/users/broadcast");
                break;
            default:
                navigate("/staff/users");
                break;
        }
    }

    return (
        <>
            <CategoryContext.Provider value={{ activePage, setActivePage }}>
                {/* <Card sx={{ mt: "1rem" }}>
                    <CardContent>
                        <Box sx={{ alignItems: "center", overflowX: "auto", whiteSpace: "nowrap" }}>
                            <Button variant={activePage == 1 ? "contained" : "secondary"} startIcon={<List />} sx={{ mr: ".5rem" }} LinkComponent={Link} to="/staff/users">User List</Button>
                            <Button variant={activePage == 2 ? "contained" : "secondary"} startIcon={<PersonAddIcon />} sx={{ mr: ".5rem" }} LinkComponent={Link} to="/staff/users/create">Create User</Button>
                            <Button variant={activePage == 3 ? "contained" : "secondary"} startIcon={<CellTowerRounded />} LinkComponent={Link} to="/staff/users/broadcast">Broadcast</Button>
                        </Box>
                    </CardContent>
                </Card> */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activePage}
                        onChange={handleTabChange}
                        aria-label="User Management"
                        variant='scrollable'
                        scrollButtons="auto"
                    >
                        <Tab icon={<List />} iconPosition="start" label="User List" />
                        <Tab icon={<PersonAddIcon />} iconPosition="start" label="Create User" />
                        <Tab icon={<CellTowerRounded />} iconPosition="start" label="Broadcast" />
                    </Tabs>
                </Box>
                <Routes>
                    <Route path="/" element={<ViewUsers />} />
                    <Route path="/create" element={<CreateUser />} />
                    <Route path="/broadcast" element={<BroadcastNotification />} />
                    <Route path="/edit/:id" element={<EditUser />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>

    )
}