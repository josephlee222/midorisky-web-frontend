import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Box,
    Skeleton,
} from '@mui/material';
import {
    AppsRounded,
    QueryStatsRounded,
    TimelineRounded,
    Thermostat,
    Opacity,
    Cloud,
    Air,
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
    }, []);

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

    return (
        <Box my={'1rem'}>
            <Grid container spacing={2}>
                {/* Current Weather Card */}
                <Grid item xs={12} md={9}>
                    <Card>
                        <CardContent>
                            <CardTitle
                                sx={{ fontWeight: 700 }}
                                title={`Weather Now - ${formatTimestamp(weatherData?.Timestamp)}`}
                                icon={<AppsRounded />}
                            />
                            {loading ? (
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
                                    {metrics.map((metric) => (
                                        <Grid item xs={12} sm={6} md={3} key={metric.key}>
                                            <Card variant="draggable">
                                                <CardContent>
                                                    <Stack spacing={1} direction="row" alignItems="center">
                                                        {metric.icon}
                                                        <Stack spacing={1}>
                                                            <Typography variant="h6" fontWeight={700}>
                                                                {metric.label}
                                                            </Typography>
                                                            <Typography variant="h5" fontWeight={700} color="text.secondary">
                                                                {weatherData?.[metric.key]?.toFixed(1) || '--'}
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

                {/* Weather Statistics Card */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <CardTitle title="Weather Statistics" icon={<QueryStatsRounded />} />
                            <Grid container spacing={2} mt={'0'}>
                                {metrics.map((metric) => (
                                    <Grid item xs={12} sm={6} key={metric.key}>
                                        <Card variant="draggable">
                                            <CardContent>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Box>{metric.icon}</Box>
                                                    <Typography variant="h6">{metric.label}</Typography>
                                                </Stack>
                                                {historyLoading ? (
                                                    <Skeleton variant="rectangular" height={100} />
                                                ) : (
                                                    <Box width="100%" >
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
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activities Card */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <CardTitle title="Recent Activities" icon={<TimelineRounded />} />
                            <Card variant="draggable" sx={{ mt: 2 }}>
                                <CardContent>
                                    <Stack color={'grey'} spacing={1} alignItems="center">
                                        <Typography variant="body1">No recent activities</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ViewFarmDashboard;