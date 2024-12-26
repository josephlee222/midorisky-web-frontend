import React, { useEffect, useState, useContext } from 'react'
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CardTitle from '../../../components/CardTitle';
import { ForestRounded, MapRounded } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { get } from "aws-amplify/api";
import { enqueueSnackbar } from 'notistack';
import { CategoryContext } from './FarmRoutes';

function ViewFarms() {
    const [farms, setFarms] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState(null)
    const [deleteFarmDialog, setDeleteFarmDialog] = useState(false)
    const [deleteFarm, setDeleteFarm] = useState(null)
    const { setActivePage } = useContext(CategoryContext)
    const navigate = useNavigate()
    titleHelper("View Users")

    const columns = [
        { field: 'name', headerName: 'Name', width: 200, flex: 1 },
        { field: 'plots', headerName: 'Number of Plots', type: 'number', minWidth: 150 },
        {
            field: 'actions', type: 'actions', width: 80, getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit Farm"
                    onClick={() => {
                        navigate("/admin/users/edit/" + params.row.id)
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Farm"
                    onClick={() => {
                        setDeactivateUser(params.row)
                        handleDeleteFarmOpen()
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<MapRounded />}
                    label="View On Map"
                    href={"mailto:" + params.row.email}
                />
            ]
        },
    ];

    const handleDeleteFarmClose = () => {
        setDeleteFarmDialog(false)
    }

    const handleDeleteFarmOpen = () => {
        setDeleteFarmDialog(true)
    }

    const handleDeleteFarm = () => {
        setDeactivateLoading(true)
        http.delete("/Admin/User/" + deactivateUser.id).then((res) => {
            if (res.status === 200) {
                setDeleteLoading(false)
                setDeleteFarmDialog(false)
                handleGetFarms()
            }
        })
    }

    const handleGetFarms = async () => {
        var normal = get({
            apiName: "midori",
            path: "/farms",
        })

        try {
            var res = await normal.response
            var data = await res.body.json()
            setFarms(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load farms", { variant: "error" })
        }
    }

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {
        handleGetFarms()
        setActivePage(0)
    }, [])

    titleHelper("Farms")

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="Farm List" icon={<ForestRounded />} />
                        <DataGrid
                            rows={farms}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            slots={{ toolbar: customToolbar }}
                            sx={{ mt: "1rem" }}
                        />
                    </CardContent>
                </Card>

            </Box>
            <Dialog open={deleteFarmDialog} onClose={handleDeleteFarmClose}>
                <DialogTitle>Delete Farm</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to delete the farm?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteFarmClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deleteLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteFarm}>Delete</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ViewFarms