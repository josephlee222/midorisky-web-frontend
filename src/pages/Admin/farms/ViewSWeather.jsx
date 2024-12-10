import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, FormGroup, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { BackpackRounded } from '@mui/icons-material';
import CardTitle from '../../../components/CardTitle';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { get } from "aws-amplify/api";



function ViewSWeather() {
    const [weatherData, setWeatherData] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState({
        Avg_Temperature: true,
        Avg_Windspeed: true,
        Avg_Precipitation: true,
        Avg_Humidity: true,
    });
    const [loading, setLoading] = useState(true);
    dayjs.extend(utc);

    const fetchWeatherData = async () => {
        try {
            const response = get({
                apiName: "midori",
                path: "/processweatherdata",
            });

            const res = await response.response;

            if (!res.body || typeof res.body.getReader !== "function") {
                throw new Error("Response body is not a ReadableStream.");
            }

            const reader = res.body.getReader();
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
                throw new Error("Expected an array, but received a different format.");
            }

            setWeatherData(parsedData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const xAxisData = Array.isArray(weatherData)
        ? weatherData.map((data) => new Date(data.Month))
        : [];
    const temperatureData = Array.isArray(weatherData)
        ? weatherData.map((data) => data.Avg_Temperature)
        : [];
    const windspeedData = Array.isArray(weatherData)
        ? weatherData.map((data) => data.Avg_Windspeed)
        : [];
    const precipitationData = Array.isArray(weatherData)
        ? weatherData.map((data) => data.Avg_Precipitation)
        : [];
    const humidityData = Array.isArray(weatherData)
        ? weatherData.map((data) => data.Avg_Humidity)
        : [];

    const series = [];
    if (selectedMetrics.Avg_Temperature) {
        series.push({
            label: "Avg Temperature (°C)",
            data: temperatureData,
            color: "#FF5733",
        });
    }
    if (selectedMetrics.Avg_Windspeed) {
        series.push({
            label: "Avg Windspeed (m/s)",
            data: windspeedData,
            color: "#33C4FF",
        });
    }
    if (selectedMetrics.Avg_Precipitation) {
        series.push({
            label: "Avg Precipitation (mm)",
            data: precipitationData,
            color: "#8E44AD",
        });
    }
    if (selectedMetrics.Avg_Humidity) {
        series.push({
            label: "Avg Humidity (%)",
            data: humidityData,
            color: "#1ABC9C",
        });
    }

    const handleMetricChange = (event) => {
        const { name, checked } = event.target;
        setSelectedMetrics((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSelectAll = (event) => {
        const { checked } = event.target;
        setSelectedMetrics({
            Avg_Temperature: checked,
            Avg_Windspeed: checked,
            Avg_Precipitation: checked,
            Avg_Humidity: checked,
        });
    };

    return (
        <Box my="1rem">
            <Card>
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>                            
                            <CardTitle title="Weather Data Overview" icon={<BackpackRounded />} />

                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                onChange={handleSelectAll}
                                                checked={Object.values(selectedMetrics).every((value) => value)}
                                            />
                                        }
                                        label="Select All"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedMetrics.Avg_Temperature}
                                                onChange={handleMetricChange}
                                                name="Avg_Temperature"
                                            />
                                        }
                                        label="Avg Temperature (°C)"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedMetrics.Avg_Windspeed}
                                                onChange={handleMetricChange}
                                                name="Avg_Windspeed"
                                            />
                                        }
                                        label="Avg Windspeed (m/s)"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedMetrics.Avg_Precipitation}
                                                onChange={handleMetricChange}
                                                name="Avg_Precipitation"
                                            />
                                        }
                                        label="Avg Precipitation (mm)"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedMetrics.Avg_Humidity}
                                                onChange={handleMetricChange}
                                                name="Avg_Humidity"
                                            />
                                        }
                                        label="Avg Humidity (%)"
                                    />
                                </FormGroup>
                            </Box>

                            <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
                                Weather Metrics Over Time
                            </Typography>

                            <Box my="2rem" style={{ height: "500px", width: "100%" }}>
                                <LineChart
                                    xAxis={[
                                        {
                                            label: "Month",
                                            data: xAxisData,
                                            scaleType: "time",
                                            valueFormatter: (date) =>
                                                dayjs.utc(date).format("MM-YYYY"),
                                        },
                                    ]}
                                    yAxis={[{ label: "Value" }]}
                                    series={series}
                                    height={500}
                                />
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default ViewSWeather;
