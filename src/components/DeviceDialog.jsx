import React, { useEffect, useState } from 'react';
import {
    Dialog, AppBar, Toolbar, IconButton, Typography, CircularProgress, Stack, Button,
    Box, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    CloseRounded, EditRounded, SaveRounded, EditOffRounded,
    DevicesRounded, QrCodeRounded, CropSquareRounded, CircleRounded
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { get, post, put } from 'aws-amplify/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';

export default function DeviceDialog({ open, onClose, deviceId, mode = 'view', onSubmitSuccess }) {
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    // Serial number prefixes
    const serialPrefixes = {
        sprinkler_controller: "SNS",
        temperature_sensor: "SNW",
        moisture_sensor: "SNM",
    };

    const formik = useFormik({
        initialValues: {
            IoTType: '',
            IoTSerialNumber: '',
            PlotID: '',
            IoTStatus: 1,
        },
        validationSchema: Yup.object({
            IoTType: Yup.string().trim().required("Device Type is required"),
            IoTSerialNumber: Yup.string().trim().required("Serial Number is required"),
            PlotID: Yup.string().trim().required("Plot ID is required"),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                if (mode === 'create') {
                    const response = await post({
                        apiName: "midori",
                        path: "/staff/devices/create-device",
                        options: { body: values },
                    });

                    const res = await response.response;
                    let result = await res.body.json();

                    enqueueSnackbar("Device successfully created", { variant: "success" });
                } else if (mode === 'edit' || editMode) {
                    const response = await put({
                        apiName: "midori",
                        path: `/staff/devices/update-device/${deviceId}`,
                        options: { body: values },
                    });

                    const res = await response.response;
                    let result = await res.body.json();

                    enqueueSnackbar("Device successfully updated", { variant: "success" });
                }

                onSubmitSuccess && onSubmitSuccess();
                if (mode === 'create') {
                    onClose();
                } else {
                    setEditMode(false);
                    handleGetDevice();
                }
            } catch (err) {
                console.error("Error saving device:", err);
                enqueueSnackbar("Error saving device. Please try again.", { variant: "error" });
            } finally {
                setLoading(false);
            }
        },
    });

    const handleGetDevice = async () => {
        if (!deviceId || mode === 'create') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await get({
                apiName: "midori",
                path: `/staff/devices/view-device/${deviceId}`,
            });

            const res = await response.response;
            const data = await res.body.json();

            formik.setValues({
                IoTType: data.IoTType || '',
                IoTSerialNumber: data.IoTSerialNumber || '',
                PlotID: data.PlotID || '',
                IoTStatus: data.IoTStatus || 1,
            });
        } catch (err) {
            console.error("Error fetching device:", err);
            enqueueSnackbar("Error loading device details", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Update Serial Number based on IoTType selection
    const handleIoTTypeChange = (event) => {
        const selectedType = event.target.value;
        formik.setFieldValue("IoTType", selectedType);

        if (mode === 'create' && serialPrefixes[selectedType]) {
            const nextSerialNumber = `${serialPrefixes[selectedType]}${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
            formik.setFieldValue("IoTSerialNumber", nextSerialNumber);
        }
    };

    useEffect(() => {
        if (open) {
            if (mode === 'create') {
                formik.resetForm();
                setLoading(false);
                setEditMode(false);
            } else {
                handleGetDevice();
                setEditMode(mode === 'edit');
            }
        }
    }, [open, deviceId, mode]);

    const isViewMode = mode === 'view' && !editMode;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseRounded />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                        {mode === 'create' ? 'Create Device' : 
                         editMode ? 'Edit Device' : 'Device Details'}
                    </Typography>
                    {mode === 'view' && !editMode && (
                        <Button 
                            onClick={() => setEditMode(true)} 
                            startIcon={<EditRounded />} 
                            color="inherit"
                        >
                            Edit
                        </Button>
                    )}
                    {editMode && (
                        <>
                            <LoadingButton 
                                onClick={formik.handleSubmit} 
                                loading={loading} 
                                startIcon={<SaveRounded />} 
                                color="inherit"
                            >
                                Save
                            </LoadingButton>
                            <Button 
                                onClick={() => {
                                    setEditMode(false);
                                    handleGetDevice();
                                }} 
                                startIcon={<EditOffRounded />} 
                                color="inherit" 
                                sx={{ ml: '0.5rem' }}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {mode === 'create' && (
                        <LoadingButton 
                            onClick={formik.handleSubmit} 
                            loading={loading} 
                            startIcon={<SaveRounded />} 
                            color="inherit"
                        >
                            Create
                        </LoadingButton>
                    )}
                </Toolbar>
            </AppBar>

            {loading ? (
                <Stack direction="column" spacing={2} my="3rem" alignItems="center">
                    <CircularProgress />
                    <Typography color="text.secondary">Loading device details...</Typography>
                </Stack>
            ) : (
                <Box p={3}>
    <Stack spacing={3}>
        {isViewMode ? (
            <>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <DevicesRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                        <Typography color="text.secondary" variant="subtitle2">Device Type</Typography>
                        <Typography variant="body1">
                            {formik.values.IoTType ? formik.values.IoTType.split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ') : ''}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <QrCodeRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                        <Typography color="text.secondary" variant="subtitle2">Serial Number</Typography>
                        <Typography variant="body1">{formik.values.IoTSerialNumber}</Typography>
                    </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <CropSquareRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                        <Typography color="text.secondary" variant="subtitle2">Plot ID</Typography>
                        <Typography variant="body1">{formik.values.PlotID}</Typography>
                    </Box>
                </Stack>

                {mode !== 'create' && (
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <CircleRounded
                            sx={{
                                color: formik.values.IoTStatus === 1 ? 'success.main' : 'error.main',
                                fontSize: 24
                            }}
                        />
                        <Box>
                            <Typography color="text.secondary" variant="subtitle2">Status</Typography>
                            <Typography variant="body1">
                                {formik.values.IoTStatus === 1 ? 'Active' : 'Spoilt'}
                            </Typography>
                        </Box>
                    </Stack>
                )}
            </>
        ) : (
            <>
                <FormControl fullWidth>
                    <InputLabel id="IoTType-label">Device Type</InputLabel>
                    <Select
                        labelId="IoTType-label"
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
                </FormControl>

                <TextField
                    fullWidth
                    id="IoTSerialNumber"
                    name="IoTSerialNumber"
                    label="Serial Number"
                    value={formik.values.IoTSerialNumber}
                    onChange={formik.handleChange}
                    error={formik.touched.IoTSerialNumber && Boolean(formik.errors.IoTSerialNumber)}
                    helperText={formik.touched.IoTSerialNumber && formik.errors.IoTSerialNumber}
                    disabled={mode === 'create'}
                />

                <TextField
                    fullWidth
                    id="PlotID"
                    name="PlotID"
                    label="Plot ID"
                    value={formik.values.PlotID}
                    onChange={formik.handleChange}
                    error={formik.touched.PlotID && Boolean(formik.errors.PlotID)}
                    helperText={formik.touched.PlotID && formik.errors.PlotID}
                />

                {mode !== 'create' && (
                    <FormControl fullWidth>
                        <InputLabel id="IoTStatus-label">Status</InputLabel>
                        <Select
                            labelId="IoTStatus-label"
                            id="IoTStatus"
                            name="IoTStatus"
                            label="Status"
                            value={formik.values.IoTStatus}
                            onChange={formik.handleChange}
                        >
                            <MenuItem value={1}>Active</MenuItem>
                            <MenuItem value={0}>Spoilt</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </>
        )}
                    </Stack>
                </Box>
            )}
        </Dialog>
    );
}