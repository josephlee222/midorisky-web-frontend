import { useContext, useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography, Button } from "@mui/material";
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import { PersonRounded, NewspaperRounded, CloseRounded, BadgeRounded } from "@mui/icons-material";
import InfoBox from "../../components/InfoBox";
import http from "../../http";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import moment from "moment";


export default function ViewProfile() {
    const { user, setUser } = useContext(AppContext);
    const { setActivePage } = useContext(ProfileContext);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleNewsletterSubscription = () => {
        setLoading(true);
        http.put("/User", { newsletter: !user.newsletter })
        .then((res) => {
            setUser(res.data);
            enqueueSnackbar("Newsletter subscription status updated.", { variant: "success" })
        })
        .catch((err) => {
            console.log(err);
            enqueueSnackbar("An error occurred while updating your newsletter subscription status.", { variant: "error" })
        })
        .finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        setActivePage(1);
        document.title = "Profile - UPlay" 
    }, [])

    return (

        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Profile Information" icon={<PersonRounded />} />
                    <Grid container mt=".5rem" spacing={2}>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Name" value={user && user.name} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Phone Number" value={user && (user.phoneNumber ? user.phoneNumber : "Not Provided")} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Birthday" value={user && (user.birthDate ? moment(user.birthDate).format("DD/MM/YYYY") : "Not Provided")} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="NRIC (Last 4 Digits)" value={user && (user.nric ? user.nric : "Not Provided")} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Membership & Other Information" icon={<BadgeRounded />} />
                    <Grid container mt=".5rem" spacing={2}>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Membership Status" value={user?.member ? "Yes" : "No"} boolean={user?.member}  />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Newsletter Subscription" boolean={user?.newsletter} value={user?.newsletter ? "Subscribed" : "Not Subscribed"} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Address" value={user && (user.address ? user.address : "Not Provided")} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox title="Postal Code" value={user && (user.postalCode ? user.postalCode : "Not Provided")} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Newsletter Subscription" icon={<NewspaperRounded />} />
                    <Typography variant="body1" mt={3}>Subscribe to our monthly newsletter to keep up-to-date on the latest NTUC UPlay offerings and discounts! Subscription to the newsletter is optional and can be disabled anytime on this menu.</Typography>
                    <LoadingButton variant="contained" sx={{ mt: 3 }} startIcon={user?.newsletter ? <CloseRounded/> : <NewspaperRounded />} fullWidth onClick={handleNewsletterSubscription} loading={loading} loadingPosition="start">{user?.newsletter ? "Unsubscribe to newsletter" : "Subscribe to Newsletter"}</LoadingButton>
                </CardContent>
            </Card>
        </>
    )

}