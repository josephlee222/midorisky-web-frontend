import React, { useState, useEffect, useContext } from 'react'
import { Container, Card, CardContent, Box, Checkbox, TextField, Grid, FormControlLabel, IconButton, Typography, RadioGroup, Radio } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CardTitle from "../../../components/CardTitle";
import http from '../../../http'
import { useSnackbar } from 'notistack'
import { Form, useNavigate, useParams } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { EditRounded, PersonAddRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminActivitiesRoutes';
import moment from 'moment';
import titleHelper from '../../../functions/helpers';

function EditCategory() {
    //const { user } = useContext(AppContext);
    titleHelper("Edit Category")
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    const { id: categoryId } = useParams();
    const [activity, setActivity] = useState({
        name: "",
        description: "",
    })

    const handleGetActivity = () => {
        http.get(`/Admin/Category/${categoryId}`).then((res) => {
            if (res.status === 200) {
                setActivity(res.data)
                //setLoading(false)
                formik.setValues(res.data);
            }
        })
    }

    const formik = useFormik({
        initialValues: {

            name: "",
            description: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            description: Yup.string().required("Description is required"),

        }),
        onSubmit: (data) => {
            setLoading(true);
            data.name = data.name.trim();
            data.description = data.description.trim();

            console.log(data)

            http.put(`/Admin/Category/${categoryId}`, data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("category edited successfully!", { variant: "success" });
                    navigate("/admin/activities/viewCategories")
                } else {
                    enqueueSnackbar("category edited failed!.", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("category edited failed! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    useEffect(() => {
        setActivePage(0);
        handleGetActivity()

    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Edit Category" icon={<EditRounded />} />
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
                                        label="Activity Description"
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
                                startIcon={<EditRounded />}
                                onClick={formik.handleSubmit}
                                fullWidth
                                sx={{ mt: "1rem" }}
                            >
                                Edit Activity
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default EditCategory