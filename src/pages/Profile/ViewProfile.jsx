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
import titleHelper from "../../functions/helpers";


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
    }, [])

    titleHelper("View Profile");

    return (

        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Profile Information" icon={<PersonRounded />} />
                    <Grid container mt=".5rem" spacing={2}>
                        <Grid item xs={12} md={6}>
                            <InfoBox loading={!user} title="Name" value={user && user.name} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox loading={!user} title="Phone Number" value={user && (user.phone_number ? user.phone_number : "Not Provided")} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InfoBox loading={!user} title="Birthday" value={user && (user.birthdate ? moment(user.birthdate).format("DD/MM/YYYY") : "Not Provided")} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )

}