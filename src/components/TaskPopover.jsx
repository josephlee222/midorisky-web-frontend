import React, { useEffect, useState } from 'react'
import { Menu, MenuItem, ListItemIcon, Divider, ListItemText, useTheme, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { InfoRounded, CloseRounded, DeleteRounded, SwapHorizRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { del } from 'aws-amplify/api';
import { enqueueSnackbar } from 'notistack';

export default function TaskPopover(props) {
    const navigate = useNavigate()
    const theme = useTheme()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleDeleteClose = () => {
        setDeleteOpen(false)
    }

    const handleDeleteOpen = () => {
        setDeleteOpen(true)
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
                <Divider sx={{ my: "1rem" }} />
                <MenuItem onClick={props.onClose} sx={{ color: theme.palette.error.main }}>
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
        </>

    )
}