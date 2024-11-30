import React from 'react'
import { Container, Typography, Divider, Box, Grid, Stack, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import StoreIcon from '@mui/icons-material/Store';
import { ContactPageRounded, EmailRounded, PhoneRounded, PolicyRounded } from '@mui/icons-material';

function Footer() {
    return (
        <>
            <Divider />
            <Box sx={{

            }}>
                <Container
                    maxWidth="xl"
                    sx={{
                        marginY: "1rem",
                    }}
                >
                    <Typography variant='p' color='primary' sx={{ fontWeight: 700 }}>MidoriSKY Systems</Typography>
                    <Grid container spacing={2}>

                        <Grid item xs={12} lg={6}>
                            <Stack spacing={2} direction={{ sx: "column", lg: "row" }} color={"primary.main"}>
                                <Button color='inherit' startIcon={<HomeIcon />} LinkComponent={Link} variant="text" to="/">Home</Button>
                                <Button color='inherit' startIcon={<ContactPageRounded />} LinkComponent={Link} variant="text" to="/">Contact Us</Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <Stack spacing={2} direction={"row"} justifyContent={{xs: "center", md: "start"}} color={"primary.main"}>
                                <Box display={"flex"} alignItems={"center"}>
                                    <EmailRounded sx={{ marginRight: "1rem" }} />
                                    <Box>
                                        <Typography fontWeight={700} variant='body1'>Email</Typography>
                                        <Typography variant='body2'>
                                            sky@midorifarm.net
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display={"flex"} alignItems={"center"}>
                                    <PhoneRounded sx={{ marginRight: "1rem" }} />
                                    <Box>
                                        <Typography fontWeight={700} variant='body1'>Phone</Typography>
                                        <Typography variant='body2'>
                                            +65 9123 4567
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>

                </Container>
                <Box sx={{ textAlign: "center", margin: "1rem" }}>
                    <Link to="/about" style={{ textDecoration: "none", color: "inherit" }}>
                        <Typography color={"inherit"} sx={{ textAlign: "center", opacity: "0.5" }} >MidoriSKY - ECP Group 3 - 2025</Typography>
                    </Link>
                </Box>
            </Box>

        </>
    )
}

export default Footer