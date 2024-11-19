import { useContext, useEffect, useState } from 'react'
import { Route, Routes, Navigate, Link, useSearchParams, useNavigate } from 'react-router-dom'
import http from '../http'
import { useSnackbar } from 'notistack'
import { AppContext } from '../App'
import { Card, CardContent, Container, Grid, ListItemIcon, ListItemButton, ListItem, ListItemText, Box, Button, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import CardTitle from '../components/CardTitle'
import PageHeader from '../components/PageHeader'
import titleHelper from '../functions/helpers'

function Verify() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("t")
    const { enqueueSnackbar } = useSnackbar()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    titleHelper("Activate Account")

    useEffect(() => {
        var data = {
            token: token
        }

        if (token) {
            http.post("/User/Verify", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Successfully verified your email address!", { variant: "success" })
                } else {
                    enqueueSnackbar("Failed to verify your email address! " + res.data.error, { variant: "error" })
                }

                navigate("/login")
            }).catch((err) => {
                console.log(err.response)
                if (err.response.status !== 409) {
                    enqueueSnackbar("Failed to verify your email address! " + err.response.data.error, { variant: "error" })
                    return navigate("/login")
                } else {
                    enqueueSnackbar("You need to set an account password first.", { variant: "info" })
                }
            })
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
            http.post("/User/Verify", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Password successfully set. You can login now", { variant: "success" });
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
            <PageHeader icon={PersonAddRoundedIcon} title="Activate Account" />
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
                                        Set Password
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

export default Verify