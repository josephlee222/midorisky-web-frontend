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
import { CategoryContext } from './AdminActivitiesRoutes';
import titleHelper from '../../../functions/helpers';
import DeleteIcon from '@mui/icons-material/Delete';


function CreateActivity() {
    const [Categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { setActivePage } = useContext(CategoryContext);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const today = new Date();
    titleHelper("Create Activity")

    const handleGetCategories = () => {
        http.get("/Admin/Category/").then((res) => {
            if (res.status === 200) {
                setCategories(res.data)
                setLoading(false)
            }
        })
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            expiryDate: "",
            description: "",
            category: "",
            ntucExclusive: false,
            ageLimit: "",
            location: "",
            company: "",
            discounted: false,
            discountType: "",
            discountAmount: 0,
            pictures: [],

        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            expiryDate: Yup.date().min(today, "Expiry date must be after today").required("Date is required"),
            description: Yup.string().required("Description is required"),
            category: Yup.string().required("Category is required"),
            ntucExclusive: Yup.boolean().optional(),
            ageLimit: Yup.number().required("Age Limit is required. Enter 0 if no age limit"),
            location: Yup.string().required("Location is required"),
            company: Yup.string().required("Company is required"),
            discounted: Yup.boolean(),
            discountType:  Yup.string().when("discounted", {
                is: true,
                then: () => Yup.string().required("Discount Type is required"),
                otherwise: () => Yup.string().optional(),

            }),
            discountAmount: Yup.number().when("discounted", {
                is: true,
                then: () => Yup.number().required("Discount Amount is required"),
                otherwise: () => Yup.number().optional(),
            }),
        }),
        onSubmit: (data) => {
            setLoading(true);
            var pictures = []
            console.log("pictures: " + data.pictures);
            console.log(data.pictures);

            const formData = new FormData();
            Array.from(files).forEach((file, index) => {
                formData.append(`files`, file);
                console.log(`Appended file ${index}:`, file);
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            console.log("formdata: ", formData);
            console.log(formData);

            http.post("/File/multiUpload/", formData, config).then((res) => {

                if (res.status === 200) {
                    enqueueSnackbar("Pictures uploaded successfully!", { variant: "success" });
                    console.log("res data: ", res.data);
                    const resPic = { Items: res.data };
                    console.log("respic: ", resPic);
                    data.pictures = res.data.uploadedFiles
                    console.log(pictures)
                    data.name = data.name.trim();
                    data.description = data.description.trim();
                    data.category = data.category.trim();
                    data.location = data.location.trim();
                    data.company = data.company.trim();
                    data.discountType = data.discountType.trim();

                    console.log(data)

                    http.post("/Admin/Activity/", data).then((res) => {
                        if (res.status === 200) {
                            enqueueSnackbar("Activity created successfully!", { variant: "success" });
                            navigate("/admin/activities")
                        } else {
                            enqueueSnackbar("Activity creation failed!.", { variant: "error" });
                            setLoading(false);
                        }
                    }).catch((err) => {
                        enqueueSnackbar("Activity creation failed! " + err.response.data.error, { variant: "error" });
                        setLoading(false);
                    })
                } else {
                    enqueueSnackbar("Pictures uploaded failed!. else", { variant: "error" });
                    setLoading(false);
                }
            }).catch((err) => {
                console.log(err)
                enqueueSnackbar("Pictures uploaded failed! catch" + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    useEffect(() => {
        handleGetCategories();
        setActivePage(2);
        return () => {
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [])

    const handlePicturesChange = (event) => {
        const Files = event.target.files;

        // Convert FileList to an array
        const fileList = Array.from(Files);
        const newFiles = files.concat(fileList)

        // Concatenate the new array of files with the existing list of uploaded files
        const newUploadedFiles = [...uploadedFiles, ...fileList.map(file => ({
            name: file.name,
            preview: URL.createObjectURL(file) // Generate preview URL
        }))];
        // Set the updated list of uploaded files
        setUploadedFiles(newUploadedFiles);

        console.log(Files);
        
        
        setFiles(newFiles);

        console.log("Files state:", files);
    };

    const handleDeleteFile = (index) => {
        //the list of file details
        const updatedFileDetails = [...uploadedFiles];
        updatedFileDetails.splice(index, 1);
        setUploadedFiles(updatedFileDetails);

        //the actual list of file that contain the FILE files
        //this is 100% definitely best practice
        const updatedFiles = [...files];
        console.log(updatedFiles)
        updatedFiles.splice(index, 1);
        console.log(updatedFiles)
        setFiles(updatedFiles);
    };
    

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Create Activity" icon={<AddRounded />} />
                        <Box component="form" mt={3}>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="expiryDate"
                                        name="expiryDate"
                                        label="Expiry Date"
                                        variant="outlined"
                                        value={formik.values.expiryDate}
                                        onChange={formik.handleChange}
                                        error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                                        helperText={formik.touched.expiryDate && formik.errors.expiryDate}
                                        type='date'
                                        InputLabelProps={{ shrink: true }}
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
                               
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="category"
                                        name="category"
                                        select  // Use select to create a dropdown
                                        label="Category"
                                        variant="outlined"
                                        value={formik.values.category}
                                        onChange={formik.handleChange}
                                        error={formik.touched.category && Boolean(formik.errors.category)}
                                        helperText={formik.touched.category && formik.errors.category}
                                    >
                                        {/* Map through Categories and create an option for each category */}
                                        {Categories.map((category) => (
                                            <MenuItem key={category.id} value={category.name}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        id="ageLimit"
                                        name="ageLimit"
                                        label="Age Limit"
                                        variant="outlined"
                                        value={formik.values.ageLimit}
                                        onChange={formik.handleChange}
                                        error={formik.touched.ageLimit && Boolean(formik.errors.ageLimit)}
                                        helperText={formik.touched.ageLimit && formik.errors.ageLimit}
                                        type='number'
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="location"
                                        name="location"
                                        label="Activity Location"
                                        variant="outlined"
                                        value={formik.values.location}
                                        onChange={formik.handleChange}
                                        error={formik.touched.location && Boolean(formik.errors.location)}
                                        helperText={formik.touched.location && formik.errors.location}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="company"
                                        name="company"
                                        label="Organising Company"
                                        variant="outlined"
                                        value={formik.values.company}
                                        onChange={formik.handleChange}
                                        error={formik.touched.company && Boolean(formik.errors.company)}
                                        helperText={formik.touched.company && formik.errors.company}
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
                                    <Grid item xs={12}>
                                        <input
                                            accept="image/*"
                                            id="pictures"
                                            name="pictures"
                                            type="file"
                                            onChange={handlePicturesChange}
                                            multiple // Allow multiple file selection
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="pictures">
                                            <IconButton
                                                color="primary"
                                                aria-label="upload picture"
                                                component="span"
                                            >
                                                <AddIcon />
                                            </IconButton>
                                            <Typography variant="body1">Upload Pictures</Typography>
                                        </label>
                                        {uploadedFiles.map((file, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={file.name} />
                                                {file.preview && (
                                                    <img
                                                        src={file.preview}
                                                        alt={`Preview of ${file.name}`}
                                                        style={{ width: '50px', height: 'auto', marginLeft: '10px' }}
                                                    />
                                                )}
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleDeleteFile(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </Grid>
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

                                <Grid item xs={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formik.values.ntucExclusive}
                                                onChange={formik.handleChange}
                                                name="ntucExclusive"
                                                id='ntucExclusive'
                                                color="primary"
                                            />
                                        }
                                        label="NTUC Member Exclusive"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formik.values.discounted}
                                                onChange={formik.handleChange}
                                                name="discounted"
                                                id='discounted'
                                                color="primary"
                                            />
                                        }
                                        label="Discounted Activity"
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
                            >
                                Create Activity
                            </LoadingButton>
                        </Box>

                    </CardContent>
                </Card>
            </Box>
        </>
    )
}

export default CreateActivity