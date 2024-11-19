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
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'email', headerName: 'E-mail Address', flex: 1, minWidth: 250 },
        {
            field: 'phoneNumber', headerName: 'Phone Number', minWidth: 200, renderCell: (params) => {
                return params.value ? params.value : "Not Provided"
            }
        },
        {
            field: 'isAdmin', headerName: 'Role', minWidth: 200, renderCell: (params) => {
                return <Chip variant="filled" size="small" icon={<LabelIcon />} {...getChipProps(params)} />;
            },
            valueGetter: (params) => {
                return params.value ? "Admin" : "Customer"
            },
            type: 'singleSelect',
            valueOptions: ["Admin", "Customer"],
        },
        { field: 'isVerified', headerName: 'Active?', type: 'boolean', minWidth: 100 },
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
                    href={"tel:" + params.row.phoneNumber}
                    disabled={params.row.phoneNumber == ''}
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

    const handleGetUsers = () => {
        http.get("/Admin/User").then((res) => {
            if (res.status === 200) {
                setUsers(res.data)
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
        document.title = "UPlay Admin - View Users"
        setActivePage(1)
        handleGetUsers()
    }, [])
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
                            getRowId={(row) => row.email}
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