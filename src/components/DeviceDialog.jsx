import React, { useEffect, useState } from 'react';
import {
    Dialog, AppBar, Toolbar, IconButton, Typography, CircularProgress, Stack, Button,
    Box, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
    CloseRounded, EditRounded, SaveRounded, EditOffRounded,
    DevicesRounded, QrCode, CropSquareRounded, CircleRounded,
    AddCircleRounded, InfoRounded, AccessTimeRounded, PersonRounded
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { get, post, put } from 'aws-amplify/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';

export default function DeviceDialog({ open, onClose, deviceId, mode = 'view', onSubmitSuccess }) {
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [createMode, setCreateMode] = useState(false);
    const [extraDetails, setExtraDetails] = useState({
        Timestamp: '',
        ChangedBy: ''
    });

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
            IoTStatus: '',
            Timestamp: '',
            ChangedBy: '',
        },
        validationSchema: Yup.object({
            IoTType: Yup.string().trim().required("Device Type is required"),
            IoTSerialNumber: Yup.string().trim().required("Serial Number is required"),
            PlotID: Yup.string().trim().required("Plot ID is required"),
            IoTStatus: Yup.mixed().required("Status is required"),
        }),
        onSubmit: async (values) => {
            try {
                setSubmitLoading(true);
                if (mode === 'create' || createMode) {
                    const response = await post({
                        apiName: "midori",
                        path: "/staff/devices/create",
                        options: { body: values },
                    });

                    const res = await response.response;
                    let result = await res.body.json();

                    enqueueSnackbar("Device successfully created", { variant: "success" });
                } else if (mode === 'edit' || editMode) {
                    const response = await put({
                        apiName: "midori",
                        path: `/staff/devices/edit/${deviceId}`,
                        options: { body: values },
                    });

                    const res = await response.response;
                    let result = await res.body.json();

                    enqueueSnackbar("Device successfully updated", { variant: "success" });
                }

                onSubmitSuccess && onSubmitSuccess();
                onClose();
            } catch (err) {
                console.error("Error saving device:", err);
                enqueueSnackbar("Error saving device. Please try again.", { variant: "error" });
            } finally {
                setSubmitLoading(false);
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
                path: `/staff/devices/view/${deviceId}`,
            });

            const res = await response.response;
            const data = await res.body.json();

            formik.setValues({
                IoTType: data.IoTType || '',
                IoTSerialNumber: data.IoTSerialNumber || '',
                PlotID: data.PlotID || '',
                IoTStatus: data.IoTStatus === undefined || data.IoTStatus === null ? '' : Number(data.IoTStatus),
            });

            setExtraDetails({
                Timestamp: data.Timestamp || '',
                ChangedBy: data.ChangedBy || ''
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
            formik.resetForm();
            setEditMode(mode === 'edit');
            setCreateMode(mode === 'create');
            setLoading(mode !== 'create');
            if (mode !== 'create') {
                handleGetDevice();
            }
        }
    }, [open, deviceId, mode]);
const isViewMode = mode === 'view' && !editMode;

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // convert to 12-hour format
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedDate = date.toISOString().split('T')[0]; // get YYYY-MM-DD
    return `${formattedDate} ${formattedHours}:${formattedMinutes} ${ampm}`;
};


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseRounded />
                    </IconButton>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 2, flex: 1 }}>
                        {mode === 'create' ? <AddCircleRounded color="inherit" /> :
                         editMode ? <EditRounded color="inherit" /> :
                         <InfoRounded color="inherit" />}
                        <Typography variant="h6">
                            {mode === 'create' ? 'Create Device' :
                             editMode ? 'Edit Device' : 'Device Details'}
                        </Typography>
                    </Stack>
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
                                loading={submitLoading}
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
                    {createMode && (
                        <LoadingButton 
                            onClick={formik.handleSubmit} 
                            loading={submitLoading}
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
                    <QrCode sx={{ color: 'primary.main', fontSize: 24 }} />
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
                    <>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CircleRounded
                                sx={{
                                    color: {
                                        1: 'success.main',
                                        0: 'error.main',
                                        [-1]: 'warning.main'
                                    }[formik.values.IoTStatus] || 'error.main',
                                    fontSize: 24
                                }}
                            />
                            <Box>
                                <Typography color="text.secondary" variant="subtitle2">Status</Typography>
                                <Typography variant="body1">
                                    {formik.values.IoTStatus === 1 ? 'Active' :
                                     formik.values.IoTStatus === 0 ? 'Spoilt' :
                                     formik.values.IoTStatus === -1 ? 'Inactive' : 'Unknown'}
                                </Typography>
                            </Box>
                        </Stack>
                        
                        {isViewMode && (
                            <>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <AccessTimeRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                                    <Box>
                                        <Typography color="text.secondary" variant="subtitle2">Last Updated</Typography>
                                        <Typography variant="body1">{formatTimestamp(extraDetails.Timestamp)}</Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <PersonRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                                    <Box>
                                        <Typography color="text.secondary" variant="subtitle2">Changed By</Typography>
                                        <Typography variant="body1">{extraDetails.ChangedBy}</Typography>
                                    </Box>
                                </Stack>
                            </>
                        )}
                    </>
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

                <FormControl fullWidth>
                    <InputLabel id="IoTStatus-label">Status</InputLabel>
                    <Select
                        labelId="IoTStatus-label"
                        id="IoTStatus"
                        name="IoTStatus"
                        label="Status"
                        value={formik.values.IoTStatus === undefined || formik.values.IoTStatus === null ? '' : formik.values.IoTStatus}
                        onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? '' : Number(value);
                            formik.setFieldValue('IoTStatus', numValue);
                        }}
                        error={formik.touched.IoTStatus && Boolean(formik.errors.IoTStatus)}
                    >
                        <MenuItem value="">Select Status</MenuItem>
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={0}>Spoilt</MenuItem>
                        <MenuItem value={-1}>Inactive</MenuItem>
                    </Select>
                </FormControl>
            </>
        )}
                    </Stack>
                </Box>
            )}
        </Dialog>
    );
}