import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardMedia, Container, Typography, Divider, Stack, Grid, Dialog, DialogContent, DialogActions, DialogTitle, Button } from '@mui/material'
import CardTitle from '../components/CardTitle'
import { Close, Info } from '@mui/icons-material'
import InfoBox from '../components/InfoBox'
import titleHelper from '../functions/helpers'

function About() {

    const [open, setOpen] = useState(false);
    titleHelper("About MidoriSKY")

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
                            image="/about_bg.jpg"
                            alt="Material Forest"
                        />
                    </div>
                    <CardContent>
                        <CardTitle title="MidoriSKY Systems" back="/" icon={<Info />} />
                        <Typography variant="body2" color="text.secondary" marginTop={"0.5rem"}>
                            MidoriSKY project. Farm management system website and mobile application.
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h5" fontWeight={700} marginBottom={"1rem"}>Credits</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Tasks, user management and technical support" value="Joseph Lee" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Weather stats + prediction, devices and charts" value="Samuel Ong" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Realtime notifications, emails and design" value="Aloysius Lim" />
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h5" fontWeight={700} marginBottom={"1rem"}>Technologies</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Frontend" value="ReactJS, Material UI, Websockets" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InfoBox title="Backend" value="AWS Services" />
                            </Grid>
                            <Grid item xs={12}>
                                <InfoBox title="AWS Services" value="Lambda, Cognito, API Gateway, Sagemaker, SQS, SES & others" />
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
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/tFcusl55yIk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<Close/>} onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>

    )
}

export default About