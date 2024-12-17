import { useContext, useEffect, useState, createContext } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NotFound from '../errors/NotFound'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Container, Grid, Box, Typography, Button, Dialog, DialogTitle, DialogActions, DialogContent, IconButton, DialogContentText, Stack, Tooltip, Alert, Skeleton, Avatar } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ProfilePicture from '../../components/ProfilePicture'
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PublicIcon from '@mui/icons-material/PublicRounded';
import FileUploadIcon from '@mui/icons-material/FileUploadRounded';
import PageHeader from '../../components/PageHeader'
import { validateUser } from "../../functions/user";
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth'
import http from "../../http";
import md5 from "md5";

import ViewProfile from './ViewProfile'
import ViewBookings from './ViewBookings'
import ViewWallet from './ViewWallet'
import ViewSecurity from './ViewSecurity'
import ViewTransactions from './ViewTransactions'
import EditProfile from './EditProfile'
import ViewPasskeys from './ViewPasskeys'

export const ProfileContext = createContext(null);

export default function ProfileRoutes() {
    const { setAdminPage, user, setUser } = useContext(AppContext);
    const { enqueueSnackbar } = useSnackbar();
    const [activePage, setActivePage] = useState(null);
    const navigate = useNavigate();
    const [changePictureDialog, setChangePictureDialog] = useState(false);
    const [loadingPicture, setLoadingPicture] = useState(false);

    const handleChangePictureDialogClose = () => {
        setChangePictureDialog(false);
    }

    const handleChangePictureDialogOpen = () => {
        setChangePictureDialog(true);
    }

    const handlePictureChange = (e) => {
        setLoadingPicture(true);
        console.log(e);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        http.post("/user/Upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => {
            if (res.status === 200) {
                enqueueSnackbar("Profile picture updated successfully!", { variant: "success" });
                setUser(res.data);
                setLoadingPicture(false);
                handleChangePictureDialogClose();
            } else {
                enqueueSnackbar("Profile picture update failed!", { variant: "error" });
                setLoadingPicture(false);
                handleChangePictureDialogClose();
            }
        }).catch((err) => {
            enqueueSnackbar("Profile picture update failed! " + err.response.data.message, { variant: "error" });
            setLoadingPicture(false);
            handleChangePictureDialogClose();
        })
    }

    const handleGravatarChange = () => {
        setLoadingPicture(true);
        const email_md5 = md5(user.email)
        updateUserAttributes({ userAttributes: {picture: "gravatar"} }).then(async () => {
            enqueueSnackbar("Profile picture updated successfully!", { variant: "success" });
            const updatedUser = await fetchUserAttributes();
            setUser(updatedUser);
            setLoadingPicture(false);
            handleChangePictureDialogClose();
        }).catch((err) => {
            enqueueSnackbar("Profile picture update failed! " + err.message, { variant: "error" });
            setLoadingPicture(false);
            handleChangePictureDialogClose();
        })


        // const data = {
        //     profilePictureType: "gravatar"
        // }
        // http.put("/User", data).then((res) => {
        //     if (res.status === 200) {
        //         enqueueSnackbar("Profile picture updated successfully!", { variant: "success" });
        //         setUser(res.data);
        //         setLoadingPicture(false);
        //         handleChangePictureDialogClose();
        //     } else {
        //         enqueueSnackbar("Profile picture update failed!", { variant: "error" });
        //         setLoadingPicture(false);
        //         handleChangePictureDialogClose();
        //     }
        // }).catch((err) => {
        //     enqueueSnackbar("Profile picture update failed! " + err.response.data.message, { variant: "error" });
        //     setLoadingPicture(false);
        //     handleChangePictureDialogClose();
        // })
    }

    useEffect(() => {
        validateUser().then((valid) => {
            if (!valid) {
                enqueueSnackbar("You must be logged in to view this page", { variant: "error" });
                navigate("/login");
            }
        })
    }, [])

    return (
        <ProfileContext.Provider value={{ activePage, setActivePage }}>
            <PageHeader icon={BadgeRoundedIcon} title="My Profile" />
            <Container maxWidth="xl">
                <Grid container spacing={2} maxWidth={"xl"} mb={3}>
                    <Grid item xs={12} md="4" lg="3">
                        <Card sx={{ mt: "1rem", width: "100%" }}>
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    <Box width={"100%"} sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, alignItems: "center" }}>
                                        {!user && <Skeleton variant='circular'>
                                            <Avatar sx={{ width: ["72px", "96px", "128px"], height: ["72px", "96px", "128px"] }} />
                                        </Skeleton>}
                                        {user &&
                                            <Tooltip title="Change Profile Picture" arrow>
                                                <IconButton onClick={handleChangePictureDialogOpen}>

                                                    {user && <ProfilePicture user={user} sx={{ width: ["72px", "96px", "128px"], height: ["72px", "96px", "128px"] }} />}
                                                </IconButton>
                                            </Tooltip>
                                        }
                                        <Box display="flex" flexDirection="column" alignItems={{ xs: "start", md: "center" }} sx={{ ml: { xs: "1rem", md: "0" } }}>
                                            <Typography variant="h5" fontWeight={700} sx={{ mt: ".5rem" }}>{!user && <Skeleton width={"100px"} />}{user && user.name}</Typography>
                                            <Typography variant="body1">{!user && <Skeleton width={"200px"} />}{user && user.email}</Typography>
                                        </Box>
                                    </Box>
                                    <Button fullWidth variant="contained" sx={{ mt: "1rem" }} LinkComponent={Link} to="/profile/edit" startIcon={<EditRoundedIcon />}>Edit Profile</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md="8" lg="9">
                        <Card sx={{ mt: "1rem" }}>
                            <CardContent>
                                <Box sx={{ alignItems: "center", overflowX: "auto", whiteSpace: "nowrap" }}>
                                    <Button variant={activePage == 1 ? "contained" : "secondary"} startIcon={<BadgeRoundedIcon />} sx={{ mr: ".5rem", fontWeight: 700 }} LinkComponent={Link} to="/profile">Profile Information</Button>
                                    {/* <Button variant={activePage == 2 ? "contained" : "secondary"} startIcon={<TodayRoundedIcon />} sx={{ mr: ".5rem", fontWeight: 700 }} LinkComponent={Link} to="/profile/bookings">Bookings</Button>
                                    <Button variant={activePage == 3 ? "contained" : "secondary"} startIcon={<AccountBalanceWalletRoundedIcon />} sx={{ mr: ".5rem", fontWeight: 700 }} LinkComponent={Link} to="/profile/wallet">Wallet & Gifts</Button> */}
                                    <Button variant={activePage == 4 ? "contained" : "secondary"} startIcon={<SecurityRoundedIcon />} sx={{ fontWeight: 700 }} LinkComponent={Link} to="/profile/security">Account Security</Button>
                                </Box>
                            </CardContent>
                        </Card>
                        <Routes>
                            <Route path="*" element={<NotFound />} />
                            <Route path="/" element={<ViewProfile />} />
                            {/* <Route path="/bookings" element={<ViewBookings />} />
                            <Route path="/wallet" element={<ViewWallet />} /> */}
                            <Route path="/security" element={<ViewSecurity />} />
                            <Route path="/transactions" element={<ViewTransactions />} />
                            {/* <Route path="/passkeys" element={<ViewPasskeys />} /> */}
                            <Route path="/edit" element={<EditProfile />} />
                        </Routes>
                    </Grid>
                </Grid>
            </Container>
            <Dialog open={changePictureDialog} onClose={handleChangePictureDialogClose}>
                <DialogTitle>Change Profile Picture</DialogTitle>
                <Box component="form">
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            You are currently using a {user ? user.profilePictureType === "gravatar" ? "Gravatar" : "local" : "unknown"} profile picture.
                            <br /><br />
                            You can select a new profile picture from your computer or from Gravatar. To set a new profile picture from your computer, click on the "Upload Image" button below. To set a new profile picture from Gravatar, click on the "Use Gravatar" button below.
                            <br /><br />
                            For information on how to set a profile picture on Gravatar, please visit <a href="https://en.gravatar.com/support/">https://en.gravatar.com/support/</a>.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Stack direction={["column", "row"]} spacing={1}>
                            <Button style={{ justifyContent: "flex-end" }} onClick={handleChangePictureDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                            <LoadingButton style={{ justifyContent: "flex-end" }} loadingPosition="start" loading={loadingPicture} variant="text" color="primary" startIcon={<PublicIcon />} onClick={handleGravatarChange}>Use Gravatar</LoadingButton>
                            <LoadingButton style={{ justifyContent: "flex-end" }} loadingPosition="start" loading={loadingPicture} variant="text" color="primary" startIcon={<FileUploadIcon />} component="label">Upload Image<input type='file' onChange={handlePictureChange} hidden /></LoadingButton>
                        </Stack>
                    </DialogActions>
                </Box>
            </Dialog>
        </ProfileContext.Provider>
    )
}

