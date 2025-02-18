import React, { useEffect, useState, useContext } from 'react'
import { Menu, MenuItem, ListItemIcon, Divider, ListItemText, useTheme, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { InfoRounded, CloseRounded, DeleteRounded, SwapHorizRounded, CheckRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { del, get } from 'aws-amplify/api';
import { enqueueSnackbar } from 'notistack';
import { AppContext } from '../App';

export default function TaskPopover(props) {
    const navigate = useNavigate()
    const theme = useTheme()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [hideOpen, setHideOpen] = useState(false)
    const [hideLoading, setHideLoading] = useState(false)
    const { userRoles } = useContext(AppContext);
    const [isFarmManager, setIsFarmManager] = useState(false);

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
                <MenuItem onClick={props.onClose}>
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
        </>

    )
}