import { useContext, useEffect, createContext, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../../errors/NotFound'
import Test from '../../Test'
import { AppContext } from '../../../App'
import { useSnackbar } from 'notistack'
import { Box, Button, Tabs, Tab, Typography, useTheme } from '@mui/material'
import ViewFarms from './ViewFarms'
import ViewSWeather from './ViewSWeather'
import ViewSYield from './ViewSYield'
import ViewS from './ViewS'
import { LayoutContext } from '../AdminRoutes'
import { ListRounded, TimelineRounded } from '@mui/icons-material'
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewFarmDashboard from './ViewFarmDashboard'; 

export const CategoryContext = createContext(null);
export default function FarmRoutes() {
    const [activePage, setActivePage] = useState(null);
    const { setContainerWidth } = useContext(LayoutContext);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        setContainerWidth("xl")
    }, [])

    const handleTabChange = (event, newValue) => {
        setActivePage(newValue);
        switch (newValue) {
            case 0:
                navigate("/staff/farms/dashboard");
                break;
            case 1:
                navigate("/staff/farms");
                break;
            case 2:
                navigate("/staff/farms/statistics/weather");
                break;
            case 3:
                navigate("/staff/farms/statistics/yield");
                break;
            default:
                navigate("/staff/users");
                break;
        }
    }

    return (
        <>
            <CategoryContext.Provider value={{ activePage, setActivePage }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activePage}
                        onChange={handleTabChange}
                        aria-label="User Management"
                        variant='scrollable'
                        scrollButtons="auto"
                    >
                        <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
                        <Tab icon={<ListRounded />} iconPosition="start" label="Farms" />
                        <Tab icon={<TimelineRounded />} iconPosition="start" label="Weather" />
                        <Tab icon={<TimelineRounded />} iconPosition="start" label="Yield" />
                    </Tabs>
                </Box>
                <Routes>
                    <Route path="/dashboard" element={<ViewFarmDashboard />} /> 
                    <Route path="/" element={<ViewFarms />} />
                    <Route path="/statistics/weather" element={<ViewSWeather />} />
                    <Route path="/statistics/yield" element={<ViewSYield />} />
                    <Route path="/statistics/test" element={<ViewS />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CategoryContext.Provider>
        </>
    )
}