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
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { gsap } from 'gsap';
// import { motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CountUp from 'react-countup';


gsap.registerPlugin(ScrollTrigger);


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
            tl.from(charRef1.current, { yPercent: -600, opacity: 0, duration: 0.5, delay: 0.5, stagger: 0.5, ease: "back.out" })
            tl.from(canvasRef.current, { xPercent: 100, duration: 1.5, delay: 0, ease: "power4.inOut" })
            tl.from(charRef2.current, { xPercent: 600, opacity: 0, duration: 1, delay: 0, stagger: 0.5, ease: "bounce.inOut" })
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
                y: 50,
                duration: 0.8,
                ease: "power2.out",
            });

        })

        return () => ctx.revert();
    }, [])


    useEffect(() => {
        //getBanners()
        //getActivities()
    }, [])

    const SceneWithAnimation = () => {
        const { scene, animations } = useGLTF('../../public/test.gltf');
        const { actions } = useAnimations(animations, scene);

        useEffect(() => {
            if (actions) {
                Object.values(actions).forEach(action => action.play());
            }
        }, [actions]);

        return (
            <primitive
                object={scene}
                position={[5, 1, -5]} // Replace x, y, z with desired coordinates
                scale={[0.6, 0.6, 0.6]} // Adjust scale if necessary
                rotation={[0, Math.PI / 2, 0]}
            />
        )
    };

    const LeafAnimation = () => {
        const { scene, animations } = useGLTF('../../public/Leaf.gltf');
        const { actions } = useAnimations(animations, scene);

        useEffect(() => {
            if (actions) {
                Object.values(actions).forEach(action => action.play());
            }
        }, [actions]);

        return (
            <primitive
                object={scene}
                position={[0, 0, -10]} // Replace x, y, z with desired coordinates
                scale={[1, 1, 1]} // Adjust scale if necessary
                rotation={[0, Math.PI / 2, 0]}
            />
        )
    };

    return (
        <>
            <Container disableGutters maxWidth="false" sx={{ backgroundColor: "#B2CC83", height: "100vh" }} ref={comp}>
                <Canvas ref={canvasRef}>
                    <ambientLight />
                    <OrbitControls enableZoom={false} enableRotate={false} />
                    <Suspense fallback={null}>
                        {/* <Cloud position={[8, 1, -5]} rotation={[0, Math.PI / 2, 0]} /> */}
                        {/* <Grass /> */}
                        <SceneWithAnimation />
                        {/* might use new one, see animation first */}
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
                        <Typography variant='h1' style={{ fontWeight: "900", color: "#44624A" }}>
                            {"Midori".split("").map((char, index) => (
                                <span key={index} ref={el => charRef1.current[index] = el} style={{ display: 'inline-block' }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>

                        <Typography variant='h1' style={{ fontWeight: "900", color: "White" }}>
                            {"SKY".split("").map((char, index) => (
                                <span key={index} ref={el => charRef2.current[index] = el} style={{ display: 'inline-block' }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>
                    </Stack>
                    <Box alignItems={"start"} ref={sloganRef}>
                        <Typography variant='h4' style={{ fontWeight: "700", color: "#44624A" }}>
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
            </Container>
            {/* 2nd part */}
            {/* maybe use parallax lib can add img */}
            <Container disableGutters maxWidth="false" sx={{ backgroundColor: "#96E168", height: "100vh" }}  >
                <Canvas>
                    <ambientLight />
                    <OrbitControls enableZoom={false} enableRotate={false} />
                    <Suspense fallback={null}>
                        <LeafAnimation />
                    </Suspense>
                    <Environment preset="sunset" />
                </Canvas>
                <Box
                    ref={comp2}
                    sx={{
                        position: "absolute",
                        top: "160%", // Center vertically within the container
                        left: "50%", // Center horizontally within the container
                        transform: "translate(-50%, -50%)", // Adjust for perfect centering
                        height: "100%",
                        zIndex: 10,
                    }}
                >
                    <Typography ref={textRef} style={{ fontSize: "6rem", fontWeight: "700", color: "#44624A", textAlign: "center" }}>
                        Our farm statistics
                    </Typography>

                    <Box mt={5}>
                        <Stack direction={"row"} justifyContent={"center"} spacing={5}>
                            <Stack direction={"column"} alignItems={"center"}>
                                {startCounting && (
                                    <CountUp
                                        style={{ fontSize: "4rem", fontWeight: "900", color: "#44624A" }}
                                        start={0}
                                        end={1000}
                                        duration={3}
                                    />
                                )}
                                <Typography style={{ fontSize: "2rem", fontWeight: "700", color: "#44624A" }}>
                                    Green tea harvested
                                </Typography>

                            </Stack>
                            <Stack direction={"column"} alignItems={"center"}>
                                {startCounting && (
                                    <CountUp
                                        style={{ fontSize: "4rem", fontWeight: "900", color: "#44624A" }}
                                        start={0}
                                        end={5}
                                        duration={3}
                                    />
                                )}
                                <Typography style={{ fontSize: "2rem", fontWeight: "700", color: "#44624A" }}>
                                    Farm plots
                                </Typography>

                            </Stack>
                            <Stack direction={"column"} alignItems={"center"}>
                                {startCounting && (
                                    <CountUp
                                        style={{ fontSize: "4rem", fontWeight: "900", color: "#44624A" }}
                                        start={0}
                                        end={120}
                                        duration={3}
                                    />
                                )}
                                <Typography style={{ fontSize: "2rem", fontWeight: "700", color: "#44624A" }}>
                                    Workers
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction={"column"} alignItems={"center"}>
                            {startCounting && (
                                <CountUp
                                    style={{ fontSize: "4rem", fontWeight: "900", color: "#44624A" }}
                                    start={0}
                                    end={120}
                                    duration={3}
                                />
                            )}
                            <Typography style={{ fontSize: "2rem", fontWeight: "700", color: "#44624A" }}>
                                Workers
                            </Typography>

                        </Stack>
                        <Typography mt={5} style={{ fontSize: "2rem", fontWeight: "700", color: "#44624A", textAlign: "center" }}>
                            Our farm is located in the heart of Japan, where the climate is perfect for growing the best green tea in the world. Our tea is harvested by our dedicated workers, who ensure that only the best leaves are picked. We have been in the tea business for over 50 years, and our experience shows in the quality of our products.
                        </Typography>
                    </Box>



                </Box>


            </Container>
        </>
    )
}


export default Home