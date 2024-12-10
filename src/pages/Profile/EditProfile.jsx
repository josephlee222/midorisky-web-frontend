import { useContext, useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography, TextField} from "@mui/material";
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import {  EditRounded, LockResetRounded } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import http from "../../http";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { updatePassword, updateUserAttributes, fetchUserAttributes } from "aws-amplify/auth";
import titleHelper from "../../functions/helpers";

export default function EditProfile() {
    const { user, setUser } = useContext(AppContext);
    const { activePage, setActivePage } = useContext(ProfileContext);
    const [editProfileloading, setEditProfileLoading] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setActivePage(0);
    }, [])

    titleHelper("Edit Profile");
    
    useEffect(() => {
        if (user) {
            editUserFormik.setFieldValue("name", user.name ? user.name : "");
            editUserFormik.setFieldValue("phoneNumber", user.phone_number ? user.phone_number : "");
            editUserFormik.setFieldValue("birthdate", user.birthdate ? moment(user.birthdate).format("YYYY-MM-DD") : "");
        }
    }, [user])

    const editUserFormik = useFormik({
        initialValues: {
            "name": "",
            "phoneNumber": "",
            "birthdate": "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            phoneNumber: Yup.string().optional().nullable().matches(/^(?:[+\d].*\d|\d)$/, "Phone number must start with + or 00 and contain only numbers and spaces"),
            birthdate: Yup.date().optional().nullable(),
        }),
        onSubmit: (data) => {
            setEditProfileLoading(true);
            data.name = data.name.trim();
            data.phoneNumber = data.phoneNumber.trim();
            data.birthdate = data.birthdate.trim();

            updateUserAttributes({
                userAttributes: {
                    name: data.name,
                    phone_number: data.phoneNumber,
                    birthdate: data.birthdate,
                }
            }).then(async () => {
                const userAttributes = await fetchUserAttributes();
                setUser(userAttributes);

                enqueueSnackbar("Profile updated!", { variant: "success" });
                setEditProfileLoading(false);
                navigate("/profile")
            }).catch((err) => {
                enqueueSnackbar("Unable to update profile! " + err.message, { variant: "error" });
                setEditProfileLoading(false);
            })
        }
    })

    const changePasswordFormik = useFormik({
        initialValues: {
            "password": "",
            "newPassword": "",
            "confirmPassword": "",
        },
        validationSchema: Yup.object({
            password: Yup.string().required("Current password is required"),
            newPassword: Yup.string().required("New password is required"),
            confirmPassword: Yup.string().required("Confirm Password is required").oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        }),
        onSubmit: (data) => {
            setEditProfileLoading(true);

            updatePassword({
                oldPassword: data.password,
                newPassword: data.newPassword,
            }).then(() => {
                enqueueSnackbar("Password changed!", { variant: "success" });
                setEditProfileLoading(false);
                navigate("/profile")
            }).catch((err) => {
                enqueueSnackbar("Unable to change password! " + err.message, { variant: "error" });
                setEditProfileLoading(false);
            })
        }
    })

    return (

        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Edit Profile" icon={<EditRounded />} />
                    <Typography variant="body1" mt={"1rem"}>Edit basic profile information here.</Typography>
                    <Box component='form' sx={{ mt: "1rem" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={editUserFormik.values.name}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.name && Boolean(editUserFormik.errors.name)}
                                    helperText={editUserFormik.touched.name && editUserFormik.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    label="Phone Number"
                                    value={editUserFormik.values.phoneNumber}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.phoneNumber && Boolean(editUserFormik.errors.phoneNumber)}
                                    helperText={editUserFormik.touched.phoneNumber && editUserFormik.errors.phoneNumber}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="birthdate"
                                    name="birthdate"
                                    label="Birthdate"
                                    InputLabelProps={{ shrink: true }}
                                    type="date"
                                    value={editUserFormik.values.birthdate}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.birthdate && Boolean(editUserFormik.errors.birthdate)}
                                    helperText={editUserFormik.touched.birthdate && editUserFormik.errors.birthdate}
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            fullWidth
                            variant="contained"
                            sx={{ mt: "1rem" }}
                            onClick={editUserFormik.handleSubmit}
                            loading={editProfileloading}
                            loadingPosition="start"
                            startIcon={<EditRounded />}
                        >
                            Update Profile
                        </LoadingButton>
                    </Box>
                </CardContent>
            </Card>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Change Password" icon={<LockResetRounded />} />
                    <Typography variant="body1" mt={"1rem"}>Change your password here.</Typography>
                    <Box component='form' sx={{ mt: "1rem" }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="password"
                                    name="password"
                                    label="Current Password"
                                    type="password"
                                    value={changePasswordFormik.values.password}
                                    onChange={changePasswordFormik.handleChange}
                                    error={changePasswordFormik.touched.password && Boolean(changePasswordFormik.errors.password)}
                                    helperText={changePasswordFormik.touched.password && changePasswordFormik.errors.password}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="newPassword"
                                    name="newPassword"
                                    label="New Password"
                                    type="password"
                                    value={changePasswordFormik.values.newPassword}
                                    onChange={changePasswordFormik.handleChange}
                                    error={changePasswordFormik.touched.newPassword && Boolean(changePasswordFormik.errors.newPassword)}
                                    helperText={changePasswordFormik.touched.newPassword && changePasswordFormik.errors.newPassword}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    value={changePasswordFormik.values.confirmPassword}
                                    onChange={changePasswordFormik.handleChange}
                                    error={changePasswordFormik.touched.confirmPassword && Boolean(changePasswordFormik.errors.confirmPassword)}
                                    helperText={changePasswordFormik.touched.confirmPassword && changePasswordFormik.errors.confirmPassword}
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            fullWidth
                            variant="contained"
                            sx={{ mt: "1rem" }}
                            onClick={changePasswordFormik.handleSubmit}
                            loading={editProfileloading}
                            loadingPosition="start"
                            startIcon={<EditRounded />}
                        >
                            Change Password
                        </LoadingButton>
                    </Box>
                </CardContent>
            </Card>
        </>
    )

}