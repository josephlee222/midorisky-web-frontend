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
import { CategoryContext } from './AdminUsersRoutes';
import CardTitle from '../../../components/CardTitle';
import { Person } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { get } from "aws-amplify/api";
import { enqueueSnackbar } from 'notistack';

function getChipProps(params) {
    return {
        label: params.value,
    };
}

function ViewUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [deactivateLoading, setDeactivateLoading] = useState(null)
    const [deactivateUserDialog, setDeactivateUserDialog] = useState(false)
    const [deactivateUser, setDeactivateUser] = useState(null)
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("View Users")

    const columns = [
        { field: 'username', headerName: 'Username', width: 200 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'E-mail Address', flex: 1, minWidth: 250 },
        {
            field: 'phone_number', headerName: 'Phone Number', minWidth: 200, renderCell: (params) => {
                return params.value ? params.value : "Not Provided"
            }
        },
        { field: 'enabled', headerName: 'Enabled', type: 'boolean', minWidth: 100 },
        {
            field: 'actions', type: 'actions', width: 120, getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit User"
                    onClick={() => {
                        navigate("/admin/users/edit/" + params.row.id)
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Deactivate User"
                    onClick={() => {
                        setDeactivateUser(params.row)
                        handleDeactivateUserDialogOpen()
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EmailIcon />}
                    label="Send E-mail"
                    href={"mailto:" + params.row.email}
                />,
                <GridActionsCellItem
                    icon={<PhoneIcon />}
                    label="Call"
                    href={"tel:" + params.row.phone_number}
                    disabled={!params.row.phone_number}
                />
            ]
        },
    ];

    const handleDeactivateUserDialogClose = () => {
        setDeactivateUserDialog(false)
    }

    const handleDeactivateUserDialogOpen = () => {
        setDeactivateUserDialog(true)
    }

    const handleDeactivateUser = () => {
        setDeactivateLoading(true)
        http.delete("/Admin/User/" + deactivateUser.id).then((res) => {
            if (res.status === 200) {
                setDeactivateLoading(false)
                setDeactivateUserDialog(false)
                handleGetUsers()
            }
        })
    }

    const handleGetUsers = async () => {
        var normal = get({
            apiName: "midori",
            path: "/admin/users",
        })

        try {
            var res = await normal.response
            var data = await res.body.json()
            setUsers(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load users", { variant: "error" })
        }
    }

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {
        setActivePage(0);
        handleGetUsers()
    }, [])

    titleHelper("View Users")
    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="User List" icon={<Person />} />
                        <DataGrid
                            rows={users}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.username}
                            slots={{ toolbar: customToolbar }}
                            sx={{ mt: "1rem" }}
                        />
                    </CardContent>
                </Card>

            </Box>
            <Dialog open={deactivateUserDialog} onClose={handleDeactivateUserDialogClose}>
                <DialogTitle>Deactivate User</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to deactivate this user?
                        <br />
                        User Details:
                        <ul>
                            <li>Username: {deactivateUser?.username}</li>
                            <li>Name: {deactivateUser?.name}</li>
                            <li>E-mail Address: {deactivateUser?.email}</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateUserDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deactivateLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeactivateUser}>Deactivate</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ViewUsers