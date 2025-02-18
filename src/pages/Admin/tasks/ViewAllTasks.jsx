import React, { useEffect, useState, useContext, useRef } from 'react'
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent, Typography, Divider, AppBar, Toolbar, IconButton, Grid2, TextField, useMediaQuery, useTheme, MenuItem } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { AddRounded, CloseRounded, RefreshRounded, UploadFileRounded, VisibilityRounded } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { get, post, del } from "aws-amplify/api";
import { enqueueSnackbar } from 'notistack';
import TaskDialog from '../../../components/TaskDialog';
import { LayoutContext } from '../AdminRoutes';
import { AppContext } from '../../../App';

function ViewAllTasks() {
    const { setContainerWidth } = useContext(LayoutContext);
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryLoading, setCategoryLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState(null)
    const [deleteTaskDialog, setDeleteTaskDialog] = useState(false)
    const [deleteTask, setDeleteTask] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsId, setDetailsId] = useState(null)
    const filepondRef = useRef(null)
    const navigate = useNavigate()
    const theme = useTheme()
    titleHelper("Manage All Tasks")

    const columns = [
        { field: 'title', headerName: 'Task Title', width: 200 },
        { field: 'description', headerName: 'Description', minWidth: 150, flex: 1 },
        { field: 'created_by', headerName: 'Created By', minWidth: 150 },
        { field: 'created_at', headerName: 'Created On', type: 'datetime', minWidth: 150, valueGetter: (value) => new Date(value).toLocaleDateString() },
        {
            field: 'actions', headerName: "Actions", type: 'actions', width: 80, getActions: (params) => [
                <GridActionsCellItem
                    icon={<VisibilityRounded />}
                    label="View Item"
                    onClick={() => {
                        handleDetailsOpen(params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Item"
                    onClick={() => {
                        setDeleteTask(params.row)
                        handleDeleteTaskOpen()
                    }}
                />
            ]
        },
    ];


    const handleDeleteTaskClose = () => {
        setDeleteTaskDialog(false)
    }

    const handleDeleteTaskOpen = () => {
        setDeleteTaskDialog(true)
    }


    const handleNewOpen = () => {
        handleGetCategories()
        setCreateDialogOpen(true)
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleDetailsOpen = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
    }

    const handleOnDelete = () => {
        handleGetTasks()
    }

    const handleDeleteTask = async () => {
        setDeleteLoading(true)
        var itemReq = del({
            apiName: "midori",
            path: "/tasks/" + deleteTask.id,
        })

        try {
            var res = await itemReq.response
            enqueueSnackbar("Item deleted successfully", { variant: "success" })
            setDeleteLoading(false)
            handleDeleteItemClose()
            handleGetItems()
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to delete item", { variant: "error" })
            setDeleteLoading(false)
        }
    }

    const handleGetTasks = async () => {
        setLoading(true)
        var itemReq = get({
            apiName: "midori",
            path: "/tasks/list/all",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setTasks(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load items", { variant: "error" })
            setLoading(false)
        }
    }

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {

        handleGetTasks()
        setContainerWidth("xl")
        // check if param has new
        const urlParams = new URLSearchParams(window.location.search);
        const newParam = urlParams.get('new');
        if (newParam) {
            handleNewOpen()
        }

        
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Box display={{ xs: "none", md: "block" }}>
                    <Typography variant="h4" my={"2rem"} fontWeight={700}>Manage All Tasks</Typography>
                    <Divider sx={{ mb: "1rem" }} />
                </Box>
                <Box display={"flex"}>
                    <Button variant="contained" startIcon={<AddRounded />} onClick={handleNewOpen}>New...</Button>
                    <LoadingButton loadingPosition='start' variant="outlined" startIcon={<RefreshRounded />} onClick={handleGetTasks} loading={loading} sx={{ ml: "1rem" }}>Refresh</LoadingButton>
                </Box>
                <DataGrid
                    rows={tasks}
                    columns={columns}
                    pageSize={10}
                    loading={loading}
                    autoHeight
                    slots={{ toolbar: customToolbar }}
                    sx={{ mt: "1rem" }}
                />
            </Box>
            <Dialog open={deleteTaskDialog} onClose={handleDeleteTaskClose}>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to delete the task?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteTaskClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deleteLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteTask}>Delete</LoadingButton>
                </DialogActions>
            </Dialog>
            <TaskDialog open={detailsDialogOpen} onClose={handleDetailsClose} taskId={detailsId} onDelete={handleOnDelete} onUpdate={handleGetTasks} />
        </>
    )
}

export default ViewAllTasks