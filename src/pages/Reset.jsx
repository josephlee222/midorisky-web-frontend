import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Container, Button, Card, Grid, CardContent, Box, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CardTitle from "../components/CardTitle";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import http from "../http";
import { AppContext } from "../App";
import PageHeader from "../components/PageHeader";
import titleHelper from "../functions/helpers";


export default function Reset() {
    titleHelper("Reset Password")
    const [searchParams] = useSearchParams()
    const token = searchParams.get("t")
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            setLoading(true);
            http.get("/User/Check/" + token).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Enter your new password.", { variant: "success" })
                } else {
                    enqueueSnackbar("Failed to reset password! " + res.data.error, { variant: "error" })
                    navigate("/login")
                }
            }).catch((err) => {
                enqueueSnackbar("Failed to reset password! " + err.response.data.error, { variant: "error" })
                navigate("/login")
            }) 

            setLoading(false);
        } else {
            enqueueSnackbar("No token found!", { variant: "error" })
            navigate("/login")
        }
    }, [])

    const formik = useFormik({
        initialValues: {
            password: "",
            cfm_password: "",
        },
        validationSchema: Yup.object({
            password: Yup.string().required("Password is required"),
            cfm_password: Yup.string().required("Confirm Password is required").oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.password = data.password.trim();
            data.token = token;
            http.post("/User/Reset", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Password reset successful. You can login now", { variant: "success" });
                    navigate("/")
                } else {
                    enqueueSnackbar("Failed to reset password!", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                if (err.response) {
                    enqueueSnackbar("Failed to reset password! " + err.response.data.error, { variant: "error" });
                    setLoading(false);
                } else {
                    enqueueSnackbar("Failed to reset password! " + err.message, { variant: "error" });
                    setLoading(false);
                }
            })
        }

    })


    return (
        <>
            <PageHeader icon={LockResetRoundedIcon} title="Reset Password" />
            <Container sx={{mt: "2rem"}}>
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item xs={12} md={5}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Enter new password" icon={<PasswordRoundedIcon />} />
                                <Box component="form" onSubmit={formik.handleSubmit}>
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="New Password"
                                        type="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        sx={{ mt: 3 }}
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
                                        Reset Password
                                    </LoadingButton>
                                    <Button fullWidth variant="text" sx={{ mt: "1rem" }} component={Link} to="/login">
                                        Back to Login
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            
        </>

    );
}