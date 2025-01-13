import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Divider, Box, CircularProgress, Dialog, AppBar, Toolbar, useMediaQuery, useTheme, DialogContent, Chip, Grid2, TextField, MenuItem, Alert, ButtonBase, Card, CardContent } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { WarningRounded, CloseRounded, MoreVertRounded, FileDownloadOffRounded, PersonRounded, EditRounded, RefreshRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, CheckRounded, AccessTimeRounded, HourglassTopRounded, NewReleasesRounded, SaveRounded, EditOffRounded, UploadFileRounded, InsertDriveFileRounded, DownloadRounded, DeleteRounded } from '@mui/icons-material';
import { get, put } from 'aws-amplify/api';
import UserInfoPopover from './UserInfoPopover';
import TaskPopover from './TaskPopover';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';

export default function TaskDialog(props) {
    const navigate = useNavigate()
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [attachments, setAttachments] = useState([])
    const [attachmentLoading, setAttachmentLoading] = useState(true)
    const [attachmentError, setAttachmentError] = useState(false)
    const [error, setError] = useState(false)
    const [UserInfoPopoverOpen, setUserInfoPopoverOpen] = useState(false)
    const [UserInfoPopoverAnchorEl, setUserInfoPopoverAnchorEl] = useState(null)
    const [UserInfoPopoverUserId, setUserInfoPopoverUserId] = useState(null)
    const [TaskPopoverOpen, setTaskPopoverOpen] = useState(false)
    const [TaskPopoverAnchorEl, setTaskPopoverAnchorEl] = useState(null)
    const [editLoading, setEditLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loadingUploadAttachment, setLoadingUploadAttachment] = useState(false)
    const theme = useTheme()
    const api_url = import.meta.env.VITE_API_URL

    const editFormik = useFormik({
        initialValues: {
            title: task ? task.task.title : "",
            description: task ? task.task.description : "",
            priority: task ? task.task.priority : 1,
            status: task ? task.task.status : 1
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            description: Yup.string().required("Description is required"),
            priority: Yup.number().required("Priority is required"),
            status: Yup.number().required("Status is required")
        }),
        onSubmit: async (values) => {
            if (values.title != task.task.title || values.description != task.task.description || values.priority != task.task.priority || values.status != task.task.status) {
                // Perform update
                setEditLoading(true)

                var data = {
                    title: values.title,
                    description: values.description,
                    priority: values.priority,
                    status: values.status
                }

                var req = put({
                    apiName: "midori",
                    path: "/tasks/" + props.taskId,
                    options: {
                        body: {
                            ...data
                        }
                    }
                })

                try {
                    var res = await req.response
                    setEditLoading(false)
                    setEditMode(false)
                    handleGetTask(props.taskId)

                    // Call onUpdate function if it exists
                    if (props.onUpdate) {
                        props.onUpdate()
                    }
                } catch (err) {
                    console.log(err)
                    enqueueSnackbar("Failed to update task", { variant: "error" })
                    setEditLoading(false)
                }
            } else {
                setEditMode(false)
            }
        }
    })

    const handleGetTask = async (id) => {
        editMode && setEditMode(false)
        setLoading(true)
        handleGetAttachments(id)
        setError(false)
        var req = get({
            apiName: "midori",
            path: "/tasks/" + id,
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            console.log(data)
            setTask(data)
            editFormik.setValues({
                title: data.task.title,
                description: data.task.description,
                priority: data.task.priority,
                status: data.task.status
            })
            setLoading(false)
        } catch (err) {
            console.log(err)
            setError(true)
            setLoading(false)
        }
    }

     const handleGetAttachments = async (id) => {
        setAttachmentLoading(true)
        var attachmentsReq = get({
            apiName: "midori",
            path: "/tasks/" + id + "/attachments",
        })

        try {
            var attachmentsRes = await attachmentsReq.response
            var attachmentsData = await attachmentsRes.body.json()
            setAttachments(attachmentsData)
            setAttachmentLoading(false)
        } catch (err) {
            console.log(err)
            setAttachmentError(true)
            setAttachmentLoading(false)
        }
    }

    const handleShowUserInformation = (e, userId) => {
        setUserInfoPopoverUserId(userId)
        setUserInfoPopoverAnchorEl(e.currentTarget)
        setUserInfoPopoverOpen(true)
    }

    const handleOptionsClick = (e) => {
        setTaskPopoverAnchorEl(e.currentTarget)
        setTaskPopoverOpen(true)
    }

    useEffect(() => {
        if (props.open && props.taskId) {
            handleGetTask(props.taskId)
        }

    }, [props.open])

    const handleUploadAttachment = (e) => {
        setLoadingPicture(true);
        console.log(e);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        http.post("/user/Upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => {
            if (res.status === 200) {
                enqueueSnackbar("Profile picture updated successfully!", { variant: "success" });
                setUser(res.data);
                setLoadingPicture(false);
                handleChangePictureDialogClose();
            } else {
                enqueueSnackbar("Profile picture update failed!", { variant: "error" });
                setLoadingPicture(false);
                handleChangePictureDialogClose();
            }
        }).catch((err) => {
            enqueueSnackbar("Profile picture update failed! " + err.response.data.message, { variant: "error" });
            setLoadingPicture(false);
            handleChangePictureDialogClose();
        })
    }


    return (
        <>
            <Dialog
                fullScreen={useMediaQuery(theme.breakpoints.down('md'))}
                open={props.open}
                onClose={props.onClose}
                maxWidth="md"
                fullWidth
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={props.onClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Task Details
                        </Typography>
                        {(task && !loading && !error && !editMode) && (
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="Edit Task"
                                onClick={() => setEditMode(true)}
                                sx={{ mr: ".5rem" }}
                            >
                                <EditRounded />
                            </IconButton>
                        )}
                        {(task && !loading && !error && editMode) && (
                            <>
                                <LoadingButton
                                    color="inherit"
                                    onClick={editFormik.handleSubmit}
                                    loading={editLoading}
                                    startIcon={<SaveRounded />}
                                    loadingPosition='start'
                                >
                                    Save
                                </LoadingButton>
                                <Button
                                    color="inherit"
                                    onClick={() => setEditMode(false)}
                                    startIcon={<EditOffRounded />}
                                    sx={{ ml: ".5rem" }}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                        {(task && !loading && !error) && (
                            <>
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    aria-label="More Options"
                                    onClick={handleOptionsClick}
                                >
                                    <MoreVertRounded />
                                </IconButton>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    {loading && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <CircularProgress />
                            <Typography variant="body1" color="grey">Loading task details...</Typography>
                        </Stack>
                    )}
                    {(!loading && error) && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <WarningRounded sx={{ height: "48px", width: "48px", color: "grey" }} />
                            <Typography variant="body1" color="grey">Failed to get task</Typography>
                            <Button variant="secondary" onClick={() => { handleGetTask(props.taskId) }} startIcon={<RefreshRounded />}>Retry</Button>
                        </Stack>
                    )}
                    {(!loading && !error && task) && (
                        <>
                            {(editMode) && (
                                <Alert severity="info" sx={{ mb: "1rem" }}>You are in edit mode. Make sure to save your changes.</Alert>
                            )}
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 8, md: 9 }}>
                                    {editMode && (
                                        <>
                                            <Typography variant="body1" fontWeight={700}>Task Title</Typography>
                                            <TextField
                                                fullWidth
                                                id="title"
                                                name="title"
                                                hiddenLabel
                                                value={editFormik.values.title}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.title && Boolean(editFormik.errors.title)}
                                                helperText={editFormik.touched.title && editFormik.errors.title}
                                                sx={{ mb: "0.5rem" }}
                                                size='small'
                                            />
                                        </>
                                    )}
                                    {!editMode && (
                                        <Typography variant="h5" fontWeight={700}>{task.task.title}</Typography>
                                    )}
                                    <Typography fontSize={"0.75rem"} color='grey'>Created on {task.task.created_at}</Typography>
                                    <Typography fontSize={"0.75rem"} color='grey'>Last updated on 12/12/2024</Typography>
                                    <Divider sx={{ my: "0.5rem" }} />
                                    <Box mb={"1rem"}>
                                        <Typography variant="body1" fontWeight={700}>Description</Typography>
                                        {editMode && (
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={5}
                                                id="description"
                                                name="description"
                                                hiddenLabel
                                                value={editFormik.values.description}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.description && Boolean(editFormik.errors.description)}
                                                helperText={editFormik.touched.description && editFormik.errors.description}
                                                sx={{ mb: "0.5rem" }}
                                                size='small'
                                            />
                                        )}
                                        {!editMode && (
                                            <>

                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {task.task.description}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700} mb={"0.5rem"}>Task Attachments</Typography>
                                        {((!attachments || attachments.length == 0) && !attachmentLoading && !attachmentError) && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <FileDownloadOffRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">No Attachments</Typography>
                                            </Stack>
                                        )}
                                        {(!attachmentLoading && attachmentError) && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <WarningRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">Error loading attachments</Typography>
                                                <Button variant="secondary" onClick={() => { handleGetAttachments(props.taskId) }} startIcon={<RefreshRounded />}>Retry</Button>
                                            </Stack>
                                        )}
                                        {attachmentLoading && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <CircularProgress />
                                                <Typography variant="body1" color="grey">Loading attachments...</Typography>
                                            </Stack>
                                        )}
                                        <Grid2 container spacing={1}>
                                            {(attachments && !attachmentLoading) && attachments.map(attachment => (
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <Card variant='outlined'>
                                                        <CardContent>
                                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                <InsertDriveFileRounded sx={{ color: "grey", mr: "0.5rem" }} />
                                                                <Box overflow={"hidden"}>
                                                                    <Typography variant="body1" fontWeight={700} sx={{ textOverflow: "ellipsis", width: "100%" }} noWrap>
                                                                        {attachment}
                                                                    </Typography>
                                                                    <Typography variant="body2">.{attachment.split(".").at(-1)} format</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Stack direction={"row"} spacing={1} mt={"1rem"}>
                                                                <IconButton color={theme.palette.primary.main} size='small' LinkComponent={Link} to={api_url + "/tasks/" + props.taskId + "/attachments/" + attachment} target="_blank">
                                                                    <DownloadRounded />
                                                                </IconButton>
                                                                <IconButton color={theme.palette.primary.main} size='small'>
                                                                    <DeleteRounded />
                                                                </IconButton>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Grid2>
                                            )
                                            )}
                                        </Grid2>
                                        <LoadingButton loading={attachmentLoading} component="label" variant="secondary" startIcon={<UploadFileRounded />} fullWidth size='small' sx={{ mt: "0.5rem" }}>Upload Attachment<input type='file' onChange={handleUploadAttachment} hidden /></LoadingButton>
                                    </Box>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ xs: 6, sm: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Priority</Typography>
                                            {editMode && (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    id="priority"
                                                    name="priority"
                                                    hiddenLabel
                                                    value={editFormik.values.priority}
                                                    onChange={editFormik.handleChange}
                                                    error={editFormik.touched.priority && Boolean(editFormik.errors.priority)}
                                                    helperText={editFormik.touched.priority && editFormik.errors.priority}
                                                    size='small'

                                                >
                                                    <MenuItem value="1">High</MenuItem>
                                                    <MenuItem value="2">Medium</MenuItem>
                                                    <MenuItem value="3">Low</MenuItem>
                                                </TextField>
                                            )}
                                            {!editMode && (
                                                <>
                                                    {task.task.priority === 3 && <Chip icon={<Looks3Rounded />} label="Low" color="info" size='small' />}
                                                    {task.task.priority === 2 && <Chip icon={<LooksTwoRounded />} label="Medium" color="warning" size='small' />}
                                                    {task.task.priority === 1 && <Chip icon={<LooksOneRounded />} label="High" color="error" size='small' />}
                                                </>
                                            )}

                                        </Grid2>
                                        <Grid2 size={{ xs: 6, sm: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Task Status</Typography>
                                            {editMode && (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    id="status"
                                                    name="status"
                                                    hiddenLabel
                                                    value={editFormik.values.status}
                                                    onChange={editFormik.handleChange}
                                                    error={editFormik.touched.status && Boolean(editFormik.errors.status)}
                                                    helperText={editFormik.touched.status && editFormik.errors.status}
                                                    size='small'
                                                >
                                                    <MenuItem value="1">To Do</MenuItem>
                                                    <MenuItem value="2">In Progress</MenuItem>
                                                    <MenuItem value="3">Pending</MenuItem>
                                                    <MenuItem value="4">Completed</MenuItem>
                                                </TextField>
                                            )}
                                            {!editMode && (
                                                <>
                                                    {task.task.status === 4 && <Chip icon={<CheckRounded />} label="Completed" color="success" size='small' />}
                                                    {task.task.status === 3 && <Chip icon={<AccessTimeRounded />} label="Pending" color="warning" size='small' />}
                                                    {task.task.status === 2 && <Chip icon={<HourglassTopRounded />} label="In Progress" color="info" size='small' />}
                                                    {task.task.status === 1 && <Chip icon={<NewReleasesRounded />} label="To Do" color="info" size='small' />}
                                                </>
                                            )}
                                        </Grid2>
                                        <Grid2 size={{ xs: 6, sm: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Assigned To</Typography>
                                            <Stack direction={"column"} spacing={1} alignItems={"flex-start"}>
                                                {task.assignees.length === 0 && <Chip icon={<WarningRounded />} label="No Assignees" size='small' color='warning' />}
                                                {task.assignees.map(user => (
                                                    <Chip icon={<PersonRounded />} label={user.username} size='small' onClick={(e) => { handleShowUserInformation(e, user.username) }} />
                                                ))}
                                            </Stack>
                                        </Grid2>
                                        <Grid2 size={{ xs: 6, sm: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Created By</Typography>
                                            <Chip icon={<PersonRounded />} label={task.task.created_by} size='small' onClick={(e) => { handleShowUserInformation(e, task.task.created_by) }} />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
            <TaskPopover taskId={props.taskId} open={TaskPopoverOpen} anchorEl={TaskPopoverAnchorEl} onClose={() => setTaskPopoverOpen(false)} onDelete={props.onDelete} />
        </>

    )
}