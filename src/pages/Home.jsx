import { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
//import NotFound from './errors/NotFound'
//import { UserContext } from '..'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack } from '@mui/material'
import { AppContext } from '../App';
import { HomeRounded, LoginRounded, NewReleasesRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import http from '../http';
import { useSnackbar } from "notistack";
import moment from 'moment';
import { get } from 'aws-amplify/api';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import Cloud from '../../public/Cloud'
import { gsap } from 'gsap';
import { motion } from "framer-motion";




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

    const comp = useRef(null);
    const textRef = useRef(null);
    const canvasRef = useRef(null);
    const skyRef = useRef(null);
    const charRef1 = useRef([]);
    const charRef2 = useRef([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.from(charRef1.current, { yPercent: -600, opacity: 0, duration: 1.5, delay: 2, stagger: 0.5, ease: "back.out" })
            tl.from(canvasRef.current, { xPercent: 100, duration: 1.5, delay: 0, ease: "power4.inOut" })
            tl.from(charRef2.current, { xPercent: 600, opacity: 0, duration: 1.5, delay: 0, stagger: 0.5, ease: "bounce.inOut" })
        }, comp)

        return () => ctx.revert();
    }, [])

    useEffect(() => {
        //getBanners()
        //getActivities()
    }, [])

    return (
        <>
            <Container maxWidth="false" sx={{ backgroundColor: "#B2CC83", height: "100vh" }} ref={comp}>
                <Canvas ref={canvasRef}>
                    <ambientLight />
                    <OrbitControls enableZoom={false} enableRotate={false} />
                    <Suspense fallback={null}>
                        <Cloud position={[8, 1, -5]} rotation={[0, Math.PI / 6, 0]} />
                    </Suspense>
                    <Environment preset="sunset" />
                </Canvas>
                <Box
                    sx={{
                        position: "absolute",  // screnn smaller, center text (do later)
                        top: "50%",
                        left: "30%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10, // Ensure the text is above the Canvas
                        color: "white",
                    }}
                >
                    <Stack direction={"row"}>
                        <Typography ref={textRef} variant='h1' style={{ fontFamily: "'Poppins', sans-serif", fontWeight: "700", color: "#44624A" }}>
                            {"Midori".split("").map((char, index) => (
                                <span key={index} ref={el => charRef1.current[index] = el} style={{ display: 'inline-block' }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>

                        <Typography ref={skyRef} variant='h1' style={{ fontFamily: "'Poppins', sans-serif", fontWeight: "700", color: "White" }}>
                            {"SKY".split("").map((char, index) => (
                                <span key={index} ref={el => charRef2.current[index] = el} style={{ display: 'inline-block' }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>
                    </Stack>
                </Box>
            </Container>

            <Container maxWidth="false" sx={{ backgroundColor: "#6BA368", height: "100vh" }} >
                <Box
                    sx={{
                        position: "relative",
                        height: "100%",
                        display: "flex",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "20%",
                            backgroundColor: "#44624A",
                            zIndex: 2, // Ensure box is above the text initially
                        }}
                        component={motion.div}
                        initial={{
                            y: 0,
                        }}
                        whileInView={{
                            y: "100%",
                            opacity: 0
                        }}
                        viewport={{
                            amount: "all", // Animation triggers when 50% of the text is in view
                        }}
                        transition={{
                            duration: 1.5, // Adjust the duration for smoothness
                            ease: "easeInOut", // Adjust the easing for smoothness
                        }}
                        
                    />
                    <Typography
                        variant='h1'
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "700",
                            color: "#FFFFFF",
                            zIndex: 1, // Text remains under the box initially
                            position: "relative",
                        }}
                        component={motion.div}
                        initial={{
                            opacity: 0,
                        }}
                        whileInView={{
                            opacity: 1,
                        }}
                        viewport={{
                            amount: 0.5,
                        }}
                        transition={{
                            duration: 1.5,
                        }}
                    >
                       KILL MEEEEE
                    </Typography>
                </Box>


            </Container>
        </>
    )
}


export default Home