import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { TextField, Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Skeleton, Dialog, AppBar, Toolbar, DialogContent, useMediaQuery, Input, Grid, Grid2, ButtonBase, CircularProgress } from '@mui/material'
import { LayoutContext } from '../AdminRoutes'
import CardTitle from '../../../components/CardTitle'
import { AddRounded, AssessmentRounded, AssignmentIndRounded, AssignmentLateRounded, AssignmentReturnedRounded, AssignmentReturnRounded, AssignmentRounded, AssignmentTurnedInRounded, CloseRounded, ContentPasteOffRounded, DeleteRounded, EditRounded, FileDownloadOffRounded, GroupRounded, InfoRounded, Looks3Rounded, LooksOneRounded, LooksTwoRounded, MoreVertRounded, PersonRounded, RefreshRounded, SwapHorizRounded, WarningRounded } from '@mui/icons-material'
import titleHelper from '../../../functions/helpers'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { get, post } from 'aws-amplify/api'
import { LoadingButton } from '@mui/lab'
import UserInfoPopover from '../../../components/UserInfoPopover'
import { useFormik } from 'formik'
import * as Yup from "yup";

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
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsId, setDetailsId] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [detailsError, setDetailsError] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const theme = useTheme();
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();

    const handleOptionsClick = (event, id) => {
        setDetailsId(id)
        setAnchorEl(event.currentTarget);
        setOptionsOpen(true)
    };

    const handleNewClick = () => {
        setCreateDialogOpen(true)
    }

    const handleNewClose = () => {
        setCreateDialogOpen(false)
    }

    const handleDetailsClick = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
        handleGetTask(id)
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const createTaskFormik = useFormik({
        initialValues: {
            title: "",
            description: "",
            priority: 3,
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            description: Yup.string().required("Description is required"),
            priority: Yup.number().required("Priority is required"),
        }),
        onSubmit: async (values) => {
            setCreateLoading(true)
            var req = post({
                apiName: "midori",
                path: "/tasks",
                options: {
                    body: {
                        ...values
                    }
                }
            })

            try {
                var res = await req.response
                setCreateLoading(false)
                setCreateDialogOpen(false)
                enqueueSnackbar("Task created successfully!", { variant: "success" })
                handleGetTasks()
            } catch (err) {
                console.log(err)
                setCreateLoading(false)
                enqueueSnackbar("Failed to create task", { variant: "error" })
            }
        }
    })

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
                enqueueSnackbar("Failed to get tasks", { variant: "error" })
                setLoading(false)
            }
        }
    }

    const handleGetTask = async (id) => {
        setDetailsLoading(true)
        setDetailsError(false)
        var req = get({
            apiName: "midori",
            path: "/tasks/" + id,
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            console.log(data)
            setDetailsData(data)
            setDetailsLoading(false)
        } catch (err) {
            console.log(err)
            setDetailsError(true)
            setDetailsLoading(false)
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
                    <Button variant="contained" startIcon={<AddRounded />} onClick={handleNewClick}>New...</Button>
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
                                {loading && generateSkeletons()}
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
                                {loading && generateSkeletons()}
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
                                {loading && generateSkeletons()}
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
                                {loading && generateSkeletons()}
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
                {!detailsDialogOpen && (
                    <MenuItem onClick={() => { handleDetailsClick(detailsId); handleOptionsClose() }}>
                        <ListItemIcon>
                            <InfoRounded />
                        </ListItemIcon>
                        <ListItemText primary="Task Details" />
                    </MenuItem>
                )}
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
            <Dialog
                fullScreen={useMediaQuery(theme.breakpoints.down('md'))}
                open={createDialogOpen}
                onClose={handleNewClose}
                maxWidth="md"
                fullWidth
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleNewClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Create Task
                        </Typography>
                        <LoadingButton autoFocus color="inherit" onClick={createTaskFormik.handleSubmit} loading={createLoading} loadingPosition='start' startIcon={<AddRounded />}>
                            Create
                        </LoadingButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Title"
                                variant="outlined"
                                value={createTaskFormik.values.title}
                                onChange={createTaskFormik.handleChange}
                                error={createTaskFormik.touched.title && Boolean(createTaskFormik.errors.title)}
                                helperText={createTaskFormik.touched.title && createTaskFormik.errors.title}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                fullWidth
                                id="priority"
                                name="priority"
                                label="Task Priority"
                                value={createTaskFormik.values.priority}
                                onChange={createTaskFormik.handleChange}
                                error={createTaskFormik.touched.priority && Boolean(createTaskFormik.errors.priority)}
                                helperText={createTaskFormik.touched.priority && createTaskFormik.errors.priority}
                            >
                                <MenuItem value="1">High</MenuItem>
                                <MenuItem value="2">Medium</MenuItem>
                                <MenuItem value="3">Low</MenuItem>
                            </TextField>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={7}
                                id="description"
                                name="description"
                                label="Description"
                                variant="outlined"
                                value={createTaskFormik.values.description}
                                onChange={createTaskFormik.handleChange}
                                error={createTaskFormik.touched.description && Boolean(createTaskFormik.errors.description)}
                                helperText={createTaskFormik.touched.description && createTaskFormik.errors.description}
                            />
                        </Grid2>
                    </Grid2>
                </DialogContent>
            </Dialog>
            <Dialog
                fullScreen={useMediaQuery(theme.breakpoints.down('md'))}
                open={detailsDialogOpen}
                onClose={handleDetailsClose}
                maxWidth="md"
                fullWidth
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleDetailsClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Task Details
                        </Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            aria-label="Edit Task"
                        >
                            <EditRounded />
                        </IconButton>
                        <IconButton
                            edge="end"
                            color="inherit"
                            aria-label="More Options"
                            onClick={(e) => { handleOptionsClick(e, detailsId) }}
                            sx={{ ml: "1rem" }}
                        >
                            <MoreVertRounded />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    {detailsLoading && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <CircularProgress />
                            <Typography variant="body1" color="grey">Loading task details...</Typography>
                        </Stack>
                    )}
                    {(!detailsLoading && detailsError) && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <WarningRounded sx={{ height: "48px", width: "48px", color: "grey" }} />
                            <Typography variant="body1" color="grey">Failed to get task</Typography>
                            <Button variant="secondary" onClick={handleGetTask} startIcon={<RefreshRounded />}>Retry</Button>
                        </Stack>
                    )}
                    {(!detailsLoading && !detailsError && detailsData) && (
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 9 }}>
                                <Typography variant="h5" fontWeight={700}>{detailsData.task.title}</Typography>
                                <Typography fontSize={"0.75rem"} color='grey'>Created on {detailsData.task.created_at}</Typography>
                                <Typography fontSize={"0.75rem"} color='grey'>Last updated on 12/12/2024</Typography>
                                <Divider sx={{ my: "0.5rem" }} />
                                <Box mb={"1rem"}>
                                    <Typography variant="body1" fontWeight={700}>Description</Typography>
                                    <Typography variant="body2">
                                        {detailsData.task.description}
                                    </Typography>
                                </Box>
                                <Box mb={"1rem"}>
                                    <Typography variant="body1" fontWeight={700}>Attachment Files</Typography>
                                    {!detailsData.attachments && (
                                        <Stack direction={"column"} spacing={2} my={"2rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                                            <FileDownloadOffRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                            <Typography variant="body1" color="grey">No Attachments</Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 3 }}>
                                <Stack direction={{ xs: "row", sm: "column" }} spacing={2}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Priority</Typography>
                                        {detailsData.task.priority === 3 && <Chip icon={<Looks3Rounded />} label="Low" color="info" size='small' />}
                                        {detailsData.task.priority === 2 && <Chip icon={<LooksTwoRounded />} label="Medium" color="warning" size='small' />}
                                        {detailsData.task.priority === 1 && <Chip icon={<LooksOneRounded />} label="High" color="error" size='small' />}
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Created By</Typography>
                                        <Chip icon={<PersonRounded />} label={detailsData.task.created_by} size='small' onClick={(e) => { handleShowUserInformation(e, detailsData.task.created_by) }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>Assigned To</Typography>
                                        <Stack direction={"column"} spacing={1} alignItems={"flex-start"}>
                                            {detailsData.assignees.length === 0 && <Chip icon={<WarningRounded />} label="No Assignees" size='small' color='warning' />}
                                            {detailsData.assignees.map(user => (
                                                <Chip icon={<PersonRounded />} label={user.username} size='small' onClick={(e) => { handleShowUserInformation(e, user.username) }} />
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid2>
                        </Grid2>
                    )}
                </DialogContent>
            </Dialog>
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>

    )
}