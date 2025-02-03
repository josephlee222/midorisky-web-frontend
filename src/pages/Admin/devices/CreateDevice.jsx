import React, { useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import AddIcon from '@mui/icons-material/Add';
import { post } from 'aws-amplify/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import { useFormik } from 'formik';

function CreateDevice() {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    // Serial number prefixes
    const serialPrefixes = {
        sprinkler_controller: "SNS",
        temperature_sensor: "SNW",
        moisture_sensor: "SNM",
    };

    // Initial form setup with Formik
    const formik = useFormik({
        initialValues: {
            IoTType: '',
            IoTSerialNumber: '',
            PlotID: '',
        },
        validationSchema: Yup.object({
            IoTType: Yup.string().trim().required("Device Type is required"),
            IoTSerialNumber: Yup.string().trim().required("Serial Number is required"),
            PlotID: Yup.string().trim().required("Plot ID is required"),
        }),
        onSubmit: async (data) => {
            setLoading(true);
        
            try {
                const response =  post({
                    apiName: "midori",
                    path: "/staff/devices/create-device",
                    options: {
                        body: {
                            IoTType: formik.values.IoTType.trim(),
                            IoTSerialNumber: formik.values.IoTSerialNumber.trim(),
                            PlotID: formik.values.PlotID.trim(),
                        },
                    },
                });
        
                const res = await response.response;
                let result = "";
                let done = false;
        
                // Handle streamed response
                if (res.body && typeof res.body.getReader === "function") {
                    const reader = res.body.getReader();
                    while (!done) {
                        const { value, done: isDone } = await reader.read();
                        done = isDone;
                        if (value) result += new TextDecoder().decode(value);
                    }
                }
        
                // Parse and handle the response
                let parsedData = JSON.parse(result);
                if (typeof parsedData === "string") parsedData = JSON.parse(parsedData);
        
                console.log(parsedData);
        
                enqueueSnackbar("Device successfully created", { variant: "success" });
                navigate("/staff/devices");
            } catch (err) {
                console.error("Error creating device:", err);
                enqueueSnackbar("Error creating device. Please try again.", { variant: "error" });
            } finally {
                setLoading(false);
            }
        },
    });

    // Update Serial Number based on IoTType selection
    const handleIoTTypeChange = (event) => {
        const selectedType = event.target.value;
        formik.setFieldValue("IoTType", selectedType);

        if (serialPrefixes[selectedType]) {
            const nextSerialNumber = `${serialPrefixes[selectedType]}${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
            formik.setFieldValue("IoTSerialNumber", nextSerialNumber);
        } else {
            formik.setFieldValue("IoTSerialNumber", "");
        }
    };

    return (
        <Container maxWidth="xl" sx={{ marginTop: "1rem" }}>
            <Typography display={{ xs: "none", md: "flex" }} variant="h4" fontWeight={700} my={"1rem"}>Create Device</Typography>

            <LoadingButton
                variant="contained"
                color="primary"
                type="submit"
                loading={loading}
                loadingPosition="start"
                startIcon={<AddIcon />}
                onClick={formik.handleSubmit}
                sx={{ marginBottom: "1rem" }}
            >
                Create Device
            </LoadingButton>
            <Card>
                <CardContent>
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel id="IoTType-label">Device Type</InputLabel>
                                    <Select
                                        id="IoTType"
                                        name="IoTType"
                                        label="Device Type"
                                        value={formik.values.IoTType}
                                        onChange={handleIoTTypeChange}
                                        error={formik.touched.IoTType && Boolean(formik.errors.IoTType)}
                                    >
                                        <MenuItem value="">Select Device Type</MenuItem>
                                        <MenuItem value="moisture_sensor">Moisture Sensor</MenuItem>
                                        <MenuItem value="sprinkler_controller">Sprinkler Controller</MenuItem>
                                        <MenuItem value="temperature_sensor">Temperature Sensor</MenuItem>
                                    </Select>
                                    {formik.touched.IoTType && formik.errors.IoTType && (
                                        <Typography color="error" variant="caption">
                                            {formik.errors.IoTType}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="IoTSerialNumber"
                                    name="IoTSerialNumber"
                                    label="Serial Number"
                                    variant="outlined"
                                    value={formik.values.IoTSerialNumber}
                                    onChange={formik.handleChange}
                                    error={formik.touched.IoTSerialNumber && Boolean(formik.errors.IoTSerialNumber)}
                                    helperText={formik.touched.IoTSerialNumber && formik.errors.IoTSerialNumber}
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="PlotID"
                                    name="PlotID"
                                    label="Plot ID"
                                    variant="outlined"
                                    value={formik.values.PlotID}
                                    onChange={formik.handleChange}
                                    error={formik.touched.PlotID && Boolean(formik.errors.PlotID)}
                                    helperText={formik.touched.PlotID && formik.errors.PlotID}
                                />
                            </Grid>

                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}

export default CreateDevice;
