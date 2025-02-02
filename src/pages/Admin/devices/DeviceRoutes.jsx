import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import ViewDevices from './ViewDevices'
import CreateDevice from './CreateDevice'

export const DeviceContext = createContext(null);

export default function DeviceRoutes() {
    const [activePage, setActivePage] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
       
    }, [])

    return (
        <>
            <DeviceContext.Provider value={{ activePage, setActivePage }}>
                <Routes>
                    <Route path="/" element={<ViewDevices />} />
                    <Route path="/create" element={<CreateDevice />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </DeviceContext.Provider>
        </>
    )
}