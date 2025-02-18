import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../App';
import { useSnackbar } from 'notistack';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Card, CardContent, Grid, Typography, ButtonBase, Stack, Chip, IconButton, Box, Skeleton, Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { AssignmentLateRounded, QueryStatsRounded, AppsRounded, TaskAltRounded, MapRounded, ForestRounded, GrassRounded, SettingsRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, PersonRounded, GroupRounded, ContentPasteOffRounded, CloseRounded, MoreVertRounded, WarningRounded, RefreshRounded, ThermostatRounded, CloudRounded, DashboardRounded, NotificationsRounded, NotificationsNoneRounded, RouterRounded } from '@mui/icons-material'
import CardTitle from '../../components/CardTitle'
import http from '../../http'
import titleHelper from '../../functions/helpers';
import { LayoutContext } from './AdminRoutes'
import { get } from 'aws-amplify/api'
import TaskDialog from '../../components/TaskDialog'
import TaskPopover from '../../components/TaskPopover'
import UserInfoPopover from '../../components/UserInfoPopover'
import { LoadingButton } from '@mui/lab'

export default function AdminHome() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, userRoles, notifications, setNotifications } = useContext(AppContext);
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsId, setDetailsId] = useState(null);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [UserInfoPopoverOpen, setUserInfoPopoverOpen] = useState(false);
    const [UserInfoPopoverAnchorEl, setUserInfoPopoverAnchorEl] = useState(null);
    const [UserInfoPopoverUserId, setUserInfoPopoverUserId] = useState(null);
    const [TasksLoading, setTasksLoading] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isFarmManager, setIsFarmManager] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const nf = new Intl.NumberFormat();

    // Register Chart.js components
    ChartJS.register(
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Title,
        Tooltip,
        Legend
    );

    // Extend dayjs with UTC plugin
    dayjs.extend(utc);

    // Weather state
    const [weatherData, setWeatherData] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [weatherRefreshing, setWeatherRefreshing] = useState(false);
    const [statsRefreshing, setStatsRefreshing] = useState(false);

    const useStyles = makeStyles(theme => ({
        outerDiv: {
            '&:hover': {
                "& $divIcon": {
                    opacity: "0.15",
                    bottom: "-28px",
                    right: "-28px",
                    rotate: "-15deg"
                }
            }
        },
        divIcon: {
            opacity: "0",
            transitionDuration: "1s"
        }
    }));

    const iconStyles = { position: "absolute", bottom: "-48px", right: "-48px", width: "128px", height: "128px", transition: "0.5s", display: { xs: "none", md: "initial" } }

    const classes = useStyles();

    const handleDetailsClick = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
    }

    const handleOptionsClick = (event, id) => {
        setDetailsId(id)
        setAnchorEl(event.currentTarget);
        setOptionsOpen(true)
    };

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleOnDelete = () => {
        setOptionsOpen(false)
        setDetailsDialogOpen(false)
        handleGetTasks()
    }

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setOptionsOpen(false)
    }

    async function handleNotificationDismiss(id = null) {
        if (id === null) {
            var req = get({
                apiName: "midori",
                path: "/notifications/read"
            })
        } else {
            var req = get({
                apiName: "midori",
                path: "/notifications/read/" + id
            })
        }

        try {
            var res = await req.response
            enqueueSnackbar("Notification dismissed", { variant: "success" })
            refreshNotifications()
        } catch (error) {
            console.error(error)
            enqueueSnackbar("Failed to dismiss notification", { variant: "error" })
        }
    }

    const refreshNotifications = () => {
        setNotificationsLoading(true);
        // Check for notifications
        var notificationReq = get({
            apiName: "midori",
            path: "/notifications",
        });

        notificationReq.response.then((res) => {
            res.body.json().then((data) => {
                setNotifications(data);
                setNotificationsLoading(false);
            }).catch((e) => {
                console.log(e);
                setNotificationsLoading(false);
                enqueueSnackbar("Failed to load notifications", { variant: "error" });
            });
        }).catch((e) => {
            console.log(e);
            setNotificationsLoading(false);
            enqueueSnackbar("Failed to load notifications", { variant: "error" });
        });
    }

    // Weather data fetching functions
    const fetchHistoricalWeatherData = async () => {
        setHistoryLoading(true);
        try {
            const response = get({
                apiName: 'midori',
                path: '/staff/weather/fetch-current-and-next-hours',
            });

            const res = await response.response;
            let result = '';
            let done = false;

            if (res.body && typeof res.body.getReader === 'function') {
                const reader = res.body.getReader();
                while (!done) {
                    const { value, done: isDone } = await reader.read();
                    done = isDone;
                    if (value) result += new TextDecoder().decode(value);
                }

                let parsedData = JSON.parse(result);
                if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
                setHistoricalData(parsedData);
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            enqueueSnackbar('Failed to fetch weather data', { variant: 'error' });
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRefreshStats = async () => {
        setStatsRefreshing(true);
        await fetchHistoricalWeatherData();
        setStatsRefreshing(false);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '--';
        return dayjs.utc(timestamp).format('hh:mm A DD-MM-YYYY');
    };

    // Process historical data timestamps
    if (historicalData.length > 0) {
        historicalData.forEach(item => {
            item.formattedTime = dayjs.utc(item.Timestamp).format('DD-MM-YYYY HH:mm');
        });
    }

    // Chart configuration
    const createChartConfig = (metric, label, color) => {
        const currentDate = dayjs().utc(+8);
        return {
            labels: historicalData.map((item) => item.formattedTime),
            datasets: [
                {
                    label: label,
                    data: historicalData.map((item) => item[metric]),
                    borderColor: color,
                    backgroundColor: `${color}33`,
                    tension: 0.4,
                    fill: true,
                    segment: {
                        borderDash: (ctx) =>
                            dayjs.utc(historicalData[ctx.p0DataIndex].Timestamp).add(30, 'minute').isAfter(currentDate) ? [6, 6] : undefined,
                    },
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: false,
                    text: "Date",
                },
                ticks: {
                    callback: function (value, index, ticks) {
                        const dateTime = dayjs.utc(historicalData[index]?.Timestamp).format('HH:mm A');
                        return `${dateTime}`;
                    },
                },
            },
            y: {
                title: {
                    display: false,
                    text: "Value",
                },
                beginAtZero: true,
            },
        },
    };

    const metrics = [
        { key: 'Temperature', label: 'Temperature (°C)', color: '#FF5733', icon: <ThermostatRounded /> },
        { key: 'Precipitation', label: 'Precipitation (mm)', color: '#8E44AD', icon: <CloudRounded /> },
    ];


    const generateSkeletons = () => {
        let skeletons = []
        for (let i = 0; i < 3; i++) {
            skeletons.push(
                <Card variant='draggable'>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Typography variant="h6" fontWeight={700} mr={"1rem"}><Skeleton width={"15rem"} animation='wave' /></Typography>
                        </Box>
                        <Stack direction="row" spacing={1} mt={2}>
                            <Skeleton width={"5rem"} animation='wave' />
                            <Skeleton width={"5rem"} animation='wave' />
                            <Skeleton width={"5rem"} animation='wave' />
                        </Stack>
                        <Typography mt={"0.5rem"} fontSize={"0.75rem"} color='grey'><Skeleton width={"8.5rem"} animation='wave' /></Typography>
                    </CardContent>
                </Card>
            )
        }
        return skeletons
    }

    const generateTask = (task) => {
        return (
            <Card variant='draggable'>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                        <ButtonBase sx={{ width: "100%", justifyContent: 'start', borderRadius: "10px", mt: "0.25rem" }} onClick={() => handleDetailsClick(task.id)}>
                            <Typography variant="h6" fontWeight={700} mr={"1rem"} textAlign={"start"}>{task.title}</Typography>
                        </ButtonBase>
                        <IconButton onClick={(e) => { handleOptionsClick(e, task.id) }}><MoreVertRounded /></IconButton>
                    </Box>
                    <Stack direction="row" spacing={1} mt={2}>
                        {task.priority === 3 && <Chip icon={<Looks3Rounded />} label="Low" color="info" size='small' />}
                        {task.priority === 2 && <Chip icon={<LooksTwoRounded />} label="Medium" color="warning" size='small' />}
                        {task.priority === 1 && <Chip icon={<LooksOneRounded />} label="High" color="error" size='small' />}
                        <Chip icon={<PersonRounded />} label={task.created_by} size='small' onClick={(e) => { handleShowUserInformation(e, task.created_by) }} />
                        <Chip icon={<GroupRounded />} label={`${task.users_assigned} Assigned`} size='small' />
                    </Stack>
                    <Typography mt={"0.5rem"} fontSize={"0.75rem"} color='grey'>Created on {
                            new Date(task.created_at).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
                            })
                        }
                    </Typography>
                </CardContent>
            </Card>
        )

    }



    const generateNoTasks = () => {
        return (
            <Card variant='draggable'>
                <CardContent>
                    <Stack color={"grey"} spacing={"0.5rem"} sx={{ display: "flex", justifyItems: "center", alignItems: "center" }}>
                        <ContentPasteOffRounded sx={{ height: "48px", width: "48px" }} />
                        <Typography variant="h6" fontWeight={700}>No tasks available</Typography>
                    </Stack>
                </CardContent>
            </Card>
        )
    }


    const handleShowUserInformation = (e, userId) => {
        setUserInfoPopoverUserId(userId)
        setUserInfoPopoverOpen(true)
        setUserInfoPopoverAnchorEl(e.currentTarget)
    }

    const handleGetTasks = async () => {
        // Fetch all tasks
        setTasksLoading(true)
        var req = get({
            apiName: "midori",
            path: "/tasks/list/outstanding",
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            setTasks(data)
            setTasksLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to get tasks", { variant: "error" })
            setTasksLoading(false)
        }
    }


    useEffect(() => {
        setContainerWidth("xl")
        setAdminPage(true)
        handleGetTasks()
        fetchHistoricalWeatherData()
    }, [])


    useEffect(() => {
        if (userRoles.includes("FarmManager") || userRoles.includes("Admin")) {
            setIsFarmManager(true)
        }

        if (userRoles.includes("Admin")) {
            setIsAdmin(true)
        }
    }, [userRoles])



    titleHelper("Main Dashboard")

    return (
        <>
            <Box my={"1rem"}>
                <Card>
                    <CardContent>
                        <CardTitle title="Staff Shortcuts" icon={<AppsRounded />} />
                        {isAdmin && (
                            <Grid container spacing={2} mt={"0"}>
                                <Grid item xs={12} sm={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/tasks/my" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <TaskAltRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>My Tasks</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>View Assigned Tasks</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <TaskAltRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/farms/dashboard" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <DashboardRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>Farm Dashboard</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>View Farm Statistics</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <DashboardRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} xl={4}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/farms" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <ForestRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>Farms</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage Farms</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <ForestRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} xl={4}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/devices" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <RouterRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>IoT Devices</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage IoT Devices</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <RouterRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={12} xl={4}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/users" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <GroupRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>Users</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage Users</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <GroupRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                        {!isAdmin && (
                            <Grid container spacing={2} mt={"0"}>
                                <Grid item xs={12} sm={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/tasks/my" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <TaskAltRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>My Tasks</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>View Assigned Tasks</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <TaskAltRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/farms/dashboard" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <DashboardRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>Farm Dashboard</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>View Farm Statistics</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <DashboardRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} xl={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/farms" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <ForestRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>Farms</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage Farms</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <ForestRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} xl={6}>
                                    <Card variant='draggable'>
                                        <ButtonBase className={classes.outerDiv} component={Link} to="/staff/devices" sx={{ width: "100%", justifyContent: 'start' }}>
                                            <CardContent sx={{ color: "primary.main" }}>
                                                <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                    <RouterRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={700}>IoT Devices</Typography>
                                                        <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage IoT Devices</Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                            <RouterRounded className={classes.divIcon} sx={iconStyles} />
                                        </ButtonBase>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                    </CardContent>
                </Card>
                <Grid container spacing={2} mt={"0.5rem"}>
                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="My To-Dos" icon={<AssignmentLateRounded />} />
                                    <LoadingButton onClick={handleGetTasks} loading={TasksLoading} variant="text" startIcon={<RefreshRounded />} loadingPosition='start' size='small'>Refresh</LoadingButton>
                                </Box>
                                <Stack direction="column" spacing={"1rem"} mt={"1rem"}>
                                    {(!TasksLoading && tasks.length === 0) && (
                                        generateNoTasks()
                                    )}
                                    {TasksLoading && generateSkeletons()}
                                    {!TasksLoading && tasks.map(task => (
                                        generateTask(task)
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} xl={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="Latest Notifications" icon={<NotificationsRounded />} />
                                    <LoadingButton loading={notificationsLoading} startIcon={<RefreshRounded />} loadingPosition='start' size='small' onClick={refreshNotifications}>Refresh</LoadingButton>
                                </Box>
                                <Grid container spacing={2} mt={"0"}>
                                    <Grid item xs={12}>
                                        <Stack direction="column" spacing={"1rem"}>
                                            {notifications.length === 0 && (
                                                <Card variant='draggable'>
                                                    <CardContent>
                                                        <Stack color={"grey"} spacing={"0.5rem"} sx={{ display: "flex", justifyItems: "center", alignItems: "center" }}>
                                                            <NotificationsNoneRounded sx={{ height: "48px", width: "48px" }} />
                                                            <Typography variant="h6" fontWeight={700}>No Notifications</Typography>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            )}
                                            {notifications.slice(0, 3).map(notification => (
                                                <Card variant='draggable'>
                                                    <CardContent>
                                                        <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "normal" }}>{notification.title}</Typography>
                                                        <Typography variant="body2" mb={".5rem"} sx={{ whiteSpace: "pre-wrap" }}>{notification.subtitle}</Typography>
                                                        <Stack direction="row" justifyContent="flex-end">
                                                            <Button variant="outlined" color="primary" size="small" onClick={() => { handleNotificationDismiss(notification.id) }}>Dismiss</Button>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            ))
                                            }
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} xl={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="General Statistics" icon={<QueryStatsRounded />} />
                                    <LoadingButton
                                        onClick={handleRefreshStats}
                                        loading={statsRefreshing}
                                        variant="text"
                                        startIcon={<RefreshRounded />}
                                        loadingPosition='start'
                                        size='small'
                                    >
                                        Refresh
                                    </LoadingButton>
                                </Box>
                                <Grid container spacing={2} mt={"0"}>
                                    {metrics.map((metric) => (
                                        <Grid item xs={12} key={metric.key}>
                                            <Card variant='draggable'>
                                                <CardContent>
                                                    <CardTitle title={metric.label} icon={metric.icon} />

                                                    {historyLoading || statsRefreshing ? (
                                                        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                                                    ) : (
                                                        <Box width="100%" height={250} sx={{ mt: 2 }}>
                                                            <Line
                                                                data={createChartConfig(metric.key, metric.label, metric.color)}
                                                                options={chartOptions}
                                                            />
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box >
            <TaskDialog open={detailsDialogOpen} onClose={handleDetailsClose} taskId={detailsId} onDelete={handleOnDelete} onUpdate={handleGetTasks} farmerMode={!isFarmManager} />
            <TaskPopover open={optionsOpen} anchorEl={anchorEl} onClose={handleOptionsClose} onTaskDetailsClick={() => { setDetailsDialogOpen(true); handleOptionsClose() }} onDelete={handleOnDelete} taskId={detailsId} />
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>
    )
}

