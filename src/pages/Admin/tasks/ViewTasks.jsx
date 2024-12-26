import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Skeleton } from '@mui/material'
import { LayoutContext } from '../AdminRoutes'
import CardTitle from '../../../components/CardTitle'
import { AddRounded, AssessmentRounded, AssignmentIndRounded, AssignmentLateRounded, AssignmentReturnedRounded, AssignmentReturnRounded, AssignmentRounded, AssignmentTurnedInRounded, CloseRounded, ContentPasteOffRounded, DeleteRounded, GroupRounded, InfoRounded, Looks3Rounded, LooksOneRounded, LooksTwoRounded, MoreVertRounded, PersonRounded, RefreshRounded, SwapHorizRounded, WarningRounded } from '@mui/icons-material'
import titleHelper from '../../../functions/helpers'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { get } from 'aws-amplify/api'
import { LoadingButton } from '@mui/lab'
import UserInfoPopover from '../../../components/UserInfoPopover'

export default function ViewTasks(props) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [toDo, setToDo] = useState([]);
    const [inProgress, setInProgress] = useState([]);
    const [pending, setPending] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [loading, setLoading] = useState(true);
    const [UserInfoPopoverOpen, setUserInfoPopoverOpen] = useState(false);
    const [UserInfoPopoverAnchorEl, setUserInfoPopoverAnchorEl] = useState(null);
    const [UserInfoPopoverUserId, setUserInfoPopoverUserId] = useState(null);
    const theme = useTheme();
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();

    const handleOptionsClick = (event) => {
        setAnchorEl(event.currentTarget);
        setOptionsOpen(true)
    };

    const generateSkeletons = () => {
        let skeletons = []
        for (let i = 0; i < 4; i++) {
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography variant="h6" fontWeight={700} mr={"1rem"}>{task.title}</Typography>
                        <IconButton onClick={handleOptionsClick}><MoreVertRounded /></IconButton>
                    </Box>
                    <Stack direction="row" spacing={1} mt={2}>
                        {task.priority === 3 && <Chip icon={<Looks3Rounded />} label="Low" color="info" size='small' />}
                        {task.priority === 2 && <Chip icon={<LooksTwoRounded />} label="Medium" color="warning" size='small' />}
                        {task.priority === 1 && <Chip icon={<LooksOneRounded />} label="High" color="error" size='small' />}
                        <Chip icon={<PersonRounded />} label={task.created_by} size='small' onClick={(e) => {handleShowUserInformation(e, task.created_by)}} />
                        <Chip icon={<GroupRounded />} label={`${task.users_assigned} Assigned`} size='small' />
                    </Stack>
                    <Typography mt={"0.5rem"} fontSize={"0.75rem"} color='grey'>Created on {task.created_at}</Typography>
                </CardContent>
            </Card>
        )

    }

    const handleShowUserInformation = (e, userId) => {
        setUserInfoPopoverUserId(userId)
        setUserInfoPopoverOpen(true)
        setUserInfoPopoverAnchorEl(e.currentTarget)
    }

    const generateNoTasks = () => {
        return (
            <Card variant='draggable'>
                <CardContent>
                    <Stack color={"grey"} spacing={"0.5rem"} sx={{ display: "flex", justifyItems: "center", alignItems: "center" }}>
                        <ContentPasteOffRounded sx={{ height: "48px", width: "48px" }} />
                        <Typography variant="h6" fontWeight={700}>No tasks in this category</Typography>
                    </Stack>
                </CardContent>
            </Card>
        )
    }

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setOptionsOpen(false)
    }

    const sortTasks = (tasks) => {
        var toDo = []
        var inProgress = []
        var pending = []
        var completed = []

        tasks.forEach(task => {
            switch (task.status) {
                case 1:
                    toDo.push(task)
                    break;
                case 2:
                    inProgress.push(task)
                    break;
                case 3:
                    pending.push(task)
                    break;
                case 4:
                    completed.push(task)
                    break;
                default:
                    break;
            }
        })

        setToDo(toDo)
        setInProgress(inProgress)
        setPending(pending)
        setCompleted(completed)
    }

    const handleGetTasks = async () => {
        // Fetch all tasks
        setLoading(true)
        if (props.myTasks) {
            // Fetch only my tasks
            var req = get({
                apiName: "midori",
                path: "/tasks/my",
            })
        } else {
            // Fetch all tasks
            var req = get({
                apiName: "midori",
                path: "/tasks/list/hidden",
            })

            try {
                var res = await req.response
                var data = await res.body.json()
                sortTasks(data)
                setLoading(false)
            } catch (err) {
                console.log(err)
                enqueueSnackbar("Failed to load tasks", { variant: "error" })
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        setContainerWidth(false)
        handleGetTasks()
    }, [])

    titleHelper("Task Board")

    return (
        <>
            <Box my={"1rem"}>
                <Typography display={{ xs: "none", md: "flex" }} variant="h4" fontWeight={700} my={"2rem"}>All Tasks</Typography>
                {/* <!-- Kanban Board --> */}
                <Stack direction="row" spacing={2} mb={2}>
                    <Button variant="contained" startIcon={<AddRounded />}>New...</Button>
                    <Button variant="secondary" startIcon={<AssignmentIndRounded />}>My Tasks</Button>
                    <LoadingButton variant="secondary" startIcon={<RefreshRounded />} onClick={handleGetTasks} loading={loading} loadingPosition='start'>Refresh</LoadingButton>
                </Stack>
                {/* <!-- Kanban Board --> */}
                <Stack direction={"row"} spacing={"1rem"} sx={{ overflowX: "scroll", scrollSnapType: "x mandatory" }}>
                    {/* <!-- To Do --> */}
                    <Card sx={{ minWidth: { xs: "100%", sm: "500px" }, maxWidth: { xs: "100%", sm: "500px" }, scrollSnapAlign: "start" }}>
                        <CardContent>
                            <CardTitle title="To Do" icon={<AssignmentRounded />} />
                            <Stack width={"100%"} spacing={"1rem"} sx={{ mt: "1rem", overflowY: "auto", maxHeight: "60vh", display: "inline-block" }}>
                                {(!loading && toDo.length === 0) && (
                                    generateNoTasks()
                                )}
                                {loading && (
                                    <>
                                        {generateSkeletons()}
                                    </>
                                )}
                                {!loading && toDo.map(task => (
                                    generateTask(task)
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                    {/* <!-- In Progress --> */}
                    <Card sx={{ minWidth: { xs: "100%", sm: "500px" }, maxWidth: { xs: "100%", sm: "500px" }, scrollSnapAlign: "start" }}>
                        <CardContent>
                            <CardTitle title="In Progress" icon={<AssignmentReturnedRounded />} />
                            <Stack width={"100%"} spacing={"1rem"} sx={{ mt: "1rem", overflowY: "auto", maxHeight: "60vh", display: "inline-block" }}>
                                {(!loading && inProgress.length === 0) && (
                                    generateNoTasks()
                                )}
                                {loading && (
                                    <>
                                        {generateSkeletons()}
                                    </>
                                )}
                                {!loading && inProgress.map(task => (
                                    generateTask(task)
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                    {/* <!-- Pending --> */}
                    <Card sx={{ minWidth: { xs: "100%", sm: "500px" }, maxWidth: { xs: "100%", sm: "500px" }, scrollSnapAlign: "start" }}>
                        <CardContent>
                            <CardTitle title="Pending" icon={<AssignmentLateRounded />} />
                            <Stack width={"100%"} spacing={"1rem"} sx={{ mt: "1rem", overflowY: "auto", maxHeight: "60vh", display: "inline-block" }}>
                                {(!loading && pending.length === 0) && (
                                    generateNoTasks()
                                )}
                                {loading && (
                                    <>
                                        {generateSkeletons()}
                                    </>
                                )}
                                {!loading && pending.map(task => (
                                    generateTask(task)
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                    {/* <!-- Completed --> */}
                    <Card sx={{ minWidth: { xs: "100%", sm: "500px" }, maxWidth: { xs: "100%", sm: "500px" }, scrollSnapAlign: "start" }}>
                        <CardContent>
                            <CardTitle title="Completed" icon={<AssignmentTurnedInRounded />} />
                            <Stack width={"100%"} spacing={"1rem"} sx={{ mt: "1rem", overflowY: "auto", maxHeight: "60vh", display: "inline-block" }}>
                                {(!loading && completed.length === 0) && (
                                    generateNoTasks()
                                )}
                                {loading && (
                                    <>
                                        {generateSkeletons()}
                                    </>
                                )}
                                {!loading && completed.map(task => (
                                    generateTask(task)
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={optionsOpen}
                onClose={handleOptionsClose}
            >
                <MenuItem onClick={handleOptionsClose}>
                    <ListItemIcon>
                        <SwapHorizRounded />
                    </ListItemIcon>
                    <ListItemText primary="Move..." />
                </MenuItem>
                <MenuItem onClick={handleOptionsClose}>
                    <ListItemIcon>
                        <InfoRounded />
                    </ListItemIcon>
                    <ListItemText primary="Task Details" />
                </MenuItem>
                <Divider sx={{ my: "1rem" }} />
                <MenuItem onClick={handleOptionsClose} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                        <CloseRounded sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Hide from Board" />
                </MenuItem>
                <MenuItem onClick={handleOptionsClose} sx={{ color: theme.palette.error.main }}>
                    <ListItemIcon>
                        <DeleteRounded sx={{ color: theme.palette.error.main }} />
                    </ListItemIcon>
                    <ListItemText primary="Delete Task" />
                </MenuItem>
            </Menu>
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>

    )
}