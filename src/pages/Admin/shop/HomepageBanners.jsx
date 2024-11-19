import React, { useEffect, useState, useContext } from 'react'
import { Chip, Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent, Grid, Alert, ButtonBase } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from './AdminShopRoutes';
import CardTitle from '../../../components/CardTitle';
import { BarChartRounded, Close, Person, UploadFileRounded, ViewCarouselRounded } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import http from "../../../http";
import { useSnackbar } from 'notistack';


function getChipProps(params) {
    return {
        label: params.value,
    };
}

function HomepageBanners() {
    const [banners, setBanners] = useState({})
    const [loading, setLoading] = useState(false)
    const [bannerSlot, setBannerSlot] = useState(null)
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    const { enqueueSnackbar } = useSnackbar();
    const apiUrl = import.meta.env.VITE_API_URL;
    titleHelper("Homepage Banners")

    const [bannerDialog, setBannerDialog] = useState(false);

    const handleBannerDialogClose = () => {
        setBannerDialog(false);
    }

    const handleBannerDialogOpen = (slot) => {
        setBannerSlot(slot);
        setBannerDialog(true);
    }

    const handlePictureChange = (e) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        http.post("/File/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => {
            if (res.status === 200) {
                var data = {
                    slot: bannerSlot,
                    imagePath: res.data.filename
                }
                http.post("/Admin/Shop/Banner", data).then((res) => {
                    if (res.status === 200) {
                        enqueueSnackbar("Banner uploaded successfully!", { variant: "success" });
                        getBanners();
                        setLoading(false);
                        handleBannerDialogClose();
                    } else {
                        enqueueSnackbar("Banner upload failed!", { variant: "error" });
                        setLoading(false);
                        handleBannerDialogClose();
                    }
                }).catch((err) => {
                    enqueueSnackbar("Banner upload failed! " + err.response.data.message, { variant: "error" });
                    setLoading(false);
                    handleBannerDialogClose();
                })
            } else {
                enqueueSnackbar("Profile picture update failed!", { variant: "error" });
                setLoadingPicture(false);
                handleBannerDialogClose();
            }
        }).catch((err) => {
            enqueueSnackbar("Profile picture update failed! " + err.response.data.message, { variant: "error" });
            setLoadingPicture(false);
            handleBannerDialogClose();
        })
    }

    const getBanners = () => {
        http.get("/Admin/Shop/Banner").then((res) => {
            if (res.status === 200) {
                setBanners(res.data)
            }
        }).catch((err) => {
            enqueueSnackbar("Failed to load banners! " + err.response.data.message, { variant: "error" });
        }
        )
    }

    useEffect(() => {
        setActivePage(2)
        getBanners()
    }, [])
    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="Homepage Banners" icon={<ViewCarouselRounded />} />
                        <Alert severity="info" sx={{ marginTop: "1rem" }}>Homepage banners are the banners that appear on the homepage of the website. You can add, edit or delete them from here.</Alert>
                        <Grid container spacing={2} mt={".5rem"}>
                            <Grid item xs={6} md={3}>
                                <Card sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", aspectRatio: "1/1", backgroundColor: "#ffffff" }}>
                                    <ButtonBase onClick={() => handleBannerDialogOpen(1)}>
                                        <CardContent>
                                            {banners.banner1 ? <img src={apiUrl + "/uploads/" + banners.banner1.imagePath} alt="Banner 1" style={{ width: "100%", height: "100%" }} /> : <Button variant="secondary">Add Banner</Button> }

                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", aspectRatio: "1/1", backgroundColor: "#ffffff" }}>
                                    <ButtonBase onClick={() => handleBannerDialogOpen(2)}>
                                        <CardContent>
                                            {banners.banner2 ? <img src={apiUrl + "/uploads/" + banners.banner2.imagePath} alt="Banner 2" style={{ width: "100%", height: "100%" }} /> : <Button variant="secondary">Add Banner</Button> }

                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", aspectRatio: "1/1", backgroundColor: "#ffffff" }}>
                                    <ButtonBase onClick={() => handleBannerDialogOpen(3)}>
                                        <CardContent>
                                            {banners.banner3 ? <img src={apiUrl + "/uploads/" + banners.banner3.imagePath} alt="Banner 3" style={{ width: "100%", height: "100%" }} /> : <Button variant="secondary">Add Banner</Button> }

                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card sx={{ height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", aspectRatio: "1/1", backgroundColor: "#ffffff" }}>
                                    <ButtonBase onClick={() => handleBannerDialogOpen(4)}>
                                        <CardContent>
                                            {banners.banner4 ? <img src={apiUrl + "/uploads/" + banners.banner4.imagePath} alt="Banner 4" style={{ width: "100%", height: "100%" }} /> : <Button variant="secondary">Add Banner</Button> }

                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

            </Box>
            <Dialog open={bannerDialog} onClose={handleBannerDialogClose}>
                <DialogTitle>Banner Options</DialogTitle>
                <Box component="form">
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            You can upload a new banner here. The banner will be displayed on the homepage of the website. The recommended ratio is 1:1.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleBannerDialogClose} startIcon={<Close />}>Cancel</Button>
                        <LoadingButton  component="label" loadingPosition="start" loading={loading} variant="text" color="primary" startIcon={<UploadFileRounded />}>Upload Banner<input type='file' onChange={handlePictureChange} hidden /></LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>

        </>
    )
}

export default HomepageBanners