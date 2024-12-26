import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Button, Card, Grid, CardContent, Box, TextField, Typography } from "@mui/material";
import CardTitle from "../components/CardTitle";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import LoginIcon from '@mui/icons-material/LoginRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import GoogleIcon from '@mui/icons-material/Google';
import http from "../http";
import { AppContext } from "../App";
import { LoadingButton } from "@mui/lab";
import PageHeader from "../components/PageHeader";
import { CelebrationRounded, PartyModeRounded } from "@mui/icons-material";
import titleHelper from "../functions/helpers";

export default function Register() {
    titleHelper("Register")
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const { setUser, setNotifications, setConnection } = useContext(AppContext);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            cfm_password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("E-mail is required"),
            password: Yup.string().required("Password is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            //enqueueSnackbar("Logging in...", { variant: "info" });\
            data.name = data.name.trim();
            data.email = data.email.trim();
            data.password = data.password.trim();
            data.cfm_password = data.cfm_password.trim();

            if (data.password !== data.cfm_password) {
                enqueueSnackbar("Passwords do not match!", { variant: "error" });
                setLoading(false);
                return;
            }

            http.post("/User/Register", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Registration successful. Check your e-mail for the activition link.", { variant: "success" });
                    // Store token in local storage
                    navigate("/Login")
                } else {
                    enqueueSnackbar("Login failed! Check your e-mail and password.", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                if (err.response) {
                    enqueueSnackbar("Login failed! " + err.response.data.error, { variant: "error" });
                    setLoading(false);
                } else {
                    enqueueSnackbar("Login failed! " + err.message, { variant: "error" });
                    setLoading(false);
                }
            })
        }

    })

    

    return (
        <>
            <PageHeader title="Welcome Back" icon={LoginIcon} navTitle="Register" />
            <Container sx={{ mt: "2rem", mb: "1rem" }} maxWidth="lg">
                <Grid container spacing={2} justifyContent={"center"} mb={"2rem"}>
                    <Grid item xs={6} md={2}>
                        <Button variant="secondary" fullWidth sx={{ fontWeight: 700 }} LinkComponent={Link} to="/login">Login</Button>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button variant="contained" fullWidth sx={{ fontWeight: 700 }}>Register</Button>
                    </Grid>
                </Grid>
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Register with E-mail" icon={<PasswordRoundedIcon />} />
                                <Box component="form" onSubmit={formik.handleSubmit}>
                                    <TextField
                                        fullWidth
                                        id="name"
                                        name="name"
                                        label="Name"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                        helperText={formik.touched.name && formik.errors.name}
                                        sx={{ mt: 3 }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="E-mail Address"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                        sx={{ mt: 1 }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="Password"
                                        type="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        sx={{ mt: 1 }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="cfm_password"
                                        name="cfm_password"
                                        label="Confirm Password"
                                        type="password"
                                        value={formik.values.cfm_password}
                                        onChange={formik.handleChange}
                                        error={formik.touched.cfm_password && Boolean(formik.errors.cfm_password)}
                                        helperText={formik.touched.cfm_password && formik.errors.cfm_password}
                                        sx={{ mt: 1 }}
                                    />
                                    <LoadingButton
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        sx={{ mt: "1rem" }}
                                        loading={loading}
                                    >
                                        Register Account
                                    </LoadingButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Easy Registration" icon={<KeyRoundedIcon />} />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <LoadingButton fullWidth variant="secondary" sx={{ mt: "1rem" }} startIcon={<GoogleIcon />} loading={loading}>
                                            Google
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

        </>

    );
}