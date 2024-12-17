import React, { useState, useEffect, useContext } from 'react'
import { Container, Card, CardContent, Box, Checkbox, TextField, Grid, FormControlLabel, IconButton, Typography, Alert, MenuItem } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CardTitle from "../../../components/CardTitle";
import http from '../../../http'
import { useSnackbar } from 'notistack'
import { Form, useNavigate } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { PersonAddRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminUsersRoutes';
import titleHelper from '../../../functions/helpers';
import { post } from 'aws-amplify/api';

function CreateUser() {

    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("Create User")

    const formik = useFormik({
        initialValues: {
            username: "",
            group: "normal",
            email: "",
            name: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is required"),
            username: Yup.string().required("Username is required"),
            group: Yup.string().required("User group is required"),
            name: Yup.string().required("Name is required"),
        }),
        onSubmit: async (data) => {
            setLoading(true);
            data.email = data.email.trim();
            data.name = data.name.trim();
            data.username = data.username.trim();

            var normal = post({
                apiName: "midori",
                path: "/admin/users",
                options: {
                    body: {
                        ...data
                    }
                }
            })

            try {
                var res = await normal.response
                
                enqueueSnackbar("User created successfully! Invitation E-mail has been sent to the user.", { variant: "success" });
                navigate("/staff/users")
                setLoading(false);
            } catch (err) {
                console.log(err)
                var message = JSON.parse(err.response.body).Message
                enqueueSnackbar("Unable to create user! " + message, { variant: "error" });
                setLoading(false);
            }



            // http.post("/Admin/User", data).then((res) => {
            //     if (res.status === 200) {
            //         enqueueSnackbar("User created successfully! Invitation E-mail has been sent to the user.", { variant: "success" });
            //         navigate("/admin/users")
            //     } else {
            //         enqueueSnackbar("User creation failed!.", { variant: "error" });
            //         setLoading(false);
            //     }
            // }).catch((err) => {
            //     enqueueSnackbar("User creation failed! " + err.response.data.error, { variant: "error" });
            //     setLoading(false);
            // })
        }
    })

    useEffect(() => {
        setActivePage(1);
    })

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Create User" icon={<PersonAddRounded />} />
                        <Box component="form" mt={3}>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="username"
                                        name="username"
                                        label="Username"
                                        variant="outlined"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        error={formik.touched.username && Boolean(formik.errors.username)}
                                        helperText={formik.touched.username && formik.errors.username}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {/* Select for user group permissions */}
                                    <TextField
                                        select
                                        fullWidth
                                        id="group"
                                        name="group"
                                        label="User Group"
                                        value={formik.values.group}
                                        onChange={formik.handleChange}
                                        error={formik.touched.group && Boolean(formik.errors.group)}
                                        helperText={formik.touched.group && formik.errors.group}
                                    >
                                        <MenuItem value="normal">Non-Staff</MenuItem>
                                        <MenuItem value="farmer">Farmer</MenuItem>
                                        <MenuItem value="farmManager">Farm Manager</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="E-mail Address"
                                        variant="outlined"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="name"
                                        name="name"
                                        label="Name"
                                        variant="outlined"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                        helperText={formik.touched.name && formik.errors.name}
                                    />
                                </Grid>
                            </Grid>
                            <Alert severity="info" sx={{ my: "1rem" }}>When the user is created, an e-mail with an temporary password will be sent to the user. </Alert>
                            <LoadingButton
                                variant="contained"
                                color="primary"
                                type="submit"
                                loading={loading}
                                loadingPosition="start"
                                startIcon={<AddIcon />}
                                onClick={formik.handleSubmit}
                                fullWidth
                            >
                                Create User
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default CreateUser