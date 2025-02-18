import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import ViewTasks from './ViewTasks'
import ViewAllTasks from './ViewAllTasks'


export const CategoryContext = createContext(null);
export default function TaskRoutes() {
    const [activePage, setActivePage] = useState(null);
    const { userRoles } = useContext(AppContext);
    const [isFarmManager, setIsFarmManager] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        if (userRoles.includes("FarmManager") || userRoles.includes("Admin")) {
            setIsFarmManager(true);
        }
    }, [userRoles])

    return (
        <>
            <CategoryContext.Provider value={{ activePage, setActivePage }}>
                <Routes>
                    
                    <Route path="/my" element={<ViewTasks assigned={true} />} />
                    {isFarmManager && <Route path="/all" element={<ViewAllTasks />} />}
                    {isFarmManager && <Route path="/" element={<ViewTasks />} />}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>

    )
}