import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    Stack,
    Skeleton,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import DevicesRounded from '@mui/icons-material/DevicesRounded';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeviceDialog from '../../../components/DeviceDialog';
import { get, del } from 'aws-amplify/api';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import CardTitle from '../../../components/CardTitle';
import { TuneRounded } from '@mui/icons-material';

function ViewDevices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDeviceDialog, setDeleteDeviceDialog] = useState(false);
    const [deleteDevice, setDeleteDevice] = useState(null);
    const [selectedType, setSelectedType] = useState("alldevices");
    const [selectedPlot, setSelectedPlot] = useState("allplots");
    const [uniquePlots, setUniquePlots] = useState([]);
    const [deviceDialog, setDeviceDialog] = useState({
        open: false,
        mode: 'view',
        deviceId: null
    });

    const handleDeviceDialog = (mode, deviceId = null) => {
        setDeviceDialog({
            open: true,
            mode,
            deviceId
        });
    };

    const handleCloseDeviceDialog = () => {
        setDeviceDialog({
            open: false,
            mode: 'view',
            deviceId: null
        });
    };

    // Format `IoTType` to capitalize first letters and remove underscores
    const formatIoTType = (type) => {
        return type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Columns for the DataGrid
    const columns = [
        {
            field: 'IoTType',
            headerName: 'Type',
            width: 200,
            headerClassName: 'bold-header',
            valueFormatter: (value, row) => formatIoTType(row.IoTType),
        },
        { field: 'IoTSerialNumber', headerName: 'Serial Number', width: 200, headerClassName: 'bold-header' },
        {
            field: 'IoTStatus',
            headerName: 'Status',
            width: 150,
            headerClassName: 'bold-header',
            renderCell: ({ value }) => (
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        height: '100%',
                        width: '100%',
                        pl: 1
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: value === 1 ? 'success.main' : 'error.main',
                        }}
                    />
                    <Typography>
                        {value === 1 ? 'Active' : 'Spoilt'}
                    </Typography>
                </Stack>
            ),
        },
        { field: 'PlotID', headerName: 'Plot ID', width: 150, headerClassName: 'bold-header' },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 300,
            headerClassName: 'bold-header',
            renderCell: ({ row }) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleDeviceDialog('view', row.id)}
                    >
                        View
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleDeviceDialog('edit', row.id)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                            setDeleteDevice(row);
                            setDeleteDeviceDialog(true);
                        }}
                    >
                        Delete
                    </Button>
                </Stack>
            ),
        },
    ];

    // Fetch devices
    const handleGetDevices = async () => {
        var normal = get({
            apiName: "midori",
            path: "/staff/devices/view-all-devices",
        });

        try {
            var res = await normal.response;
            var data = await res.body.json();
            setDevices(data);
            setLoading(false);
        } catch (err) {
            console.log(err);
            enqueueSnackbar("Failed to load devices", { variant: "error" });
        }
    };

    // Extract unique plots from devices
    useEffect(() => {
        if (devices.length > 0) {
            const plots = [...new Set(devices.map(device => device.PlotID))].sort((a, b) => a - b);
            setUniquePlots(plots);
        }
    }, [devices]);

    // Filter devices based on selected type and plot
    const filteredDevices = () => {
        return devices.filter((device) => {
            const matchesType = selectedType === "alldevices" || device.IoTType === selectedType;
            const matchesPlot = selectedPlot === "allplots" || device.PlotID.toString() === selectedPlot.toString();
            return matchesType && matchesPlot;
        });
    };

    // Delete device
    const handleDeleteDevice = async () => {
        try {
            const response = await del({
                apiName: "midori",
                path: "/staff/devices/delete-device",
                options: {
                    queryParams: { id: deleteDevice.id },
                },
            });

            if (response.message === "Device created successfully") {
                handleGetDevices();
                setDeleteDeviceDialog(false);
                enqueueSnackbar("Device deleted successfully", { variant: "success" });
            }
        } catch (err) {
            console.error("Error deleting device:", err);
            enqueueSnackbar("Failed to delete device. Please try again.", { variant: "error" });
        }
    }

    useEffect(() => {
        handleGetDevices();
    }, []);

    const totalDevices = devices.length;
    const spoiltDevices = devices.filter((device) => device.IoTStatus !== 1).length;

    return (
        <>
            <Box sx={{ marginY: '2rem' }}>
                <Typography display={{ xs: "none", md: "block" }} variant="h4" fontWeight={700}>
                    All Devices
                </Typography>
            </Box>

            <Box sx={{ marginY: "1rem" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                {loading ? (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Stack spacing={1}>
                                            <Skeleton variant="text" width={150} height={30} />
                                            <Skeleton variant="text" width={100} height={25} />
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1} direction="row" alignItems="center">
                                        {/* Icon for Total Devices */}
                                        <DevicesRounded sx={{ fontSize: 40, color: "primary.main" }} />
                                        <Stack spacing={1}>
                                            <Typography variant="h6" paddingLeft={1} fontWeight={700}>
                                                Total Devices
                                            </Typography>
                                            <Typography variant="h5" paddingLeft={1} fontWeight={700} color="text.secondary">
                                                {totalDevices}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                {loading ? (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Stack spacing={1}>
                                            <Skeleton variant="text" width={150} height={30} />
                                            <Skeleton variant="text" width={100} height={25} />
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1} direction="row" alignItems="center">
                                        {/* Icon for Devices Spoilt */}
                                        <CloseIcon sx={{ fontSize: 40, color: "error.main" }} />
                                        <Stack spacing={1}>
                                            <Typography variant="h6" paddingLeft={1} fontWeight={700}>
                                                Devices Spoilt
                                            </Typography>
                                            <Typography variant="h5" paddingLeft={1} fontWeight={700} color={spoiltDevices > 0 ? "error.main" : "text.secondary"}>
                                                {spoiltDevices}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>



            <Box sx={{ display: 'flex', marginBottom: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => handleDeviceDialog('create')}
                    startIcon={<DevicesRounded />}
                >
                    Create Device
                </Button>
            </Box>

            <Grid container spacing={2}>
                {/* Filters on the left */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ p: 2}}>
                        <Stack spacing={2}>
                            <CardTitle title="Filters" icon={<TuneRounded />} />
                            
                            {/* Device Type Filter */}
                            <FormControl fullWidth size="small">
                                <InputLabel>Device Type</InputLabel>
                                <Select
                                    value={selectedType}
                                    label="Device Type"
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <MenuItem value="alldevices">All Devices</MenuItem>
                                    <MenuItem value="moisture_sensor">Moisture Sensors</MenuItem>
                                    <MenuItem value="sprinkler_controller">Sprinkler Controllers</MenuItem>
                                    <MenuItem value="temperature_sensor">Temperature Sensors</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Plot Filter */}
                            <FormControl fullWidth size="small">
                                <InputLabel>Plot ID</InputLabel>
                                <Select
                                    value={selectedPlot}
                                    label="Plot ID"
                                    onChange={(e) => setSelectedPlot(e.target.value)}
                                >
                                    <MenuItem value="allplots">All Plots</MenuItem>
                                    {uniquePlots.map((plot) => (
                                        <MenuItem key={plot} value={plot}>
                                            Plot {plot}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Card>
                </Grid>

                {/* DataGrid Section on the right */}
                <Grid item xs={12} md={9}>
                    <DataGrid
                        rows={filteredDevices()}
                        columns={columns}
                        pageSize={12}
                        loading={loading}
                        autoHeight
                        getRowId={(row) => row.id}
                        sortModel={[{ field: 'IoTStatus', sort: 'asc' }]}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold', fontSize: 16 },
                            '& .MuiDataGrid-cell': { fontSize: 16 },
                        }}
                    />
                </Grid>
            </Grid>

            {/* Device Dialog */}
            <DeviceDialog
                open={deviceDialog.open}
                onClose={handleCloseDeviceDialog}
                deviceId={deviceDialog.deviceId}
                mode={deviceDialog.mode}
                onSubmitSuccess={handleGetDevices}
            />

            {/* Delete Device Dialog */}
            <Dialog open={deleteDeviceDialog} onClose={() => setDeleteDeviceDialog(false)}>
                <DialogTitle>Delete Device</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this device?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDeviceDialog(false)} startIcon={<CloseIcon />}>
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleDeleteDevice}
                        loading={loading}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Delete
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ViewDevices;
