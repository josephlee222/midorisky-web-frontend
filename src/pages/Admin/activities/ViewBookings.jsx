import React, { useEffect, useState, useContext } from 'react'
import { Chip, Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { CategoryContext } from './AdminActivitiesRoutes';
import CardTitle from '../../../components/CardTitle';
import { BackpackRounded, EditCalendarRounded, Person } from '@mui/icons-material';
import moment from 'moment';
import titleHelper from '../../../functions/helpers';

function getChipProps(params) {
    return {
        label: params.value,
    };
}



function ViewBookings() {
    const [Activities, setActivities] = useState([])
    const [Bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [deactivateLoading, setDeactivateLoading] = useState(null)
    const [deactivateActivityDialog, setDeactivateActivityDialog] = useState(false)
    const [deactivateActivity, setDeactivateActivity] = useState(null)
    const { id: activityId } = useParams();
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("View Bookings")
    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'date', headerName: 'Date', width: 200, valueFormatter: params => moment(params?.value).format("DD/MM/YYYY"), },
        { field: 'pax', headerName: 'pax', flex: 1, minWidth: 250 },
    ]

    const handleDeactivateActivityDialogClose = () => {
        setDeactivateActivityDialog(false)
    }

    const handleDeactivateActivityDialogOpen = () => {
        setDeactivateActivityDialog(true)
    }

    const handleDeactivateActivity = () => {
        setDeactivateLoading(true)
        http.delete("/Admin/Activity/" + deactivateActivity.id).then((res) => {
            if (res.status === 200) {
                setDeactivateLoading(false)
                setDeactivateActivityDialog(false)
                handleGetActivities()
            }
        })
    }

    const handleGetActivities = () => {
        http.get("/Admin/Activity/" + activityId).then((res) => {
            if (res.status === 200) {
                setActivities(res.data)
                setLoading(false)
            }
        })
    }

    const handleGetBookings = () => {
        http.get("/Admin/Availability/Activity/" + activityId).then((res) => {
            console.log(res.status)
            if (res.status === 200) {
                var Bookings = []
                console.log(res.data)
                for (let i = 0; i < res.data.length; i++) {
                    for (let j = 0; j < res.data[i].bookings.length; j++) {
                        console.log(res.data[i].bookings[j])
                        Bookings.push(res.data[i].bookings[j])
                    }
                }

                console.log(Bookings)

                setBookings(Bookings)
                setLoading(false)
            }
        })
    }

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {
        setActivePage(1)
        handleGetActivities()
        handleGetBookings()
    }, [])
    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title={`Booking List for ${Activities.name}`} icon={<BackpackRounded />} />
                        <DataGrid
                            rows={Bookings}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.name}
                            slots={{ toolbar: customToolbar }}
                            sx={{ mt: "1rem" }}
                        />
                    </CardContent>
                </Card>

            </Box>
        </>
    )
}

export default ViewBookings