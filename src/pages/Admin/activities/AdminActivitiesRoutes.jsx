import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, Box, Button } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import GroupIcon from '@mui/icons-material/GroupRounded';
import BackpackIcon from '@mui/icons-material/BackpackRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import { AddRounded, List } from '@mui/icons-material'
import ViewActivities from './ViewActivities'
import CreateActivity from './CreateActivity'
import EditActivity from './EditActivity'
import CreateAvailability from './CreateAvailability'
import CreateCategory from './CreateCategory'
import ViewCategories from './ViewCategories'
import EditCategory from './EditCategory'
import ViewBookings from './ViewBookings'

export const CategoryContext = createContext(null);
export default function AdminActivitiesRoutes() {
    const [activePage, setActivePage] = useState(null);

    return (
        <>
            <CategoryContext.Provider value={{activePage, setActivePage}}>
                <Card sx={{ mt: "1rem" }}>
                    <CardContent>
                        <Box sx={{ alignItems: "center", overflowX: "auto", whiteSpace: "nowrap" }}>
                            <Button variant={activePage == 1 ? "contained" : "secondary"} startIcon={<List/>} sx={{mr: ".5rem"}} LinkComponent={Link} to="/admin/activities">Activity List</Button>
                            <Button variant={activePage == 2 ? "contained" : "secondary"} startIcon={<AddRounded/>} sx={{mr: ".5rem"}} LinkComponent={Link} to="/admin/activities/create">Create Activity</Button>
                            <Button variant={activePage == 3 ? "contained" : "secondary"} startIcon={<List/>} sx={{mr: ".5rem"}} LinkComponent={Link} to="/admin/activities/ViewCategories">Category List</Button>
                            <Button variant={activePage == 4 ? "contained" : "secondary"} startIcon={<AddRounded/>}  LinkComponent={Link} to="/admin/activities/createCategory">Add Category</Button>
                            
                        </Box>
                    </CardContent>
                </Card>
                <Routes>
                    <Route path="/" element={<ViewActivities />} />
                    <Route path="/create" element={<CreateActivity />} />
                    <Route path="/createCategory" element={<CreateCategory />} />
                    <Route path="/viewCategories" element={<ViewCategories />} />
                    <Route path="/viewBookings/:id" element={<ViewBookings />} />
                    <Route path="/categories/:id" element={<EditCategory />} />
                    <Route path="/createAvailability/:id" element={<CreateAvailability />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/:id" element={<EditActivity />} />
                </Routes>
            </CategoryContext.Provider>
        </>
        
    )
}