import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Tabs,
    Tab,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    Stack,
    Skeleton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import DevicesRounded from '@mui/icons-material/DevicesRounded';
import { get, del } from 'aws-amplify/api';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

function ViewDevices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDeviceDialog, setDeleteDeviceDialog] = useState(false);
    const [deleteDevice, setDeleteDevice] = useState(null);
    const [tabValue, setTabValue] = useState("all");

    const navigate = useNavigate();

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
        { field: 'IoTStatus', headerName: 'Status', width: 150, headerClassName: 'bold-header' },
        { field: 'PlotID', headerName: 'Plot ID', width: 150, headerClassName: 'bold-header' },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            headerClassName: 'bold-header',
            renderCell: ({ row }) => (
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

    // Filter devices based on the selected tab
    const filteredDevices = () => {
        if (tabValue === "all") return devices;
        return devices.filter((device) => device.IoTType === tabValue);
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
            <Typography display={{ xs: "none", md: "flex" }} variant="h4" fontWeight={700} my={"1rem"}>All Devices</Typography>

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
                                        <CloseIcon sx={{ fontSize: 40, color: spoiltDevices > 0 ? "error.main" : "text.secondary" }} />
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



            <Button
                variant="contained"
                onClick={() => navigate("/staff/devices/create")}
                startIcon={<DevicesRounded />}
                sx={{ marginBottom: "1rem" }}
            >
                Create Device
            </Button>

            {/* Tabs for Device Types */}
            <Box sx={{ borderColor: "divider" }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    aria-label="Device Types Tabs"
                >
                    <Tab label="All Devices" value="all" />
                    <Tab label="Moisture Sensors" value="moisture_sensor" />
                    <Tab label="Sprinkler Controllers" value="sprinkler_controller" />
                    <Tab label="Temperature Sensors" value="temperature_sensor" />
                </Tabs>
            </Box>

            {/* DataGrid Section */}
            <Box>
                <DataGrid
                    rows={filteredDevices()}
                    columns={columns}
                    pageSize={12}
                    loading={loading}
                    autoHeight
                    getRowId={(row) => row.id}
                    sortModel={[{ field: 'IoTStatus', sort: 'asc' }]} // Show `IoTStatus` 0 first
                    sx={{
                        '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold', fontSize: 16 },
                        '& .MuiDataGrid-cell': { fontSize: 16 },
                    }}
                />
            </Box>

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
