import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Grid, Box, Typography, ButtonBase, Skeleton } from '@mui/material'
import { AdminPanelSettingsRounded, BackpackRounded, CalendarTodayRounded, GroupRounded, ManageAccountsRounded, QueryStatsRounded, ShopRounded, StorefrontRounded } from '@mui/icons-material'
import CardTitle from '../../components/CardTitle'
import http from '../../http'
import titleHelper from '../../functions/helpers';

export default function AdminHome() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ });
    const nf = new Intl.NumberFormat();


    useEffect(() => {
        setAdminPage(true)
        http.get("/Admin/Dashboard").then((res) => {
            if (res.status === 200) {
                setStats(res.data)
            } else {
                enqueueSnackbar("Failed to load statistics", { variant: "error" });
            }
        }).catch((err) => {
            enqueueSnackbar("Failed to load statistics", { variant: "error" });
        })
    }, [])

    titleHelper("Admin Dashboard")

    return (
        <>
            <Box my={"1rem"}>
                <Card>
                    <CardContent>
                        <CardTitle title="Admin Dashboard" icon={<AdminPanelSettingsRounded />} />
                        <Grid container spacing={2} mt={"0"}>
                            <Grid item xs={12} sm={6} xl={3}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/users" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <ManageAccountsRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Users</Typography>
                                            <Typography variant="body1">Manage User Accounts</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={3}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/groups" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <GroupRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Groups</Typography>
                                            <Typography variant="body1">Manage Group Discussions</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={3}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/activities" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <BackpackRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Activities</Typography>
                                            <Typography variant="body1">Manage Activities</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={3}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/shop" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <StorefrontRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Shop Settings</Typography>
                                            <Typography variant="body1">Configure Website</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>

                    </CardContent>
                </Card>
                <Card sx={{ mt: "1rem" }}>
                    <CardContent>
                        <CardTitle title="General Statistics" icon={<QueryStatsRounded />} />
                        <Grid container spacing={2} mt={"0"}>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/users" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Typography variant='h3' fontWeight={700}>
                                                {!stats?.userCount && <Skeleton variant="text" width={"100px"} />}
                                                {stats?.userCount && nf.format(stats?.userCount)}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700}>Users</Typography>
                                            <Typography variant="body1">Currently Registered</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/activities" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Typography variant='h3' fontWeight={700}>
                                                {!stats?.activityCount && <Skeleton variant="text" width={"100px"} />}
                                                {stats?.activityCount && nf.format(stats?.activityCount)}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700}>Activities</Typography>
                                            <Typography variant="body1">On UPlay</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={12} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <ButtonBase component={Link} to="/admin/shop" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Typography variant='h3' fontWeight={700}>
                                                {!stats?.transactionMoney && <Skeleton variant="text" width={"100px"} />}
                                                {stats?.transactionMoney && "$" + nf.format(stats?.transactionMoney)}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={700}>Money In</Typography>
                                            <Typography variant="body1">Last 30 Days</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box >
        </>
    )
}

