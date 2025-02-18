import { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
//import NotFound from './errors/NotFound'
//import { UserContext } from '..'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack, Grid2, useTheme } from '@mui/material'
import { AppContext } from '../App';
import { HomeRounded, LoginRounded, NewReleasesRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import http from '../http';
import { useSnackbar } from "notistack";
import moment from 'moment';
import { get } from 'aws-amplify/api';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CountUp from 'react-countup';
import { Parallax } from 'react-parallax';


gsap.registerPlugin(ScrollTrigger);


function HomeTest() {
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
    const theme = useTheme()

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
    const comp2 = useRef(null);
    const textRef = useRef(null);
    const sloganRef = useRef(null);
    const buttonRef = useRef(null);
    const canvasRef = useRef(null);
    const charRef1 = useRef([]);
    const charRef2 = useRef([]);
    const [startCounting, setStartCounting] = useState(false);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            const tl = gsap.timeline()
            tl.from(charRef1.current, { yPercent: -500, opacity: 0, duration: 0.5, stagger: 0.5, ease: "back.out" })
            tl.from(sloganRef.current, { yPercent: 400, opacity: 0, duration: 1, delay: 0, ease: "back.inOut" })


            gsap.from(textRef.current, {
                scrollTrigger: {
                    trigger: comp2.current, // Box triggers animation
                    toggleActions: "play none none none", // Animation restarts when you scroll back up
                    onEnter: () => setStartCounting(true),
                    markers: true,         // Enable markers for debugging
                    start: "top 80%",      // Animation starts when the top of the box hits the top of the viewport
                    end: "top 20%",        // Animation ends when the top of the box hits the bottom of the viewport
                },
                opacity: 0,
                y: -500,
                duration: 1,
                ease: "power2.out",
            });

        })

        return () => ctx.revert();
    }, [])



    useEffect(() => {
        //getBanners()
        //getActivities()
    }, [])



    return (
        <>
            <Box>
                {/* Section 1 */}
                <Parallax bgImage="/bg2.jpg" strength={300} blur={{ min: -5, max: 15 }}>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Stack direction={"row"}>
                            <Typography variant='h1' style={{ fontWeight: "900", color: "white" }}>
                                {"MidoriSKY".split("").map((char, index) => (
                                    <span key={index} ref={el => charRef1.current[index] = el} style={{ display: 'inline-block' }}>
                                        {char}
                                    </span>
                                ))}
                            </Typography>
                        </Stack>
                        <Box alignItems={"start"} ref={sloganRef}>
                            <Typography variant='h4' style={{ fontWeight: "700", color: "white" }}>
                                Taste the freshness
                            </Typography>
                            <Button
                                variant="secondary"
                                component={Link}
                                sx={{ mt: 2 }}
                            >
                                Learn More
                            </Button>
                        </Box>
                    </Box>
                </Parallax>

                {/* Section 2 */}
                <Parallax bgImage="/bg1.jpg" strength={200} blur={{ min: -5, max: 15 }}>
                    <Box
                        sx={{
                            height: "100vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Box
                            ref={comp2}
                            my={{ xs: 5, lg: "10rem" }}
                        >
                            <Typography ref={textRef} variant='h1' style={{ color: "white", fontWeight: "900", mb: "2rem" }}>
                                About MidoriSKY
                            </Typography>
                            <Typography variant='h4' style={{ color: "white" }} sx={{ mb: "1rem" }}>
                                Our farm is located in the heart of Japan, where the climate is perfect for growing the best green tea in the world. Our tea is harvested by our dedicated workers, who ensure that only the best leaves are picked. We have been in the tea business for over 50 years, and our experience shows in the quality of our products.
                            </Typography>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Stack direction={"column"} alignItems={"center"}>
                                        {startCounting && (
                                            <CountUp
                                                style={{ fontSize: "3rem", fontWeight: "900", color: "white" }}
                                                start={0}
                                                end={1000}
                                                duration={3}
                                            />
                                        )}
                                        <Typography style={{ fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                                            Green tea harvested
                                        </Typography>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Stack direction={"column"} alignItems={"center"}>
                                        {startCounting && (
                                            <CountUp
                                                style={{ fontSize: "3rem", fontWeight: "900", color: "white" }}
                                                start={0}
                                                end={5}
                                                duration={3}
                                            />
                                        )}
                                        <Typography style={{ fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                                            Farms
                                        </Typography>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Stack direction={"column"} alignItems={"center"}>
                                        {startCounting && (
                                            <CountUp
                                                style={{ fontSize: "3rem", fontWeight: "900", color: "white" }}
                                                start={0}
                                                end={45}
                                                duration={3}
                                            />
                                        )}
                                        <Typography style={{ fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                                            Farm Plots
                                        </Typography>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={{ xs: 12, md: 6 }}>
                                    <Stack direction={"column"} alignItems={"center"}>
                                        {startCounting && (
                                            <CountUp
                                                style={{ fontSize: "3rem", fontWeight: "900", color: "white" }}
                                                start={0}
                                                end={120}
                                                duration={3}
                                            />
                                        )}
                                        <Typography style={{ fontSize: "1.5rem", fontWeight: "700", color: "white" }}>
                                            Employees
                                        </Typography>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        </Box>
                    </Box>
                </Parallax>

                {/* Uncommented Section 3 */}
                <Parallax bgImage="/Images/background.png" strength={200}>
                    <Box
                        sx={{
                            height: "500px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: { xs: "60px", md: "100px" } }}>
                                Partner with us today!
                            </Typography>
                            <Typography variant="h6">Contact us to find out more</Typography>
                        </Box>
                    </Box>
                </Parallax>
            </Box>


        </>
    )
}


export default HomeTest