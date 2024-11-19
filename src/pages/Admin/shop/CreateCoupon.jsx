import React, { useState, useEffect, useContext } from 'react'
import {
    Container, Card, CardContent, Box, Checkbox, TextField,
    Grid, FormControlLabel, IconButton, Typography, RadioGroup, Radio, List,
    ListItem, ListItemText, Menu, MenuItem
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AddIcon from '@mui/icons-material/Add';
import CardTitle from "../../../components/CardTitle";
import http from '../../../http'
import { useSnackbar } from 'notistack'
import { Form, useNavigate } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { AddRounded, PersonAddRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminShopRoutes';
import titleHelper from '../../../functions/helpers';
import DeleteIcon from '@mui/icons-material/Delete';


function CreateCoupon() {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("Create Coupon")


    const formik = useFormik({
        initialValues: {
            code: "",
            expiry: "",
            description:"",
            discountType: "",
            discountAmount: 0,

        },
        validationSchema: Yup.object({
            code: Yup.string().required("Code is required"),
            expiry: Yup.date().required("Date is required"),
            description: Yup.string().required("Description is required"),
            discountType:  Yup.string().required("Discount Type is required"),
            discountAmount: Yup.number().required("Discount Amount is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            

            data.code = data.code.trim();
            data.description = data.description.trim();
            
            console.log(data)

            http.post("/Admin/Coupon/", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Coupon created successfully!", { variant: "success" });
                    navigate("/admin/shop/coupons")
                } else {
                    enqueueSnackbar("Coupon creation failed!.", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Coupon creation failed! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    useEffect(() => {
        setActivePage(4);
    }, [])

  
    

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Create Coupon" icon={<AddRounded />} />
                        <Box component="form" mt={3}>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="code"
                                        name="code"
                                        label="Code"
                                        variant="outlined"
                                        value={formik.values.code}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.code)}
                                        helperText={formik.touched.name && formik.errors.code}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="description"
                                        name="description"
                                        label="Description"
                                        variant="outlined"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && Boolean(formik.errors.description)}
                                        helperText={formik.touched.name && formik.errors.description}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="expiry"
                                        name="expiry"
                                        label="Expiry Date"
                                        variant="outlined"
                                        value={formik.values.expiry}
                                        onChange={formik.handleChange}
                                        error={formik.touched.expiry && Boolean(formik.errors.expiry)}
                                        helperText={formik.touched.expiry && formik.errors.expiry}
                                        type='date'
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="discountAmount"
                                        name="discountAmount"
                                        label="Discount Amount"
                                        variant="outlined"
                                        value={formik.values.discountAmount}
                                        onChange={formik.handleChange}
                                        error={formik.touched.discountAmount && Boolean(formik.errors.discountAmount)}
                                        helperText={formik.touched.discountAmount && formik.errors.discountAmount}
                                        type='number'
                                    />
                                    
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    {/* radio buttons for discount type */}
                                    <Typography variant="subtitle1">Discount Type:</Typography>
                                    <RadioGroup
                                        row
                                        aria-label="discountType"
                                        name="discountType"
                                        id='discountType'
                                        value={formik.values.discountType}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel value="Percentage" control={<Radio />} label="Percentage" />
                                        <FormControlLabel value="Fixed" control={<Radio />} label="Fixed" />
                                    </RadioGroup>
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
                            >
                                Create Coupon
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default CreateCoupon