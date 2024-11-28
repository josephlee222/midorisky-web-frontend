// Navbar and footer should be added here

import React, { useState, createContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import UserRoutes from './pages/UserRoutes';
import AdminRoutes from './pages/Admin/AdminRoutes';
import Navbar from './components/Navbar';
import http from './http';
import { useSnackbar } from 'notistack';
import { Home } from '@mui/icons-material';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

export const AppContext = createContext(null);
function App() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [currentNotification, setCurrentNotification] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [adminPage, setAdminPage] = useState(false);
    const [connection, setConnection] = useState(null);
    const [title, setTitle] = useState(document.title);
    const [icon, setIcon] = useState(() => Home);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Initializer code
        getCurrentUser().then((user) => {
            fetchUserAttributes().then((attributes) => {
                console.log(attributes);
                setUser(attributes);
                setUserLoading(false);
            }).catch((e) => {
                console.log(e);
                setUserLoading(false);
            })


            
        }).catch((e) => {
            console.log(e);
            setUserLoading(false);
        });
    }, [])

    return (
        <>
            <AppContext.Provider value={{
                user,
                setUser,
                userLoading,
                setUserLoading,
                adminPage,
                setAdminPage,
                connection,
                setConnection,
                notifications,
                setNotifications,
                title,
                setTitle,
                icon,
                setIcon,
                currentNotification,
                setCurrentNotification,
            }}>
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: "100%" }}>
                    <Navbar />
                    <Box sx={{ flexGrow: 1 }}>
                        <Routes location={location}>
                            <Route path='*' element={<UserRoutes />} />
                            <Route path='/admin/*' element={<AdminRoutes />} />
                        </Routes>
                    </Box>
                    <Footer />
                </Box>
            </AppContext.Provider>
        </>

    );
}

export default App;
