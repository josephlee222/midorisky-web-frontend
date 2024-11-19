import React, { useState, useEffect, useContext } from 'react'
import { Container, Card, CardContent, Box, Checkbox, TextField, Grid, FormControlLabel, IconButton, Typography, Alert } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CardTitle from "../../../components/CardTitle";
import http from '../../../http'
import { useSnackbar } from 'notistack'
import { Form, useNavigate } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { CellTowerRounded, PersonAddRounded, SendRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminUsersRoutes';
import titleHelper from '../../../functions/helpers';

function BroadcastNotification() {

    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("Broadcast Notification")

    const formik = useFormik({
        initialValues: {
            title: "",
            subtitle: "",
            action: "",
            actionUrl: "",
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required").max(256, "Title can have a maximum length of 256 characters"),
            subtitle: Yup.string().required("Subtitle is required").max(256, "Subtitle can have a maximum length of 256 characters"),
            action: Yup.string().required("Action URL is required").max(64, "Action URL can have a maximum length of 64 characters"),
            actionUrl: Yup.string().required("Action URL is required").max(512, "Action URL can have a maximum length of 64 characters"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.title = data.title.trim();
            data.subtitle = data.subtitle.trim();
            data.action = data.action.trim();
            data.actionUrl = data.actionUrl.trim();

            http.post("/Admin/User/Broadcast", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Notification broadcasted. It may take a while to notify all users", { variant: "success" });
                    navigate("/admin/users")
                } else {
                    enqueueSnackbar("Unable to broadcast notification!", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Unable to broadcast notification! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    useEffect(() => {
        setActivePage(3);
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Broadcast Notification" icon={<CellTowerRounded />} />
                        <Box component="form" mt={3}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Title"
                                variant="outlined"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                                sx={{ mb: "1rem" }}
                            />
                            <Grid container spacing={2}>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="action"
                                        name="action"
                                        label="Call to Action"
                                        variant="outlined"
                                        value={formik.values.action}
                                        onChange={formik.handleChange}
                                        error={formik.touched.action && Boolean(formik.errors.action)}
                                        helperText={formik.touched.action && formik.errors.action}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="actionUrl"
                                        name="actionUrl"
                                        label="Action URL"
                                        variant="outlined"
                                        value={formik.values.actionUrl}
                                        onChange={formik.handleChange}
                                        error={formik.touched.actionUrl && Boolean(formik.errors.actionUrl)}
                                        helperText={formik.touched.actionUrl && formik.errors.actionUrl}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                fullWidth
                                id="subtitle"
                                name="subtitle"
                                label="Subtitle"
                                variant="outlined"
                                value={formik.values.subtitle}
                                onChange={formik.handleChange}
                                error={formik.touched.subtitle && Boolean(formik.errors.subtitle)}
                                helperText={formik.touched.subtitle && formik.errors.subtitle}
                                multiline
                                rows={4}
                                sx={{ mt: "1rem" }}
                            />
                            <Alert severity="warning" sx={{ my: "1rem" }}>
                                This will send a notification to all users with the title and subtitle provided. The action URL is optional.
                            </Alert>
                            <LoadingButton
                                variant="contained"
                                color="primary"
                                type="submit"
                                loading={loading}
                                loadingPosition="start"
                                startIcon={<SendRounded />}
                                onClick={formik.handleSubmit}
                                fullWidth
                            >
                                Broadcast Notification
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default BroadcastNotification