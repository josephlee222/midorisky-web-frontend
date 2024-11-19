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
import { Form, useNavigate, useParams } from 'react-router-dom'
import * as Yup from "yup";
import { useFormik } from 'formik';
import { EditRounded, PersonAddRounded } from '@mui/icons-material';
import { CategoryContext } from './AdminActivitiesRoutes';
import moment from 'moment';
import titleHelper from '../../../functions/helpers';
import DeleteIcon from '@mui/icons-material/Delete';


function EditActivity() {
    const [Categories, setCategories] = useState([])
    //const { user } = useContext(AppContext);
    titleHelper("Edit Activity")
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const url = import.meta.env.VITE_API_URL
    const { setActivePage } = useContext(CategoryContext);
    const { id: activityId } = useParams();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [oldFiles, setOldFiles] = useState([]);
    const today = new Date();

    const handleGetCategories = () => {
        http.get("/Admin/Category/").then((res) => {
            if (res.status === 200) {
                setCategories(res.data)
                setLoading(false)
            }
        })
    }

    const [activity, setActivity] = useState({
        name: "",
        expiryDate: "",
        description: "",
        category: "",
        ntucExclusive: "",
        ageLimit: "",
        location: "",
        company: "",
        discountType: "",
        discountAmount: "",
        pictures: [],
    })

    const handleGetActivity = () => {
        http.get(`/Admin/Activity/${activityId}`).then((res) => {
            if (res.status === 200) {
                setActivity(res.data)
                //setLoading(false)
                formik.setValues(res.data);
            }
        })

    }


    const formik = useFormik({
        initialValues: {
            /*name: activity.name,
            expiryDate: activity.expiryDate,
            description: activity.description,
            category:activity.category,
            ntucExclusive:activity.ntucExclusive,
            ageLimit:activity.ageLimit,
            location:activity.location,
            company:activity.company,
            discountType:activity.discountType,
            discountAmount:activity.discountAmount*/

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
            discountType: Yup.string().when("discounted", {
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
            data.name = data.name.trim();
            data.description = data.description.trim();
            data.category = data.category.trim();
            data.location = data.location.trim();
            data.company = data.company.trim();
            data.discountType = data.discountType.trim();
            data.pictures = oldFiles;

            const formDataEntries = formData.getAll('files');
            if (formDataEntries.length > 0) {
                console.log("no skip")
                http.post("/File/multiUpload/", formData, config).then((res) => {

                    if (res.status === 200) {
                        const allFiles = oldFiles.concat(res.data.uploadedFiles)
                        enqueueSnackbar("Pictures uploaded successfully!", { variant: "success" });
                        data.pictures = allFiles
                        


                        console.log(data)

                        http.put(`/Admin/Activity/${activityId}`, data).then((res) => {
                            if (res.status === 200) {
                                enqueueSnackbar("Review created successfully!", { variant: "success" });
                                navigate("/admin/activities")
                            } else {
                                enqueueSnackbar("Review creation failed!.", { variant: "error" });
                                setLoading(false);
                            }
                        }).catch((err) => {
                            enqueueSnackbar("Review creation failed! " + err.response.data.error, { variant: "error" });
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

            else {
                http.put("/Admin/Activity/"+activityId, data)
                    .then((res) => {
                        if (res.status === 200) {
                            enqueueSnackbar("Activity created successfully!", { variant: "success" });
                            console.log(res.data);
                            navigate(`/activityList/${activityId}`);
                        } else {
                            enqueueSnackbar("Activity creation failed!.", { variant: "error" });
                            setLoading(false);
                        }
                    })
                    .catch((err) => {
                        enqueueSnackbar("Activity creation failed! " + err.response, { variant: "error" });
                        setLoading(false);
                    });
            }
        }
    })

    const handlePicturesChange = (event) => {
        const Files = event.target.files;

        // Convert FileList to an array
        const fileList = Array.from(Files);
        const newFiles = files.concat(fileList)

        // Concatenate the new array of files with the existing list of uploaded files
        const newUploadedFiles = [...uploadedFiles, ...fileList.map(file => ({
            name: file.name,
            preview: URL.createObjectURL(file)
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
        var removedFile = updatedFileDetails.splice(index, 1);
        setUploadedFiles(updatedFileDetails);
        var OldFileNames = [];
        var OldFiles = oldFiles;

        for (let i = 0; i < oldFiles; i++) {
            const picture = oldFiles[i];
            OldFileNames.push({
                name: picture,
            });
        }

        var removeIndex = null;

        for(let i = 0;i < OldFileNames; i++){
            const pictureName = OldFileNames[i].name;
            if(removedFile == pictureName){
                removeIndex = i;
            }
        }

        OldFiles.splice(removeIndex, 1);
        setOldFiles(OldFiles);


        console.log(removedFile);


        //the actual list of file that contain the FILE files
        //this is 100% definitely best practice
        const updatedFiles = [...files];
        console.log(updatedFiles)
        updatedFiles.splice(index, 1);
        console.log(updatedFiles)
        setFiles(updatedFiles);
    };

    useEffect(() => {
        setActivePage(0);
        handleGetActivity();
        handleGetCategories();
        return () => {
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [])

    useEffect(() => {
        // Set default value for uploadedFiles when activity data is fetched
        if (activity.pictures?.items) {
            const files = [];
            const oldFiles = [];
            for (let i = 0; i < activity.pictures.items.length; i++) {
                const picture = activity.pictures.items[i];
                files.push({
                    name: picture,
                    preview: url + `/uploads/${picture}`
                });
            }

            for (let i = 0; i < activity.pictures.items.length; i++) {
                const picture = activity.pictures.items[i];
                oldFiles.push(picture);
            }

            console.log(files);

            setUploadedFiles(files);

            setOldFiles(oldFiles);
        }
    }, [activity]);


    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>

                    <CardContent>
                        <CardTitle title="Edit Activity" icon={<EditRounded />} />
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
                                        value={moment(formik.values.expiryDate).format("YYYY-MM-DD")}
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
                                </Grid>
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
                                startIcon={<EditRounded />}
                                onClick={formik.handleSubmit}
                                fullWidth
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

export default EditActivity