import React, { useState, useContext, useEffect } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { BackpackRounded } from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import { CategoryContext } from "./FarmRoutes";
import CardTitle from "../../../components/CardTitle";
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

const fakeWeatherData = [
    { id: 1, Year: 2024, Quarter: 1, TotalYield: 407.0741513484876 },
    { id: 2, Year: 2024, Quarter: 2, TotalYield: 396.8870070347991 },
    { id: 3, Year: 2024, Quarter: 3, TotalYield: 358.33167225021515 },
    { id: 4, Year: 2024, Quarter: 4, TotalYield: 412.4567321940287 }, // Fake data for Q4
];

const quartersMapping = {
    1: "Jan - Mar",
    2: "Apr - Jun",
    3: "Jul - Sep",
    4: "Oct - Dec",
};

function ViewSYield() {
    const [selectedMetrics, setSelectedMetrics] = useState({
        TotalYield: true,
    });

    const xAxisData = fakeWeatherData.map(
        (data) => `${quartersMapping[data.Quarter]} ${data.Year}`
    );
    const totalYieldData = fakeWeatherData.map((data) => data.TotalYield);

    const chartData = {
        labels: xAxisData,
        datasets: [
            {
                label: "Total Yield",
                data: totalYieldData,
                borderColor: "#FF5733",
                backgroundColor: "rgba(255, 87, 51, 0.5)",
                fill: true,
                tension: 0.4, // Adds a smooth curve
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Quarter",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Total Yield",
                },
            },
        },
    };

    const { setActivePage } = useContext(CategoryContext);

    useEffect(() => {
        setActivePage(3);
    }, []);

    return (
        <Box my="1rem">
            <Card>
                <CardContent>
                    <>
                        <CardTitle
                            title="Quarterly Yield Overview"
                            icon={<BackpackRounded />}
                        />
                        <Box
                            style={{ width: "88%", marginTop: "-20px", display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto", }}
                        >
                            <Line data={chartData} options={chartOptions} />
                        </Box>
                    </>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ViewSYield;
