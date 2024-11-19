import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardMedia, Container, Typography, Divider, Stack, Grid, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@mui/material'
import CardTitle from '../components/CardTitle'
import { Close, Info } from '@mui/icons-material'
import InfoBox from '../components/InfoBox'
import titleHelper from '../functions/helpers'

function About() {

    const [open, setOpen] = useState(false);
    titleHelper("About UPlay")

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = (e) => {
        setOpen(false);
    };

    useEffect(() => {
        
    }, []);
    
    return (
        <>
            <Container maxWidth="md">
                <Card sx={{ marginY: "1rem" }}>
                    <div onClick={handleOpen}>
                        <CardMedia
                            component="img"
                            height="250"
                            image="/edit-couple-hiking-mountain-climbing-1296x728-header.png"
                            alt="Material Forest"
                        />
                    </div>
                    <CardContent>
                        <CardTitle title="About UPlay" back="/" icon={<Info />} />
                        <Typography variant="body2" color="text.secondary" marginTop={"0.5rem"}>
                            This project is a re-designed version of the original UPlay website by NTUC, which was developed by a group of students from Nanyang Polytechnic. 
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h5" fontWeight={700} marginBottom={"1rem"}>Credits</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="General Design, Users, Cart and Group Discussions" value="Joseph Lee" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Activities and bookings" value="Toby Aaron Benedict" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Groups (Backend)" value="Jing Hao" />
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h5" fontWeight={700} marginBottom={"1rem"}>Technologies</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Frontend" value="ReactJS, Material UI, SignalR" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Backend" value="ASP.NET, SignalR, MSSQL with Entity Framework" />
                            </Grid>
                            <Grid item xs={12}>
                                <InfoBox title="APIs" value="FIDO2 Passkeys, Stripe, OAuth (Google & Facebook)" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Container>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Secret Dialog</DialogTitle>
                <DialogContent>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/rlQd9qWKjLM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<Close/>} onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>

    )
}

export default About