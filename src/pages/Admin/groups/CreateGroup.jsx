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
import { GroupAddRounded, PersonAddRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminGroupsRoutes';
import titleHelper from '../../../functions/helpers';

function CreateGroup() {

    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("Create Group")

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Group name is required"),
            description: Yup.string().required("Group description is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            data.name = data.name.trim();
            data.description = data.description.trim();

            http.post("/Admin/Group", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Group created successfully!", { variant: "success" });
                    navigate("/admin/groups")
                } else {
                    enqueueSnackbar("Group creation failed!.", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Group creation failed! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    useEffect(() => {
        setActivePage(2);
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Create Group" icon={<GroupAddRounded />} />
                        <Box component="form" mt={3}>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="description"
                                        name="description"
                                        label="Description"
                                        variant="outlined"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        error={formik.touched.description && Boolean(formik.errors.description)}
                                        helperText={formik.touched.description && formik.errors.description}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>
                            <LoadingButton
                                variant="contained"
                                color="primary"
                                type="submit"
                                loading={loading}
                                loadingPosition="start"
                                startIcon={<AddIcon />}
                                onClick={formik.handleSubmit}
                                fullWidth
                                sx={{ mt: "1rem" }}
                            >
                                Create Group
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default CreateGroup