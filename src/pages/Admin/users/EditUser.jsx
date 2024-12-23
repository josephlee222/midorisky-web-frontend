import React, { useState, useEffect, useContext } from 'react'
import { Card, CardContent, Box, TextField, Grid, Typography, Skeleton, Stack, MenuItem, Button } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import CardTitle from "../../../components/CardTitle";
import { useSnackbar } from 'notistack'
import { useNavigate, useParams } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { ArrowBackRounded, Edit, InfoRounded, SaveRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminUsersRoutes';
import ProfilePicture from '../../../components/ProfilePicture';
import { AppContext } from '../../../App';
import titleHelper from '../../../functions/helpers';
import { get, put } from 'aws-amplify/api';
import moment from 'moment';
import { Link } from 'react-router-dom';

export default function EditUser() {
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    const { id: userId } = useParams();
    const [user, setUser] = useState(null);
    const { user: currentUser, setUser: setCurrentUser } = useContext(AppContext);
    titleHelper("Edit User")

    function handleLogout() {
        localStorage.removeItem("token")
        setCurrentUser(null)
        enqueueSnackbar("You need to login again because your permissions has changed", { variant: "warning" })
        navigate("/")
    }

    const handleGetUser = async () => {
        var userdata = get({
            apiName: "midori",
            path: "/admin/users/" + userId,
        })

        try {
            var res = await userdata.response
            var data = await res.body.json()
            setUser(data)
            var group = "normal"

            if (data.groups.includes("Admin")) {
                group = "admin"
            } else if (data.groups.includes("FarmManager")) {
                group = "farmManager"
            } else if (data.groups.includes("Farmer")) {
                group = "farmer"
            }

            formik.setValues({
                email: data.email,
                name: data.name,
                phone_number: data.phone_number,
                birthdate: moment(data.birthdate).format("YYYY-MM-DD"),
                group: group
            })
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load users", { variant: "error" })
        }
    }

    const formik = useFormik({
        initialValues: {
            email: "",
            name: "",
            group: "",
            phone_number: "",
            birthdate: ""
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is required"),
            name: Yup.string().required("Name is required"),
            phone_number: Yup.string().optional().nullable().matches(/^(?:[+\d].*\d|\d)$/, "Phone number must start with + or 00 and contain only numbers and spaces"),
            group: Yup.string().optional().nullable(),
            birthdate: Yup.date().optional(),
        }),
        onSubmit: async (data) => {
            setUpdateLoading(true);
            data.email = data.email.trim();
            data.name = data.name.trim();

            var userdata = put({
                apiName: "midori",
                path: "/admin/users/" + userId,
                options: {
                    body: {
                        ...data
                    }
                }
            })

            try {
                var res = await userdata.response
                enqueueSnackbar("User updated successfully!", { variant: "success" });
                navigate("/staff/users")
                setUpdateLoading(false);
            } catch (err) {
                console.log(err)
                var message = JSON.parse(err.response.body).Message
                enqueueSnackbar("Unable to update user! " + message, { variant: "error" });
                setUpdateLoading(false);
            }
        }
    })

    useEffect(() => {
        setActivePage(0);
        handleGetUser();
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="User Information" icon={<InfoRounded />} />
                        <Box mt={3}>
                            {loading && <Stack direction={"row"} alignItems={"center"}>
                                <Skeleton variant="circular" width={"72px"} height={"72px"} />
                                <Stack sx={{ width: "250px" }} spacing={1} marginLeft={"1rem"}>
                                    <Skeleton variant="text" width={"100%"} height={35} animation="wave" />
                                    <Skeleton variant="text" width={"100%"} height={18} animation="wave" />
                                </Stack>
                            </Stack>}
                            {!loading && <Stack direction={"row"} alignItems={"center"}>
                                <ProfilePicture user={user} sx={{ width: "72px", height: "72px" }} />
                                <Stack sx={{ width: "100%" }} spacing={.5} marginLeft={"1rem"}>
                                    <Typography variant={"h5"} fontWeight={700}>{user?.name}</Typography>
                                    <Typography variant={"body1"}>{user?.email}</Typography>
                                </Stack>
                            </Stack>}
                        </Box>
                    </CardContent>
                </Card>
                <Box component="form" mt={"1rem"}>
                    <Card>
                        <CardContent>
                            <CardTitle title="Edit User Information" icon={<Edit />} />
                            <Box mt={3}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            id="name"
                                            name="name"
                                            label="Name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            error={formik.touched.name && Boolean(formik.errors.name)}
                                            helperText={formik.touched.name && formik.errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            id="phone_number"
                                            name="phone_number"
                                            label="Phone Number"
                                            value={formik.values.phone_number}
                                            onChange={formik.handleChange}
                                            error={formik.touched.phone_number && Boolean(formik.errors.phone_number)}
                                            helperText={formik.touched.phone_number && formik.errors.phone_number}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            id="birthdate"
                                            name="birthdate"
                                            label="Birthdate"
                                            value={formik.values.birthdate}
                                            onChange={formik.handleChange}
                                            error={formik.touched.birthdate && Boolean(formik.errors.birthdate)}
                                            helperText={formik.touched.birthdate && formik.errors.birthdate}
                                            type="date"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
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
                                    <Grid item xs={12} md={6}>
                                        <Button
                                            variant="secondary"
                                            color="primary"
                                            type="submit"
                                            loadingPosition="start"
                                            startIcon={<ArrowBackRounded />}
                                            LinkComponent={Link}
                                            to="/staff/users"
                                            fullWidth
                                        >
                                            Back
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <LoadingButton
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            loading={loading || updateLoading}
                                            loadingPosition="start"
                                            startIcon={<SaveRounded />}
                                            onClick={formik.handleSubmit}
                                            fullWidth
                                        >
                                            Save Changes
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </>
    )
}