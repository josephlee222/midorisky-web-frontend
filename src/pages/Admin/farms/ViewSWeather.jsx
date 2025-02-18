import React, { useState, useEffect, useContext } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import { BackpackRounded } from "@mui/icons-material";
import CardTitle from "../../../components/CardTitle";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { get } from "aws-amplify/api";
import { CategoryContext } from "./FarmRoutes";

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

dayjs.extend(utc);

function ViewSWeather() {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MMMM"));
    const [selectedYear, setSelectedYear] = useState(dayjs().year().toString());
    const { setActivePage } = useContext(CategoryContext);

    const [selectedMetrics, setSelectedMetrics] = useState({
        Avg_Temperature: true,
        Avg_Windspeed: true,
        Avg_Precipitation: true,
        Avg_Humidity: true,
    });

    const allMonths = [
        "All Months",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // Get available months based on selected year
    const getAvailableMonths = () => {
        const currentDate = dayjs().utc();
        const maxFutureDate = currentDate.add(7, 'days');
        const selectedYearNum = parseInt(selectedYear);

        // For past years, show all months
        if (selectedYearNum < currentDate.year()) {
            return allMonths;
        }

        // For future years beyond current year + 1, show no months except "All Months"
        if (selectedYearNum > currentDate.year()) {
            return ["All Months"];
        }

        // For current year
        const availableMonths = ["All Months"];
        for (let i = 1; i < allMonths.length; i++) {
            const monthDate = dayjs().year(selectedYearNum).month(i - 1);
            if (monthDate.isBefore(maxFutureDate)) {
                availableMonths.push(allMonths[i]);
            }
        }
        return availableMonths;
    };

    const months = getAvailableMonths();

    useEffect(() => {
        setActivePage(2);
        fetchCombinedWeatherData();
    }, []);

    const fetchCombinedWeatherData = async () => {
        try {
            const response = await get({
                apiName: "midori",
                path: "/staff/weather/fetch-combined-weather-data",
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

            setWeatherData(parsedData);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and format data for chart
    const filteredData = weatherData.filter((data) => {
        const date = dayjs.utc(data.Date);
        const matchesMonth = selectedMonth === "All Months" || date.month() === months.indexOf(selectedMonth) - 1;
        const matchesYear = selectedYear === "" || date.year().toString() === selectedYear;
        return matchesMonth && matchesYear;
    });

    const xAxisLabels = filteredData.map((data) => dayjs.utc(data.Date).format("DD-MM-YYYY"));

    const datasets = [];
    const addDataset = (label, dataKey, color) => {
        datasets.push({
            label: label,
            data: filteredData.map((data) => data[dataKey]),
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.4,
            segment: {
                borderDash: (ctx) =>
                    dayjs.utc(filteredData[ctx.p0DataIndex].Date).isAfter(dayjs().utc().startOf("day").subtract(1,"day")) ? [6, 6] : undefined,
            },
        });
    };

    if (selectedMetrics.Avg_Temperature) {
        addDataset("Avg Temperature (°C)", "Temperature", "#FF5733");
    }
    if (selectedMetrics.Avg_Windspeed) {
        addDataset("Avg Windspeed (m/s)", "Windspeed", "#33C4FF");
    }
    if (selectedMetrics.Avg_Precipitation) {
        addDataset("Avg Precipitation (mm)", "Precipitation", "#8E44AD");
    }
    if (selectedMetrics.Avg_Humidity) {
        addDataset("Avg Humidity (%)", "Humidity", "#1ABC9C");
    }

    const chartData = {
        labels: xAxisLabels,
        datasets,
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Value",
                },
                beginAtZero: true,
            },
        },
    };

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
                                <Box>
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
                                        {Object.keys(selectedMetrics).map((metric) => (
                                            <FormControlLabel
                                                key={metric}
                                                control={
                                                    <Checkbox
                                                        checked={selectedMetrics[metric]}
                                                        onChange={handleMetricChange}
                                                        name={metric}
                                                    />
                                                }
                                                label={metric.replace("Avg_", "Avg ")}
                                            />
                                        ))}
                                    </FormGroup>
                                </Box>
                                <Box display="flex" gap={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Month</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            label="Month"
                                            style={{ minWidth: "160px" }}
                                        >
                                            {months.map((month) => (
                                                <MenuItem key={month} value={month}>
                                                    {month}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Year</InputLabel>
                                        <Select
                                            value={selectedYear}
                                            onChange={(e) => {
                                                const newYear = e.target.value;
                                                setSelectedYear(newYear);
                                                // Reset to "All Months" if current selection isn't valid for new year
                                                const currentDate = dayjs().utc();
                                                const maxFutureDate = currentDate.add(7, 'days');
                                                const monthIndex = allMonths.indexOf(selectedMonth) - 1;
                                                if (monthIndex >= 0) { // Skip check for "All Months"
                                                    const monthDate = dayjs().year(parseInt(newYear)).month(monthIndex);
                                                    if (parseInt(newYear) > currentDate.year() ||
                                                        (parseInt(newYear) === currentDate.year() && monthDate.isAfter(maxFutureDate))) {
                                                        setSelectedMonth("All Months");
                                                    }
                                                }
                                            }}
                                            label="Year"
                                            style={{ minWidth: "120px" }}
                                        >
                                            {[...new Set(weatherData.map((data) => dayjs.utc(data.Date).year()))].map(
                                                (year) => (
                                                    <MenuItem key={year} value={year.toString()}>
                                                        {year}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Box style={{ width: "90%", margin: "0 auto" }}>
                                <Line data={chartData} options={chartOptions} />
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default ViewSWeather;
