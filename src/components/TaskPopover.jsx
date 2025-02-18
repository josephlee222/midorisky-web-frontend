import React, { useEffect, useState, useContext } from 'react'
import { Menu, MenuItem, ListItemIcon, Divider, ListItemText, useTheme, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions, Button, TextField, Box, CircularProgress } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { InfoRounded, CloseRounded, DeleteRounded, SwapHorizRounded, CheckRounded, EditRoad, EditRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { del, get, put } from 'aws-amplify/api';
import { enqueueSnackbar } from 'notistack';
import { AppContext } from '../App';
import { useFormik } from 'formik';
import * as Yup from "yup";

export default function TaskPopover(props) {
    const navigate = useNavigate()
    const theme = useTheme()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [hideOpen, setHideOpen] = useState(false)
    const [hideLoading, setHideLoading] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)
    const [task, setTask] = useState(null)
    const { userRoles } = useContext(AppContext);
    const [isFarmManager, setIsFarmManager] = useState(false);


    const editFormik = useFormik({
        initialValues: {
            status: 1
        },
        validationSchema: Yup.object({
            status: Yup.string().required("Status is required")
        }),
        onSubmit: async (data) => {
            setStatusLoading(true)
            var req = put({
                apiName: "midori",
                path: "/tasks/" + props.taskId + "/status",
                options: {
                    body: {
                        status: data.status
                    }
                }
            })

            try {
                var res = await req.response
                setStatusLoading(false)
                setStatusDialogOpen(false)
                
                props.onStatusChange()
            } catch (err) {
                setStatusLoading(false)
                setStatusDialogOpen(false)
                enqueueSnackbar("Failed to change task status", { variant: "error" })

            }

        }
    })

    const handleDeleteClose = () => {
        setDeleteOpen(false)
    }

    const handleDeleteOpen = () => {
        setDeleteOpen(true)
        props.onClose()
    }

    const handleHideClose = () => {
        setHideOpen(false)
    }

    const handleHideOpen = () => {
        setHideOpen(true)
        props.onClose()
    }

    const handleStatusDialogClose = () => {
        setStatusDialogOpen(false)
    }

    const handleStatusDialogOpen = () => {
        setStatusDialogOpen(true)
        handleGetTask(props.taskId)
        props.onClose()
    }

    const handleGetTask = async (id) => {
        setStatusLoading(true)
        var req = get({
            apiName: "midori",
            path: "/tasks/" + id,
        })

        try {
            var res = await req.response
            var data = await res.body.json()

            editFormik.setValues({
                status: data.task.status
            })
            setTask(data.task)
            setStatusLoading(false)
        } catch (err) {
            console.log(err)
            setStatusLoading(false)
        }
    }

    const handleDeleteTask = async () => {
        setDeleteLoading(true)
        var deleteTask = del({
            apiName: "midori",
            path: "/tasks/" + props.taskId,
        })

        try {
            var res = await deleteTask.response
            setDeleteLoading(false)
            setDeleteOpen(false)
            props.onDelete()
        } catch (err) {
            setDeleteLoading(false)
            setDeleteOpen(false)
            console.log(err)
            enqueueSnackbar("Failed to delete task", { variant: "error" })
        }
    }

    const handleHideTask = async () => {
        setHideLoading(true)
        var hideTask = get({
            apiName: "midori",
            path: "/tasks/" + props.taskId + "/hide",
        })

        try {
            var res = await hideTask.response
            setHideLoading(false)
            setHideOpen(false)
            props.onHide()
        } catch (err) {
            setHideLoading(false)
            setHideOpen(false)
            console.log(err)
            enqueueSnackbar("Failed to hide task", { variant: "error" })
        }
    }

    useEffect(() => {
        if (userRoles.includes("FarmManager") || userRoles.includes("Admin")) {
            setIsFarmManager(true)
        }
    }, [userRoles])


    return (
        <>
            <Menu
                id="basic-menu"
                anchorEl={props.anchorEl}
                open={props.open}
                onClose={props.onClose}
            >
                <MenuItem onClick={handleStatusDialogOpen}>
                    <ListItemIcon>
                        <SwapHorizRounded />
                    </ListItemIcon>
                    <ListItemText primary="Move..." />
                </MenuItem>
                {props.onTaskDetailsClick && (
                    <MenuItem onClick={props.onTaskDetailsClick}>
                        <ListItemIcon>
                            <InfoRounded />
                        </ListItemIcon>
                        <ListItemText primary="Task Details" />
                    </MenuItem>
                )}

                {isFarmManager && (
                    <>
                        <Divider sx={{ my: "1rem" }} />
                        <MenuItem onClick={handleHideOpen} sx={{ color: theme.palette.error.main }}>
                            <ListItemIcon>
                                <CloseRounded sx={{ color: theme.palette.error.main }} />
                            </ListItemIcon>
                            <ListItemText primary="Hide from Board" />
                        </MenuItem>
                        <MenuItem onClick={handleDeleteOpen} sx={{ color: theme.palette.error.main }}>
                            <ListItemIcon>
                                <DeleteRounded sx={{ color: theme.palette.error.main }} />
                            </ListItemIcon>
                            <ListItemText primary="Delete Task" />
                        </MenuItem>
                    </>
                )}
            </Menu>
            <Dialog open={deleteOpen} onClose={handleDeleteClose}>
                <DialogTitle>Delete Task?</DialogTitle>
                <DialogContent>

                    <DialogContentText>
                        Are you sure you want to delete this task?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deleteLoading} variant="text" color="error" startIcon={<DeleteRounded />} onClick={handleDeleteTask}>Delete Task</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={hideOpen} onClose={handleHideClose}>
                <DialogTitle>Hide Task?</DialogTitle>
                <DialogContent>

                    <DialogContentText>
                        Are you sure you want to hide this task?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleHideClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={hideLoading} variant="text" color="error" startIcon={<CheckRounded />} onClick={handleHideTask}>Hide Task</LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Change Task Status</DialogTitle>
                <DialogContent>
                    {statusLoading && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: "1rem" }} >
                            <CircularProgress />
                        </Box>
                    )}

                    {(!statusLoading) && (
                        <>
                            <DialogContentText mb={"0.5rem"}>
                                Change the status of the task of {task && task.title}
                            </DialogContentText>
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
                        </>

                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStatusDialogClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={statusLoading} variant="text" startIcon={<EditRounded />} onClick={editFormik.handleSubmit}>Change</LoadingButton>
                </DialogActions>
            </Dialog>
        </>

    )
}