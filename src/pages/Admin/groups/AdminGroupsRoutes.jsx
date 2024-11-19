import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, Box, Button } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import { CellTowerRounded, GroupRounded, List } from '@mui/icons-material'
import ViewGroups from './ViewGroups'
import CreateGroup from './CreateGroup'

export const CategoryContext = createContext(null);
export default function AdminGroupsRoutes() {
    const [activePage, setActivePage] = useState(null);

    return (
        <>
            <CategoryContext.Provider value={{activePage, setActivePage}}>
                <Card sx={{ mt: "1rem" }}>
                    <CardContent>
                        <Box sx={{ alignItems: "center", overflowX: "auto", whiteSpace: "nowrap" }}>
                            <Button variant={activePage == 1 ? "contained" : "secondary"} startIcon={<GroupRounded/>} sx={{mr: ".5rem"}} LinkComponent={Link} to="/admin/groups">Groups</Button>
                            <Button variant={activePage == 2 ? "contained" : "secondary"} startIcon={<PersonAddIcon/>} sx={{mr: ".5rem"}} LinkComponent={Link} to="/admin/groups/create">Create Group</Button>
                        </Box>
                    </CardContent>
                </Card>
                <Routes>
                    <Route path="/" element={<ViewGroups />} />
                    <Route path="/create" element={<CreateGroup />} />
                    {/* <Route path="/edit/:id" element={<EditUser />} /> */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>
        
    )
}