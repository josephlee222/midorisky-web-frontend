import { useContext, useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid, Container, CardMedia, Skeleton, Box, Button } from '@mui/material'
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import { PersonRounded, WarningRounded } from "@mui/icons-material";
import InfoBox from "../../components/InfoBox";
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import http from '../../http';
import { Link } from 'react-router-dom';
import moment from "moment";


export default function ViewBookings() {
    const { setActivePage } = useContext(ProfileContext);
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState([]);
    const [Activities, setActivities] = useState([])
    const handleGetBookings = () => {
        http.get("/Booking/").then((res) => {
            if (res.status === 200) {
                setBooking(res.data)
                setLoading(false)
            }
        })
    }
    const handleGetActivities = () => {
        http.get("/Activity/").then((res) => {
            if (res.status === 200) {
                setActivities(res.data)
                setLoading(false)
            }
        })
    }
    const getActivityName = (activityId) => {
        const activity = Activities.find((act) => act.id === activityId);
        return activity ? activity.name : "Activity Not Found";
    };



    const CustomCard = ({ id, availability, date, pax, notes }) => (
        <Link to={`/activityList/${availability.activity.id}`} style={{ textDecoration: 'none' }}>
            <Card>
                <CardContent>

                    <Typography variant="h6" fontWeight={700}>{availability.activity.name}</Typography>

                    <Typography>On {moment(date).format("DD/MM/YYYY")}</Typography>
                    <Typography>{pax} people</Typography>
                    <Typography>Paid ${(availability.price * pax).toFixed(2)}</Typography>
                    <Typography>Notes: {notes ? notes : "No notes"}</Typography>

                    <Button LinkComponent={Link} to={`/editBooking/${id}`} variant="contained" color="primary" sx={{ mt: "1rem" }}>Edit</Button>
                </CardContent>
            </Card>
        </Link>
    );

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


    useEffect(() => {
        setActivePage(2);
        document.title = "Bookings - UPlay";
        handleGetBookings();
        handleGetActivities()
    }, [])

    return (
        <>

            {!loading && booking.length === 0 &&
                <Card sx={{ mt: "1rem" }}>
                    <CardContent>
                        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <WarningRounded sx={{ fontSize: 100, color: "black", opacity: "0.5" }} />
                            <Typography variant="h6" fontWeight={700}>No Bookings Found</Typography>
                        </Box>
                    </CardContent>
                </Card>
            }

            <Grid container spacing={2} mt={"0rem"}>
                {loading && <>{[...Array(6)].map((card) => (
                    <Grid item key={card} xs={12} sm={6} lg={4}>
                        <CustomSkeletonCard />
                    </Grid>
                ))}</>}

                {!loading && <>{booking.map((card) => (
                    <Grid item key={card.id} xs={12} sm={6} lg={4}>
                        <CustomCard {...card} />
                    </Grid>
                ))}</>}
            </Grid>
        </>
    )
}