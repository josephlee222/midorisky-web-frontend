import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Divider, Box, CircularProgress, Dialog, AppBar, Toolbar, useMediaQuery, useTheme, DialogContent, Chip, Grid2 } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { WarningRounded, CloseRounded, MoreVertRounded, FileDownloadOffRounded, PersonRounded, EditRounded, RefreshRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, CheckRounded, AccessTimeRounded, HourglassTopRounded, NewReleasesRounded } from '@mui/icons-material';
import { get } from 'aws-amplify/api';
import UserInfoPopover from './UserInfoPopover';
import TaskPopover from './TaskPopover';

export default function TaskDialog(props) {
    const navigate = useNavigate()
    const [task, setTask] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [UserInfoPopoverOpen, setUserInfoPopoverOpen] = useState(false)
    const [UserInfoPopoverAnchorEl, setUserInfoPopoverAnchorEl] = useState(null)
    const [UserInfoPopoverUserId, setUserInfoPopoverUserId] = useState(null)
    const [TaskPopoverOpen, setTaskPopoverOpen] = useState(false)
    const [TaskPopoverAnchorEl, setTaskPopoverAnchorEl] = useState(null)
    const theme = useTheme()

    const handleGetTask = async (id) => {
        setLoading(true)
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
            setLoading(false)
        } catch (err) {
            console.log(err)
            setError(true)
            setLoading(false)
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
        if (props.open) {
            handleGetTask(props.taskId)
        }
        
    }, [props.taskId])



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
                        {(task && !loading) && (
                            <>
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
                                    onClick={handleOptionsClick}
                                    sx={{ ml: "1rem" }}
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
                            <Button variant="secondary" onClick={handleGetTask} startIcon={<RefreshRounded />}>Retry</Button>
                        </Stack>
                    )}
                    {(!loading && !error && task) && (
                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 8, md: 9 }}>
                                <Typography variant="h5" fontWeight={700}>{task.task.title}</Typography>
                                <Typography fontSize={"0.75rem"} color='grey'>Created on {task.task.created_at}</Typography>
                                <Typography fontSize={"0.75rem"} color='grey'>Last updated on 12/12/2024</Typography>
                                <Divider sx={{ my: "0.5rem" }} />
                                <Box mb={"1rem"}>
                                    <Typography variant="body1" fontWeight={700}>Description</Typography>
                                    <Typography variant="body2">
                                        {task.task.description}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body1" fontWeight={700} mb={"0.5rem"}>Attachment Files</Typography>
                                    {!task.attachments && (
                                        <Stack direction={"column"} spacing={2} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                            <FileDownloadOffRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                            <Typography variant="body1" color="grey">No Attachments</Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                                <Grid2 container spacing={2}>
                                    <Grid2 size={{ xs: 6, sm: 12 }}>
                                        <Typography variant="body1" fontWeight={700}>Priority</Typography>
                                        {task.task.priority === 3 && <Chip icon={<Looks3Rounded />} label="Low" color="info" size='small' />}
                                        {task.task.priority === 2 && <Chip icon={<LooksTwoRounded />} label="Medium" color="warning" size='small' />}
                                        {task.task.priority === 1 && <Chip icon={<LooksOneRounded />} label="High" color="error" size='small' />}
                                    </Grid2>
                                    <Grid2 size={{ xs: 6, sm: 12 }}>
                                        <Typography variant="body1" fontWeight={700}>Task Status</Typography>
                                        {task.task.status === 4 && <Chip icon={<CheckRounded />} label="Completed" color="success" size='small' />}
                                        {task.task.status === 3 && <Chip icon={<AccessTimeRounded />} label="Pending" color="warning" size='small' />}
                                        {task.task.status === 2 && <Chip icon={<HourglassTopRounded />} label="In Progress" color="info" size='small' />}
                                        {task.task.status === 1 && <Chip icon={<NewReleasesRounded />} label="To Do" color="info" size='small' />}
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
                    )}
                </DialogContent>
            </Dialog>
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
            <TaskPopover taskId={props.taskId} open={TaskPopoverOpen} anchorEl={TaskPopoverAnchorEl} onClose={() => setTaskPopoverOpen(false)} />
        </>

    )
}