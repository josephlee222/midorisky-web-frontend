import React, { useState, useEffect, useContext } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Box,
    Skeleton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
    AppsRounded,
    QueryStatsRounded,
    TimelineRounded,
    Thermostat,
    Opacity,
    Cloud,
    Air,
    RefreshRounded,
    RouterRounded
} from '@mui/icons-material';
import CardTitle from '../../../components/CardTitle';
import { get } from 'aws-amplify/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { CategoryContext } from './FarmRoutes';

// Register Chart.js components
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
);

// Extend dayjs with UTC plugin
dayjs.extend(utc);

function ViewFarmDashboard() {
    const [weatherData, setWeatherData] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [weatherRefreshing, setWeatherRefreshing] = useState(false);
    const [statsRefreshing, setStatsRefreshing] = useState(false);
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const { setActivePage } = useContext(CategoryContext);

    // Fetch current weather data
    const fetchCurrentWeatherData = async () => {
        try {
            const response = get({
                apiName: 'midori',
                path: '/staff/weather/fetch-closest-weather-data',
            });

            const res = await response.response;
            let result = '';
            let done = false;

            if (res.body && typeof res.body.getReader === 'function') {
                const reader = res.body.getReader();
                while (!done) {
                    const { value, done: isDone } = await reader.read();
                    done = isDone;
                    if (value) result += new TextDecoder().decode(value);
                }

                let parsedData = JSON.parse(result);
                if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);

                if (!Array.isArray(parsedData)) {
                    throw new Error('Expected an array, but received a different format.');
                }

                console.log(parsedData[0]);

                setWeatherData(parsedData[0]); // Use the first item in the array
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch historical weather data
    const fetchHistoricalWeatherData = async () => {
        try {
            const response = get({
                apiName: 'midori',
                path: '/staff/weather/fetch-current-and-next-hours',
            });

            const res = await response.response;
            let result = '';
            let done = false;

            if (res.body && typeof res.body.getReader === 'function') {
                const reader = res.body.getReader();
                while (!done) {
                    const { value, done: isDone } = await reader.read();
                    done = isDone;
                    if (value) result += new TextDecoder().decode(value);
                }

                let parsedData = JSON.parse(result);
                if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
                console.log(parsedData);
                setHistoricalData(parsedData);
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentWeatherData();
        fetchHistoricalWeatherData();
        fetchDevices();
        setActivePage(0);
    }, []);

    const handleRefreshWeather = async () => {
        setWeatherRefreshing(true);
        await fetchCurrentWeatherData();
        setWeatherRefreshing(false);
    };

    const handleRefreshStats = async () => {
        setStatsRefreshing(true);
        await fetchHistoricalWeatherData();
        setStatsRefreshing(false);
    };

    const fetchDevices = async () => {
        try {
            setDevicesLoading(true);
            const response = await get({
                apiName: "midori",
                path: "/staff/devices/view-all-devices",
            }).response;

            const reader = response.body.getReader();
            let result = "";
            let done = false;

            while (!done) {
                const { value, done: isDone } = await reader.read();
                done = isDone;
                if (value) {
                    result += new TextDecoder().decode(value);
                }
            }

            let parsedData = JSON.parse(result);
            if (typeof parsedData === "string") {
                parsedData = JSON.parse(parsedData);
            }

            if (!Array.isArray(parsedData)) {
                throw new Error("Expected an array but received a different format.");
            }

            setDevices(parsedData);
        } catch (error) {
            console.error("Error fetching devices:", error);
        } finally {
            setDevicesLoading(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '--';
        return dayjs.utc(timestamp).format('hh:mm A DD-MM-YYYY');
    };    
    
    historicalData.forEach(item => {
        item.formattedTime = dayjs.utc(item.Timestamp).format('DD-MM-YYYY HH:mm');
    });

    // Create chart configuration
    const createChartConfig = (metric, label, color) => {
        const currentDate = dayjs().utc(+8);
        return {
            labels: historicalData.map((item) => item.formattedTime),
            datasets: [
                {
                    label: label,
                    data: historicalData.map((item) => item[metric]),
                    borderColor: color,
                    backgroundColor: `${color}33`,
                    tension: 0.4,
                    fill: true,
                    segment: {
                        borderDash: (ctx) =>
                            dayjs.utc(historicalData[ctx.p0DataIndex].Timestamp).add(30, 'minute').isAfter(currentDate) ? [6, 6] : undefined,
                    },
                },
            ],
        };
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: false,
                    text: "Date",
                },
                ticks: {
                    callback: function (value, index, ticks) {
                        const dateTime = dayjs.utc(historicalData[index]?.Timestamp).format('HH:mm A');
                        return `${dateTime}`;
                    },
                },
            },
            y: {
                title: {
                    display: false,
                    text: "Value",
                },
                beginAtZero: true,
            },
        },
    };

    // Metrics configuration
    const metrics = [
        { key: 'Temperature', label: 'Temperature (°C)', color: '#FF5733', icon: <Thermostat /> },
        { key: 'Humidity', label: 'Humidity (%)', color: '#1ABC9C', icon: <Opacity /> },
        { key: 'Precipitation', label: 'Precipitation (mm)', color: '#8E44AD', icon: <Cloud /> },
        { key: 'Windspeed', label: 'Windspeed (km/h)', color: '#33C4FF', icon: <Air /> },
    ];

    const othermetrics = [
        { key: 'temperature', label: 'Temperature (°C)', color: '#FF5733', icon: <Thermostat /> },
        { key: 'humidity', label: 'Humidity (%)', color: '#1ABC9C', icon: <Opacity /> },
        { key: 'precipitation', label: 'Precipitation (mm)', color: '#8E44AD', icon: <Cloud /> },
        { key: 'windspeed', label: 'Windspeed (km/h)', color: '#33C4FF', icon: <Air /> },
    ];

    return (
        <Box my={'1rem'}>
            <Grid container spacing={2}>
                {/* Current Weather Card */}
                <Grid item xs={12} md={9}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <CardTitle
                                    sx={{ fontWeight: 700 }}
                                    title={`Weather Now - ${formatTimestamp(weatherData?.timestamp)}`}
                                    icon={<AppsRounded />}
                                />
                                <LoadingButton
                                    onClick={handleRefreshWeather}
                                    loading={weatherRefreshing}
                                    variant="text"
                                    startIcon={<RefreshRounded />}
                                    loadingPosition="start"
                                    size="small"
                                >
                                    Refresh
                                </LoadingButton>
                            </Box>
                            {loading || weatherRefreshing ? (
                                // Loading State
                                <Card variant="draggable" sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Skeleton variant="circular" width={40} height={40} />
                                            <Stack spacing={1}>
                                                <Skeleton variant="text" width={150} height={30} />
                                                <Skeleton variant="text" width={100} height={25} />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ) : (
                                // Weather Data
                                <Grid container spacing={2} mt={'0'}>
                                    {othermetrics.map((othermetrics) => (
                                        <Grid item xs={12} sm={6} md={3} key={othermetrics.key}>
                                            <Card variant="draggable">
                                                <CardContent>
                                                    <Stack spacing={1} direction="row" alignItems="center">
                                                        {othermetrics.icon}
                                                        <Stack spacing={1}>
                                                            <Typography variant="h6" fontWeight={700}>
                                                                {othermetrics.label}
                                                            </Typography>
                                                            <Typography variant="h5" fontWeight={700} color="text.secondary">
                                                                {weatherData?.[othermetrics.key]?.toFixed(1) || '--'}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Farm Overview Card */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <CardTitle title="Farm Overview" icon={<AppsRounded />} />
                            <Grid container spacing={2} mt={'0'}>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Card variant="draggable">
                                        <CardContent>
                                            <Stack spacing={1}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    Total Farms
                                                </Typography>
                                                <Typography variant="h5" fontWeight={700} color="text.secondary">
                                                    5
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Card variant="draggable">
                                        <CardContent>
                                            <Stack spacing={1}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    Recent Yield
                                                </Typography>
                                                <Typography variant="h5" fontWeight={700} color="text.secondary">
                                                    412.5
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bottom Row: Weather Statistics and Spoilt Devices */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: 650 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <CardTitle title="Weather Statistics" icon={<QueryStatsRounded />} />
                                <LoadingButton
                                    onClick={handleRefreshStats}
                                    loading={statsRefreshing}
                                    variant="text"
                                    startIcon={<RefreshRounded />}
                                    loadingPosition="start"
                                    size="small"
                                >
                                    Refresh
                                </LoadingButton>
                            </Box>
                            <Box sx={{ mt: 2, overflowY: 'auto', flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    {metrics.map((metric) => (
                                        <Grid item xs={12} sm={6} key={metric.key}>
                                            <Card variant="draggable">
                                                <CardContent>
                                                    <CardTitle title={metric.label} icon={metric.icon} />
                                                    {historyLoading || statsRefreshing ? (
                                                        <Skeleton variant="rectangular" height={200} />
                                                    ) : (
                                                        <Box width="100%">
                                                            <Line
                                                                data={createChartConfig(metric.key, metric.label, metric.color)}
                                                                options={chartOptions}
                                                            />
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 650 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <CardTitle title="Spoilt Devices" icon={<RouterRounded />} />
                                <LoadingButton
                                    onClick={fetchDevices}
                                    loading={devicesLoading}
                                    variant="text"
                                    startIcon={<RefreshRounded />}
                                    loadingPosition="start"
                                    size="small"
                                >
                                    Refresh
                                </LoadingButton>
                            </Box>
                            {devicesLoading ? (
                                <Skeleton variant="rectangular" height={650} sx={{ mt: 2 }} />
                            ) : (
                                <Box sx={{ mt: 2, overflowY: 'auto', flexGrow: 1, maxHeight: '616.75px' }}>
                                    <Stack spacing={2}>
                                        {devices.filter(device => device.IoTStatus === 0).map(device => (
                                            <Card key={device.id} variant="draggable">
                                                <CardContent>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <RouterRounded sx={{ color: 'error.main' }} />
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                {device.IoTType.split('_')
                                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                    .join(' ')}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {device.IoTSerialNumber}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Plot {device.PlotID}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {devices.filter(device => device.IoTStatus === 0).length === 0 && (
                                            <Stack color="grey" spacing={1} alignItems="center">
                                                <Typography variant="body1">No spoilt devices</Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ViewFarmDashboard;
