import { useContext, useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography, Button, TextField, Select, InputLabel, MenuItem } from "@mui/material";
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import { PersonRounded, NewspaperRounded, EditRounded, LockResetRounded } from "@mui/icons-material";
import InfoBox from "../../components/InfoBox";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { FormControl } from "@mui/base";
import { useSnackbar } from "notistack";
import http from "../../http";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function EditProfile() {
    const { user, setUser } = useContext(AppContext);
    const { activePage, setActivePage } = useContext(ProfileContext);
    const [editProfileloading, setEditProfileLoading] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setActivePage(0);
        document.title = "Edit Profile - UPlay"
    }, [])

    useEffect(() => {
        if (user) {
            editUserFormik.setFieldValue("name", user.name ? user.name : "");
            editUserFormik.setFieldValue("phoneNumber", user.phoneNumber ? user.phoneNumber : "");
            editUserFormik.setFieldValue("occupationalStatus", user.occupationalStatus ? user.occupationalStatus : "");
            editUserFormik.setFieldValue("postalCode", user.postalCode ? user.postalCode : "");
            editUserFormik.setFieldValue("address", user.address ? user.address : "");
            editUserFormik.setFieldValue("nric", user.nric ? user.nric : "");
            editUserFormik.setFieldValue("birthdate", user.birthDate ? moment(user.birthDate).format("YYYY-MM-DD") : "");
        }
    }, [user])

    const editUserFormik = useFormik({
        initialValues: {
            "name": "",
            "phoneNumber": "",
            "occupationalStatus": "",
            "postalCode": "",
            "address": "",
            "nric": "",
            "birthdate": "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            phoneNumber: Yup.string().optional().nullable().matches(/^[0-9]+$/, "Phone number must be a number"),
            occupationalStatus: Yup.string().optional().nullable(),
            postalCode: Yup.string().optional().nullable().matches(/^[0-9]+$/, "Postal code must be a number"),
            address: Yup.string().optional().nullable(),
            nric: Yup.string().optional().nullable().max(4, "Only the last 4 characters of NRIC is required"),
            birthdate: Yup.date().optional().nullable(),
        }),
        onSubmit: (data) => {
            setEditProfileLoading(true);
            data.name = data.name.trim();
            data.phoneNumber = data.phoneNumber.trim();
            data.occupationalStatus = data.occupationalStatus.trim();
            data.postalCode = data.postalCode.trim();
            data.address = data.address.trim();
            data.nric = data.nric.trim();
            data.birthdate = data.birthdate.trim();

            http.put("/User", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Profile updated!", { variant: "success" });
                    setUser(res.data);
                    navigate("/profile")
                } else {
                    enqueueSnackbar("Unable to update profile!.", { variant: "error" });
                    setEditProfileLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Unable to update profile! " + err.response.data.error, { variant: "error" });
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
            
            http.put("/User", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Password changed!", { variant: "success" });
                    navigate("/profile")
                } else {
                    enqueueSnackbar("Unable to change password!.", { variant: "error" });
                    setEditProfileLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Unable to change password! " + err.response.data.error, { variant: "error" });
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
                            <Grid item xs={12} md={6}>
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
                                {/* Select options for occupational status */}
                                <TextField
                                    select
                                    fullWidth
                                    id="occupationalStatus"
                                    name="occupationalStatus"
                                    label="Occupational Status"
                                    value={editUserFormik.values.occupationalStatus}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.occupationalStatus && Boolean(editUserFormik.errors.occupationalStatus)}
                                    helperText={editUserFormik.touched.occupationalStatus && editUserFormik.errors.occupationalStatus}
                                >
                                    <MenuItem value="Student">Student</MenuItem>
                                    <MenuItem value="Employed">Employed</MenuItem>
                                    <MenuItem value="Unemployed">Unemployed</MenuItem>
                                    <MenuItem value="Retired">Retired</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="postalCode"
                                    name="postalCode"
                                    label="Postal Code"
                                    value={editUserFormik.values.postalCode}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.postalCode && Boolean(editUserFormik.errors.postalCode)}
                                    helperText={editUserFormik.touched.postalCode && editUserFormik.errors.postalCode}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    id="nric"
                                    name="nric"
                                    label="NRIC"
                                    value={editUserFormik.values.nric}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.nric && Boolean(editUserFormik.errors.nric)}
                                    helperText={editUserFormik.touched.nric && editUserFormik.errors.nric}
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="address"
                                    name="address"
                                    label="Address"
                                    value={editUserFormik.values.address}
                                    onChange={editUserFormik.handleChange}
                                    error={editUserFormik.touched.address && Boolean(editUserFormik.errors.address)}
                                    helperText={editUserFormik.touched.address && editUserFormik.errors.address}
                                    multiline
                                    rows={2}
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
                                    error={changePasswordFormik.touched.currentPassword && Boolean(changePasswordFormik.errors.password)}
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