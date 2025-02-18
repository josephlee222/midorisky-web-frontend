import React, { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect, useMemo, memo } from 'react'
import { Route, Routes, Navigate, Link } from 'react-router-dom'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack, Grid2, useTheme } from '@mui/material'
import { AppContext } from '../App';
import { HomeRounded, LoginRounded, NewReleasesRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import http from '../http';
import { useSnackbar } from "notistack";
import moment from 'moment';
import { get } from 'aws-amplify/api';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CountUp from 'react-countup';
import { Parallax } from 'react-parallax';

gsap.registerPlugin(ScrollTrigger);

function Home() {
    titleHelper("Home")
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

    // These functions remain unchanged (they are commented out for now)
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
        })
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
        })
    }

    const comp = useRef(null);
    const comp2 = useRef(null);
    const textRef = useRef(null);
    const sloganRef = useRef(null);
    const buttonRef = useRef(null);
    const canvasRef = useRef(null);
    const [startCounting, setStartCounting] = useState(false);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Grab characters using class selectors
            const chars1 = gsap.utils.toArray('.char-1');
            const chars2 = gsap.utils.toArray('.char-2');

            gsap.from([chars1, chars2, sloganRef.current], {
                duration: 1.2,
                stagger: 0.08,
                opacity: 0,
                y: 80,
                rotationX: 90,
                transformOrigin: '50% 50% -50',
                ease: 'power1.in',
                immediateRender: false
            });

            gsap.fromTo(textRef.current,
                { opacity: 1 },
                {
                    scrollTrigger: {
                        trigger: comp2.current,
                        start: 'top center+=10%',
                        toggleActions: 'play none none none',
                        onEnter: () => {
                            setStartCounting(true);
                        },
                        markers: false, // Turn off markers in production
                    },
                    ease: 'circ.out',
                    overwrite: 'auto'
                }
            );
        }, comp.current);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        //getBanners()
        //getActivities()
    }, [])

    // ----------------- THREE.JS Scene Component -----------------
    const ThreeScene = memo(({ modelPath, position, scale, rotation }) => {
        const mountRef = useRef(null);

        useEffect(() => {
            const currentMount = mountRef.current;
            // Create scene, camera, and renderer
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(
                75,
                currentMount.clientWidth / currentMount.clientHeight,
                0.1,
                1000
            );
            camera.position.set(1, -1, 5);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            renderer.setClearColor(0x000000, 0);
            currentMount.appendChild(renderer.domElement);

            // Add lights
            const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444466, 1.5);
            hemisphereLight.position.set(0, 20, 0);
            scene.add(hemisphereLight);

            const mainLight = new THREE.DirectionalLight(0xfffbe8, 0.8);
            mainLight.position.set(-2, 4, 3);
            mainLight.shadow.radius = 3;
            scene.add(mainLight);

            const fillLight = new THREE.DirectionalLight(0xccf0ff, 0.2);
            fillLight.position.set(3, 2, -1);
            scene.add(fillLight);

            // Set up OrbitControls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableZoom = false;
            controls.enableRotate = true;
            controls.enablePan = false;
            controls.target.set(0, 0, 0);
            controls.minDistance = 5.9;
            controls.maxDistance = 6.1;
            controls.minPolarAngle = Math.PI / 4;
            controls.maxPolarAngle = Math.PI / 2 + Math.PI / 8;
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;

            // Load 3D model (now loading a .glb file)
            const loader = new GLTFLoader();
            let mixer;
            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(...position);
                    model.scale.set(...scale);
                    model.rotation.set(...rotation);
                    scene.add(model);

                    if (gltf.animations && gltf.animations.length) {
                        mixer = new THREE.AnimationMixer(model);
                        gltf.animations.forEach((clip) => {
                            mixer.clipAction(clip).play();
                        });
                    }
                },
                undefined,
                (error) => {
                    console.error("Error loading model:", error);
                }
            );

            // Start the animation loop
            const clock = new THREE.Clock();
            let frameId;
            const animate = () => {
                frameId = requestAnimationFrame(animate);
                const delta = clock.getDelta();
                if (mixer) mixer.update(delta);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            // Handle window resize
            const handleResize = () => {
                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            };
            window.addEventListener("resize", handleResize);

            // Cleanup on unmount
            return () => {
                window.removeEventListener("resize", handleResize);
                cancelAnimationFrame(frameId);
                controls.dispose();
                renderer.dispose();
                if (renderer.domElement && currentMount.contains(renderer.domElement)) {
                    currentMount.removeChild(renderer.domElement);
                }
                // Dispose all geometries and materials in the scene
                scene.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
            };
        }, [modelPath, position, scale, rotation]);

        return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
    });

    // Components for different scenes with .glb files
    const BackgroundScene = () => {
         return <ThreeScene
            modelPath="./background.glb"
            position={[5, 1, -5]}
            scale={[0.6, 0.6, 0.6]}
            rotation={[0, Math.PI / 2, 0]}
        />
    };

    const LeafScene = () => (
        <ThreeScene
            modelPath="./Leaf.glb"
            position={[0, 0, -23]}
            scale={[1, 1, 1]}
            rotation={[0, Math.PI / 2, 0]}
        />
    );

    return (
        <>
            <Container disableGutters maxWidth="false" sx={{ backgroundColor: "#A0DDE6", height: "100vh" }} ref={comp}>
                <BackgroundScene />
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "30%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10,
                        color: "white",
                    }}
                >
                    <Stack direction={"row"}>
                        <Typography variant='h1' style={{ fontWeight: "900", color: "#44624A" }}>
                            {"Midori".split("").map((char, index) => (
                                <span key={index} className='char-1' style={{ display: 'inline-block' }}>
                                    {char}
                                </span>
                            ))}
                        </Typography>
                        <Typography variant='h1' style={{ fontWeight: "900", color: "white" }}>
                            {"SKY".split("").map((char, index) => (
                                <span key={index} className='char-2' style={{ display: 'inline-block' }}>
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
            {/* <Box width={"100%"} sx={{ backgroundColor: "#44624A" }}>
                <Container maxWidth="xl">
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Box
                                ref={comp2}
                                my={{ xs: 5, lg: "10rem" }}
                                sx={{ position: 'relative' }}
                            >
                                <Typography ref={textRef} variant='h2' style={{ color: "white", fontWeight: "900" }}>
                                    About MidoriSKY
                                </Typography>
                                <Typography variant='body1' style={{ color: "white" }} sx={{ mb: "1rem" }}>
                                    Our farm is located in the heart of Japan, where the climate is perfect for growing the best green tea in the world. Our tea is harvested by our dedicated workers, who ensure that only the best leaves are picked. We have been in the tea business for over 50 years, and our experience shows in the quality of our products.
                                </Typography>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                        <Stack direction={"column"} alignItems={"center"}>
                                            {startCounting && (
                                                <CountUp
                                                    className='count-up'
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
                                                    className='count-up'
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
                                                    className='count-up'
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
                                                    className='count-up'
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
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                {/* You can add another ThreeScene or Canvas animation here */}
            {/* </Box>
                        </Grid2>
                    </Grid2>
                </Container>
            </Box> */}
            <Box width={"100%"} sx={{ backgroundColor: "#44624A" }}>
                <Parallax bgImage="/bg2.jpg" strength={200} blur={{ min: -5, max: 15 }}>
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

export default Home;
