import React, { useEffect, useState, useContext } from 'react'
import { Chip, Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { CategoryContext } from './AdminShopRoutes';
import CardTitle from '../../../components/CardTitle';
import { BackpackRounded, ConfirmationNumberRounded, EditCalendarRounded, Person } from '@mui/icons-material';
import moment from 'moment';
import titleHelper from '../../../functions/helpers';

function getChipProps(params) {
    return {
        label: params.value,
    };
}



function ViewCoupons() {
    const [Coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [deactivateLoading, setDeactivateLoading] = useState(null)
    const [deactivateActivityDialog, setDeactivateActivityDialog] = useState(false)
    const [deactivateActivity, setDeactivateActivity] = useState(null)
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    titleHelper("View Coupons")
    const columns = [
        { field: 'code', headerName: 'Code', width: 200 },
        { field: 'expiry', headerName: 'Expiry Date', width: 200, valueFormatter: params => moment(params?.value).format("DD/MM/YYYY"), },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
        { field: 'discountType', headerName: 'Discount Type', minWidth: 100 },
        { field: 'discountAmount', headerName: 'Discount Amount', minWidth: 100 }

        ,

        {
            field: 'actions', type: 'actions', width: 40, getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit Coupon"
                    onClick={() => {
                        navigate("/admin/shop/coupons/" + params.row.id)
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Coupon"
                    onClick={() => {
                        setDeactivateActivity(params.row)
                        handleDeactivateActivityDialogOpen()
                    }}
                    showInMenu
                />,
            ]
        },
    ];

    const handleDeactivateActivityDialogClose = () => {
        setDeactivateActivityDialog(false)
    }

    const handleDeactivateActivityDialogOpen = () => {
        setDeactivateActivityDialog(true)
    }

    const handleDeactivateActivity = () => {
        setDeactivateLoading(true)
        http.delete("/Admin/Coupon/" + deactivateActivity.id).then((res) => {
            if (res.status === 200) {
                setDeactivateLoading(false)
                setDeactivateActivityDialog(false)
                handleGetCoupons()
            }
        })
    }

    const handleGetCoupons = () => {
        http.get("/Admin/Coupon/").then((res) => {
            if (res.status === 200) {
                setCoupons(res.data)
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
        setActivePage(3)
        handleGetCoupons()
    }, [])
    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card>
                    <CardContent>
                        <CardTitle title="Coupon List" icon={<ConfirmationNumberRounded />} />
                        <DataGrid
                            rows={Coupons}
                            columns={columns}
                            pageSize={10}
                            loading={loading}
                            autoHeight
                            getRowId={(row) => row.code}
                            slots={{ toolbar: customToolbar }}
                            sx={{ mt: "1rem" }}
                        />
                    </CardContent>
                </Card>

            </Box>
            <Dialog open={deactivateActivityDialog} onClose={handleDeactivateActivityDialogClose}>
                <DialogTitle>Delete Coupon</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to deactivate this coupon?
                        <br />
                        Coupon Details:
                        <ul>
                            <li>Code: {deactivateActivity?.code}</li>
                            <li>Description: {deactivateActivity?.description}</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeactivateActivityDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deactivateLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeactivateActivity}>Deactivate</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ViewCoupons