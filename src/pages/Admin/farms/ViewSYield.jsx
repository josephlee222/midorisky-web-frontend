import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { BackpackRounded } from "@mui/icons-material";
import CardTitle from "../../../components/CardTitle";

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

    const series = [];
    if (selectedMetrics.TotalYield) {
        series.push({
            label: "Total Yield",
            data: totalYieldData,
            color: "#FF5733",
        });
    }

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
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={2}
                        >
                        </Box>

                        <Typography
                            variant="h6"
                            align="center"
                            color="textPrimary"
                            gutterBottom
                        >
                            Yield Metrics Over Time
                        </Typography>

                        <Box my="2rem" style={{ height: "500px", width: "100%" }}>
                            <LineChart
                                xAxis={[
                                    {
                                        label: "Quarter",
                                        data: xAxisData,
                                        scaleType: "point", // Ensure the scale type is appropriate for categorical data
                                    },
                                ]}
                                yAxis={[
                                    {
                                        label: "Total Yield",
                                        min: 0, // Optional: Set a minimum value for better visibility
                                    },
                                ]}
                                series={series}
                                height={500}
                            />
                        </Box>
                    </>
                </CardContent>
            </Card>
        </Box>
    );
}

export default ViewSYield;
