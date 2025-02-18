import { useContext, useEffect, useState, useRef } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { TextField, Box, Button, Card, CardContent, Chip, IconButton, Stack, Typography, useTheme, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Skeleton, Dialog, AppBar, Toolbar, DialogContent, useMediaQuery, Input, Grid, Grid2, ButtonBase, CircularProgress, ButtonGroup } from '@mui/material'
import { LayoutContext } from '../AdminRoutes'
import CardTitle from '../../../components/CardTitle'
import { AccessTimeRounded, AddRounded, AssessmentRounded, AssignmentIndRounded, AssignmentLateRounded, AssignmentReturnedRounded, AssignmentReturnRounded, AssignmentRounded, AssignmentTurnedInRounded, CheckRounded, CloseRounded, ContentPasteOffRounded, DeleteRounded, EditRounded, FileDownloadOffRounded, GroupRounded, HourglassTopRounded, InfoRounded, Looks3Rounded, LooksOneRounded, LooksTwoRounded, MoreVertRounded, NewReleasesRounded, PersonRounded, RefreshRounded, SwapHorizRounded, UploadFileRounded, WarningRounded } from '@mui/icons-material'
import titleHelper from '../../../functions/helpers'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { get, post } from 'aws-amplify/api'
import { LoadingButton } from '@mui/lab'
import UserInfoPopover from '../../../components/UserInfoPopover'
import { useFormik } from 'formik'
import * as Yup from "yup";
import TaskDialog from '../../../components/TaskDialog'
import TaskPopover from '../../../components/TaskPopover'
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { AppContext } from '../../../App'

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
    const [detailsId, setDetailsId] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);
    const [filepondToken, setFilepondToken] = useState(null)
    const [newTaskFiles, setNewTaskFiles] = useState([])
    const [filepondUrl, setFilepondUrl] = useState(null)
    const [assigned, setAssigned] = useState(props.assigned)
    const filepondRef = useRef(null)
    const theme = useTheme();
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();
    const { userRoles } = useContext(AppContext);
    const [isFarmManager, setIsFarmManager] = useState(false);

    registerPlugin(FilePondPluginImagePreview);
    registerPlugin(FilePondPluginFileValidateType);

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
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleOnDelete = () => {
        setOptionsOpen(false)
        setDetailsDialogOpen(false)
        handleGetTasks(props.assigned)
    }

    const handleOnHide = () => {
        setOptionsOpen(false)
        setDetailsDialogOpen(false)
        handleGetTasks()
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
                var data = await res.body.json()
                // upload images using filepond via API env (/admin/items/{id}/attachments)
                setFilepondUrl(import.meta.env.VITE_API_URL + "/tasks/" + data.id + "/attachments")
                filepondRef.current.processFiles().then(() => {
                    console.log("Files processed")
                    enqueueSnackbar("Task created successfully!", { variant: "success" })
                    resetStuff()
                }).catch((err) => {
                    console.log(err)
                    enqueueSnackbar("Created task but failed to upload images.", { variant: "warning" })
                    resetStuff()
                })

                function resetStuff() {
                    createTaskFormik.resetForm()
                    setNewTaskFiles([])
                    setCreateDialogOpen(false)
                    setCreateLoading(false)
                    handleGetTasks(props.assigned)
                }
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
                    <Typography mt={"0.5rem"} fontSize={"0.75rem"} color='grey'>Created on {
                        new Date(task.created_at).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        })
                    }</Typography>
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

    const handleGetTasks = async (assigned = false) => {
        // Fetch all tasks
        setLoading(true)
        if (assigned) {
            // Fetch only my tasks
            var req = get({
                apiName: "midori",
                path: "/tasks/list/my",
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

    const changeMode = () => {
        setAssigned(!assigned)
        navigate(assigned ? "/staff/tasks" : "/staff/tasks/my")
        handleGetTasks(!assigned)
    }

    useEffect(() => {
        setContainerWidth(false)
        handleGetTasks(props.assigned)
        setFilepondToken(localStorage.getItem("token"))
    }, [])

    useEffect(() => {
        if (userRoles.includes("FarmManager") || userRoles.includes("Admin")) {
            setIsFarmManager(true)
        }
    }, [userRoles])


    titleHelper("Task Board")

    return (
        <>
            <Box my={"1rem"}>
                <Typography display={{ xs: "none", md: "flex" }} variant="h4" fontWeight={700} my={"2rem"}>
                    {props.assigned ? "My Tasks" : "All Tasks"}
                </Typography>
                <ButtonGroup size='small' sx={{ mb: "1rem" }}>
                    {isFarmManager &&
                        <>
                            <Button variant="contained" startIcon={<AddRounded />} onClick={handleNewClick}>New...</Button>
                            <Button variant="secondary" startIcon={<AssignmentIndRounded />} onClick={changeMode}>
                                {!props.assigned ? "My Tasks" : "All Tasks"}
                            </Button>
                        </>
                    }
                    <LoadingButton variant="secondary" startIcon={<RefreshRounded />} onClick={
                        () => { handleGetTasks(props.assigned) }
                    } loading={loading} loadingPosition='start'>Refresh</LoadingButton>
                </ButtonGroup>
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
                        <Grid2 size={{ xs: 12 }}>
                            <Divider />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <CardTitle title="Upload Images" icon={<UploadFileRounded />} />
                            <Typography variant="body2" color="textSecondary" mb={"1rem"}>Upload up to 5 PDF or images</Typography>
                            <FilePond
                                ref={filepondRef}
                                files={newTaskFiles}
                                allowMultiple={true}
                                maxFiles={3}
                                onupdatefiles={(fileItems) => {
                                    setNewTaskFiles(fileItems.map((fileItem) => fileItem.file));
                                }}
                                credits={false}
                                instantUpload={false}
                                allowRevert={false}
                                allowProcess={false}
                                allowReplace={false}
                                allowReorder={true}
                                acceptedFileTypes={['image/*']}
                                disabled={createLoading}
                                imagePreviewMaxHeight={200}
                                server={{
                                    url: filepondUrl,
                                    process: {
                                        method: 'POST',
                                        headers: {
                                            Authorization: filepondToken
                                        },
                                    },
                                }}
                            ></FilePond>
                        </Grid2>
                    </Grid2>
                </DialogContent>
            </Dialog>
            <TaskDialog open={detailsDialogOpen} onClose={handleDetailsClose} taskId={detailsId} onDelete={handleOnDelete} onHide={handleOnHide} onUpdate={() => { handleGetTasks(props.assigned) }} farmerMode={props.assigned} />
            <TaskPopover open={optionsOpen} anchorEl={anchorEl} onClose={handleOptionsClose} onTaskDetailsClick={() => { handleDetailsClick(detailsId); handleOptionsClose() }} onDelete={handleOnDelete} onHide={handleOnHide} onStatusChange={handleOnDelete} taskId={detailsId} />
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>
    )
}