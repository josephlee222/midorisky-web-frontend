import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Grid, Box, Typography, ButtonBase, Skeleton, Stack } from '@mui/material'
import { AdminPanelSettingsRounded, AppsRounded, AssignmentLateRounded, BackpackRounded, CalendarTodayRounded, CloseRounded, ForestRounded, GrassRounded, GroupRounded, ManageAccountsOutlined, ManageAccountsRounded, MapRounded, QueryStatsRounded, SettingsRounded, ShopRounded, StorefrontRounded, TaskAltRounded } from '@mui/icons-material'
import CardTitle from '../../components/CardTitle'
import http from '../../http'
import titleHelper from '../../functions/helpers';
import { LayoutContext } from './AdminRoutes'

export default function AdminHome() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const nf = new Intl.NumberFormat();


    useEffect(() => {
        setContainerWidth("xl")
        setAdminPage(true)

        // http.get("/Admin/Dashboard").then((res) => {
        //     if (res.status === 200) {
        //         setStats(res.data)
        //     } else {
        //         enqueueSnackbar("Failed to load statistics", { variant: "error" });
        //     }
        // }).catch((err) => {
        //     enqueueSnackbar("Failed to load statistics", { variant: "error" });
        // })
    }, [])

    titleHelper("Admin Dashboard")

    return (
        <>
            <Box my={"1rem"}>
                <Card>
                    <CardContent>
                        <CardTitle title="Staff Shortcuts" icon={<AppsRounded />} />
                        <Grid container spacing={2} mt={"0"}>
                            <Grid item xs={12} sm={6}>
                                <Card variant='draggable'>
                                    <ButtonBase component={Link} to="/staff/tasks" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <TaskAltRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>My Tasks</Typography>
                                            <Typography variant="body1">View Assigned Tasks</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant='draggable'>
                                    <ButtonBase component={Link} to="/staff/farms" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <MapRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Farm Map</Typography>
                                            <Typography variant="body1">View Farm Map</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card variant='draggable'>
                                    <ButtonBase component={Link} to="/staff/farms" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <ForestRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Farms</Typography>
                                            <Typography variant="body1">Manage Farms</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card variant='draggable'>
                                    <ButtonBase component={Link} to="/staff/plots" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <GrassRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Plots</Typography>
                                            <Typography variant="body1">Manage Individual Plots</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={12} xl={4}>
                                <Card variant='draggable'>
                                    <ButtonBase component={Link} to="/staff/shop" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <SettingsRounded sx={{ width: "36px", height: "36px" }} />
                                            <Typography variant="h6" fontWeight={700}>Configure</Typography>
                                            <Typography variant="body1">Configure MidoriSKY</Typography>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>

                    </CardContent>
                </Card>
                <Grid container spacing={2} mt={"0.5rem"}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Outstanding To-Do Tasks" icon={<AssignmentLateRounded />} />
                                <Grid container spacing={2} mt={"0"}>
                                    <Grid item xs={12}>
                                        <Card variant='draggable'>
                                            <CardContent>
                                                <Stack color={"grey"} spacing={"0.5rem"} sx={{ display: "flex", justifyItems: "center", alignItems: "center" }}>
                                                    <CloseRounded sx={{ height: "48px", width: "48px" }} />
                                                    <Typography variant="h6" fontWeight={700}>Not Implemented</Typography>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <CardTitle title="General Statistics" icon={<QueryStatsRounded />} />
                                <Grid container spacing={2} mt={"0"}>
                                    <Grid item xs={12}>
                                        <Card variant='draggable'>
                                            <CardContent>
                                                <Stack color={"grey"} spacing={"0.5rem"} sx={{ display: "flex", justifyItems: "center", alignItems: "center" }}>
                                                    <CloseRounded sx={{ height: "48px", width: "48px" }} />
                                                    <Typography variant="h6" fontWeight={700}>Not Implemented</Typography>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box >
        </>
    )
}

