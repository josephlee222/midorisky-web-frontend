import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Test from '../Test'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Grid, Typography, ButtonBase, Stack, Chip, IconButton, Box, Skeleton } from '@mui/material'
import { AssignmentLateRounded, QueryStatsRounded, AppsRounded, TaskAltRounded, MapRounded, ForestRounded, GrassRounded, SettingsRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, PersonRounded, GroupRounded, ContentPasteOffRounded, CloseRounded, MoreVertRounded, WarningRounded, RefreshRounded } from '@mui/icons-material'
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
    const { setAdminPage, user } = useContext(AppContext);
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
    const [tasks, setTasks] = useState([]);
    const nf = new Intl.NumberFormat();

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
                    <Typography mt={"0.5rem"} fontSize={"0.75rem"} color='grey'>Created on {task.created_at}</Typography>
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
        console.log("Getting tasks")
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
                                    <CardTitle title="Device Alerts" icon={<WarningRounded />} />
                                    <LoadingButton startIcon={<RefreshRounded />} loadingPosition='start' size='small'>Refresh</LoadingButton>
                                </Box>
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
                    <Grid item xs={12} xl={4}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="General Statistics" icon={<QueryStatsRounded />} />
                                    <LoadingButton startIcon={<RefreshRounded />} loadingPosition='start' size='small'>Refresh</LoadingButton>
                                </Box>
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
            <TaskDialog open={detailsDialogOpen} onClose={handleDetailsClose} taskId={detailsId} onDelete={handleOnDelete} />
            <TaskPopover open={optionsOpen} anchorEl={anchorEl} onClose={handleOptionsClose} onTaskDetailsClick={() => { handleDetailsClick(detailsId); handleOptionsClose() }} onDelete={handleOnDelete} taskId={detailsId} />
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>
    )
}

