import React, { useEffect, useState, useContext } from 'react'
import { Chip, Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent, TextField } from '@mui/material'
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
import { CategoryContext } from './AdminGroupsRoutes';
import CardTitle from '../../../components/CardTitle';
import { AddRounded, CloseRounded, EditRounded, Person } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as Yup from "yup";

function getChipProps(params) {
    return {
        label: params.value,
    };
}

function ViewGroups() {
    const [groups, setGroups] = useState([])
    const [editGroupDialog, setEditGroupDialog] = useState(false)
    const [editGroup, setEditGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deactivateLoading, setDeactivateLoading] = useState(null)
    const [deactivateUserDialog, setDeactivateUserDialog] = useState(false)
    const [deactivateUser, setDeactivateUser] = useState(null)
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    const { enqueueSnackbar } = useSnackbar()
    titleHelper("View Groups")

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'description', headerName: 'Group Description', flex: 1, minWidth: 250 },
        {
            field: 'actions', type: 'actions', width: 80, getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit User"
                    onClick={() => {
                        setEditGroup(params.row)
                        createHandleOpen(params.row)
                    }}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete User"
                    onClick={() => {
                        setDeactivateUser(params.row)
                        handleDeactivateUserDialogOpen()
                    }}
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
        http.delete("/Admin/Group/" + deactivateUser.id).then((res) => {
            if (res.status === 200) {
                setDeactivateLoading(false)
                setDeactivateUserDialog(false)
                handleGetGroups()
                enqueueSnackbar("Group deleted successfully!", { variant: "success" });
            }
        })
    }

    const handleGetGroups = () => {
        http.get("/Admin/Group").then((res) => {
            if (res.status === 200) {
                setGroups(res.data)
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
        setActivePage(1)
        handleGetGroups()
    }, [])

    const createHandleOpen = (data) => {
        setEditGroupDialog(true)
        formik.setValues(data)
    }

    const createHandleClose = () => {
        setEditGroupDialog(false)
        setEditGroup(null)
    }

    const formik = useFormik({
        initialValues: {
            name: editGroup ? editGroup.name : "",
            description: editGroup ? editGroup.description : "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Group name is required"),
            description: Yup.string().required("Group description is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.name = data.name.trim();
            data.description = data.description.trim();

            http.put("/Admin/Group/" + editGroup.id, data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Group updated successfully!", { variant: "success" });
                    setEditGroupDialog(false)
                    handleGetGroups()
                } else {
                    enqueueSnackbar("Group update failed!.", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Group update failed! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })


    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="Group List" icon={<Person />} />
                        <DataGrid
                            rows={groups}
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
            <Dialog open={deactivateUserDialog} onClose={handleDeactivateUserDialogClose}>
                <DialogTitle>Deactivate Group</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to delete this group?
                        <br />
                        Group Details:
                        <ul>
                            <li>Name: {deactivateUser?.name}</li>
                            <li>E-mail Address: {deactivateUser?.email}</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateUserDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deactivateLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeactivateUser}>Delete</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editGroupDialog}
                onClose={createHandleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <DialogTitle>
                    Edit Group
                </DialogTitle>
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}

                        />
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                            multiline
                            rows={4}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={createHandleClose} startIcon={<CloseRounded />}>Cancel</Button>
                        <Button type="submit" startIcon={<EditRounded />}>Edit Group</Button>
                    </DialogActions>
                </Box>
            </Dialog >
        </>
    )
}

export default ViewGroups