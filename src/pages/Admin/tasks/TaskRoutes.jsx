import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import ViewTasks from './ViewTasks'


export const CategoryContext = createContext(null);
export default function TaskRoutes() {
    const [activePage, setActivePage] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        
    }, [])

    return (
        <>
            <CategoryContext.Provider value={{ activePage, setActivePage }}>
                <Routes>
                    <Route path="/" element={<ViewTasks />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>

    )
}