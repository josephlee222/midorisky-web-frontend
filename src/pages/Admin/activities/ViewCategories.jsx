import React, { useEffect, useState, useContext } from 'react'
import { Chip, Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { CategoryContext } from './AdminActivitiesRoutes';
import CardTitle from '../../../components/CardTitle';
import { BackpackRounded, CategoryRounded, EditCalendarRounded, Person } from '@mui/icons-material';
import moment from 'moment';
import titleHelper from '../../../functions/helpers';
import { useSnackbar } from 'notistack'

function getChipProps(params) {
    return {
        label: params.value,
    };
}



function ViewCategories() {
    const [Categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [deactivateLoading, setDeactivateLoading] = useState(null)
    const [deactivateActivityDialog, setDeactivateActivityDialog] = useState(false)
    const [deactivateActivity, setDeactivateActivity] = useState(null)
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    const { enqueueSnackbar } = useSnackbar();
    titleHelper("View Categories")
    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },

        ,

        {
            field: 'actions', type: 'actions', width: 40, getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit Category"
                    onClick={() => {
                        navigate("/admin/activities/categories/" + params.row.id)
                    }}
                    showInMenu
                />,
                
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Category"
                    onClick={() => {
                        setDeactivateActivity(params.row)
                        handleDeactivateActivityDialogOpen()
                    }}
                    showInMenu
                />,
            ]
        },
    ];

    const handleDeactivateActivityDialogClose = () => {
        setDeactivateActivityDialog(false)
    }

    const handleDeactivateActivityDialogOpen = () => {
        setDeactivateActivityDialog(true)
    }

    const handleDeactivateActivity = () => {
        setDeactivateLoading(true)
        http.delete("/Admin/Category/" + deactivateActivity.id).then((res) => {
            if (res.status === 200) {
                setDeactivateLoading(false)
                setDeactivateActivityDialog(false)
                handleGetCategories()
                enqueueSnackbar("Activity deleted successfully!", { variant: "success" });
            }
        })
    }

    const handleGetCategories = () => {
        http.get("/Admin/Category/").then((res) => {
            if (res.status === 200) {
                setCategories(res.data)
                setLoading(false)
            }
        })
    }

   

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {
        setActivePage(3)
        handleGetCategories()
    }, [])
    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="Category List" icon={<CategoryRounded />} />
                        <DataGrid
                            rows={Categories}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.name}
                            slots={{ toolbar: customToolbar }}
                            sx={{ mt: "1rem" }}
                        />
                    </CardContent>
                </Card>

            </Box>
            <Dialog open={deactivateActivityDialog} onClose={handleDeactivateActivityDialogClose}>
                <DialogTitle>Deactivate Activity</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to deactivate this Activity?
                        <br />
                        Activity Details:
                        <ul>
                            <li>Name: {deactivateActivity?.name}</li>
                            <li>Category: {deactivateActivity?.description}</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateActivityDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deactivateLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeactivateActivity}>Deactivate</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ViewCategories