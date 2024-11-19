import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, CardContent, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../../http';
import { CategoryContext } from './AdminActivitiesRoutes';
import titleHelper from '../../../functions/helpers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import DateCalendarServerRequest from '../../../components/CustomDateCalendar'; // Import the DateCalendarServerRequest component
import DeleteIcon from '@mui/icons-material/Delete';

function CreateAvailability() {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { id: activityId } = useParams();
    const { setActivePage } = useContext(CategoryContext);
    const [availabilities, setAvailabilities] = useState([]);
    const [activity, setActivity] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [maxPax, setMaxPax] = useState('');
    const [currentPax, setCurrentPax] = useState('');
    const [price, setPrice] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [existingAvailability, setExistingAvailability] = useState(null);



    titleHelper("Set availabilities");

    const handleGetAvailabilities = () => {
        //`/Admin/Availability/Activity/${activityId}`
        http.get(`/Admin/Availability/Activity/${activityId}`).then((res) => {
            if (res.status === 200) {
                setAvailabilities(res.data)
                setLoading(false)

                console.log(res.data);
            }
        })

    }

    const handleGetActivity = () => {
        http.get(`/Activity/${activityId}`).then((res) => {
            if (res.status === 200) {
                setActivity(res.data);
            }
        });
    };

    useEffect(() => {
        handleGetAvailabilities();
        handleGetActivity();
        setActivePage(2);
    }, []);

    const handleDialogClose = () => {
        setMaxPax('');
        setPrice('');
        setDialogOpen(false);
    };

    const handleDateSelection = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours to 0 for accurate comparison

        // Check if the selected date is after today
        if (date <= today) {
            enqueueSnackbar("Please select a date after today.", { variant: "error" });
            return;
        }



        let jsDate;

        // Check if the date object is a Moment.js object or similar
        if (typeof date === 'object' && date.isValid && typeof date.isValid === 'function') {
            // Convert the Moment.js object to a JavaScript Date object
            jsDate = date.toDate();
        } else if (date instanceof Date && !isNaN(date)) {
            // If it's already a JavaScript Date object, use it directly
            jsDate = date;
        } else {
            console.error("Invalid date object:", date);
            return;
        }
        const selectedDateUTC = date.toISOString().split('T')[0];

        // Check if an availability exists for the selected date
        const existingAvailability = availabilities.find(availability => {
            // Convert availability date to UTC string format for comparison
            const availabilityDate = new Date(availability.date);
            const availabilityDateUTC = new Date(Date.UTC(
                availabilityDate.getFullYear(),
                availabilityDate.getMonth(),
                availabilityDate.getDate()
            )).toISOString().split('T')[0];

            // Compare dates
            return availabilityDateUTC === selectedDateUTC;
        });

        console.log(existingAvailability);

        setSelectedDate(date);
        setExistingAvailability(existingAvailability);

        if (existingAvailability) {
            // If an availability exists for the selected date, populate the dialog fields with existing data
            setMaxPax(existingAvailability.maxPax);
            setPrice(existingAvailability.price);
            setCurrentPax(existingAvailability.currentPax);
        } else {
            setSelectedDate(jsDate); // Set the selected date

        }
        setDialogOpen(true);
    };


    const handleSaveAvailability = () => {
        var requestData = {}

        if (currentPax) {
            requestData = {
                "ActivityId": activityId,
                "Date": selectedDate,
                "MaxPax": maxPax,
                "Price": price,
                "CurrentPax": currentPax,
            };
        }
        else {
            requestData = {
                "ActivityId": activityId,
                "Date": selectedDate,
                "MaxPax": maxPax,
                "Price": price,
                "CurrentPax": 0,
            };
        }





        if (selectedDate && existingAvailability) {
            // If an existing availability is being edited, send a PUT request
            http.put(`/Admin/Availability/${existingAvailability.id}`, requestData)
                .then((res) => {
                    if (res.status === 200) {
                        enqueueSnackbar("Availability updated successfully!", { variant: "success" });
                        handleGetAvailabilities();
                    } else {
                        enqueueSnackbar("Failed to update availability.", { variant: "error" });
                    }
                })
                .catch((err) => {
                    enqueueSnackbar("Failed to update availability: " + err.response.data.error, { variant: "error" });
                });
        } else {
            // If creating a new availability, send a POST request
            http.post("/Admin/Availability", requestData)
                .then((res) => {
                    if (res.status === 200) {
                        enqueueSnackbar("Availability created successfully!", { variant: "success" });
                        handleGetAvailabilities();
                    } else {
                        enqueueSnackbar("Failed to create availability.", { variant: "error" });
                    }
                })
                .catch((err) => {
                    enqueueSnackbar("Failed to create availability: " + err.response.data.error, { variant: "error" });
                });
        }

        handleDialogClose();
    };

    const handleDelete = () => {
        if (!existingAvailability) {
            // If there's no existing availability, close the dialog and show a Snackbar message
            enqueueSnackbar("There is no availability to delete.", { variant: "info" });
            handleDialogClose(); // Close the dialog
        } else {
            // If there's an existing availability, send a delete request
            http.delete(`/Admin/Availability/${existingAvailability.id}`)
                .then((res) => {
                    if (res.status === 200) {
                        enqueueSnackbar("Availability deleted successfully!", { variant: "success" });
                        handleGetAvailabilities(); // Refresh availabilities
                    } else {
                        enqueueSnackbar("Failed to delete availability.", { variant: "error" });
                    }
                })
                .catch((err) => {
                    enqueueSnackbar("Failed to delete availability: " + err.response.data.error, { variant: "error" });
                });
            handleDialogClose(); // Close the dialog
        }
    };



    return (
        <Box sx={{ marginY: "1rem" }}>
            <Card>
                <Typography variant="h5" sx={{ margin: "1.5rem" }}>
                    Availabilities for {activity.name}
                </Typography>
                <CardContent>
                    <Box component="form" mt={3}>
                        {/* Use DateCalendarServerRequest component */}
                        <DateCalendarServerRequest
                            onChange={handleDateSelection}
                            activityId={activityId}
                            availabilities={availabilities} // Pass the availabilities array
                            setDialogOpen={setDialogOpen}
                            big
                        />
                    </Box>
                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                        <DialogTitle>Add Availability</DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" gutterBottom>Add a new availability to this date</Typography>
                            <TextField
                                label="Max Pax"
                                variant="outlined"
                                fullWidth
                                value={maxPax}
                                onChange={(e) => setMaxPax(e.target.value)}
                                margin="dense"
                            />
                            <TextField
                                label="Price"
                                variant="outlined"
                                fullWidth
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                margin="dense"
                            />
                            <DeleteIcon onClick={handleDelete} />


                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose}>Cancel</Button>
                            <Button onClick={handleSaveAvailability}>Save</Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        </Box>
    );
}

export default CreateAvailability;