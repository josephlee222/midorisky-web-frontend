import { useContext, useEffect, useState } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
//import NotFound from './errors/NotFound'
//import { UserContext } from '..'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid } from '@mui/material'
import { AppContext } from '../App';
import { HomeRounded, LoginRounded, NewReleasesRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import http from '../http';
import { useSnackbar } from "notistack";
import moment from 'moment';
import { get } from 'aws-amplify/api';


function Home() {
    // Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    //const { setIsAdminPage } = useContext(UserContext);
    titleHelper("Home")
    const apiUrl = import.meta.env.VITE_API_URL;
    const [banners, setBanners] = useState({})
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(true)
    const [activities, setActivities] = useState([])
    const [loadingActivities, setLoadingActivities] = useState(false)
    const { enqueueSnackbar } = useSnackbar();

    const CustomSkeletonCard = () => (
        <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
                <Typography variant="h6"><Skeleton animation="wave" /></Typography>
                <Typography><Skeleton animation="wave" /></Typography>
                <Typography><Skeleton animation="wave" /></Typography>
            </CardContent>
        </Card>
    );

    const getBanners = () => {
        setLoading(true)
        http.get("/Shop/Banner").then((res) => {
            if (res.status === 200) {
                setBanners(res.data)
                setLoading(false)
            }
        }).catch((err) => {
            enqueueSnackbar("Failed to load banners! " + err.response.data.message, { variant: "error" });
            setLoading(false)
        }
        )
    }

    const getActivities = () => {
        setLoadingActivities(true)
        http.get("/Activity").then((res) => {
            if (res.status === 200) {
                var activities = res.data
                console.log(activities.reverse())
                setActivities(activities)
                setLoadingActivities(false)
            }
        }).catch((err) => {
            enqueueSnackbar("Failed to load activities! " + err.response.data.message, { variant: "error" });
            setLoadingActivities(false)
        }
        )
    }

    useEffect(() => {
        //getBanners()
        //getActivities()
    }, [])

    return (
        <>
            <Container maxWidth="false" sx={{ backgroundColor: "#B2CC83", height: "100vh" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <Typography variant="h2" sx={{ color: "#fff" }}>Welcome to the</Typography>
                            <Typography variant="h2" sx={{ color: "#fff" }}>Spline Tool</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        \
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

export default Home