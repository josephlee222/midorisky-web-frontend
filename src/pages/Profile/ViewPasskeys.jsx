import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import CardTitle from '../../components/CardTitle'
import http from '../../http'
import { CloseRounded, DeleteRounded, HistoryRounded, KeyRounded } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import LoadingButton from '@mui/lab/LoadingButton';

export default function ViewPasskeys() {

    const [passkeys, setPasskeys] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const date = new Date()
    const navigate = useNavigate()
    const columns = [
        { field: 'id', headerName: 'ID', width: 100, type: 'number' },
        { field: 'deviceName', headerName: 'Device Description', type: 'string', minWidth: 150, flex: 1, },
        {
            field: 'actions', type: 'actions', width: 40, getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteRounded />}
                    label="Remove Passkey"
                    onClick={() => {
                        setDeleteId(params.row.id)
                        setDeleteDialog(true)
                    }}
                />
            ]
        },
    ];

    const getPasskeys = async () => {
        const response = await http.get('/User/Passkey/Devices')
        setPasskeys(response.data)
        setLoading(false)
    }

    const handleDeletePasskey = () => {
        setDeleteLoading(true)
        http.delete('/User/Passkey/Devices/' + deleteId).then((res) => {
            enqueueSnackbar("Successfully deleted passkey", { variant: "success" });
            getPasskeys()
            setDeleteLoading(false)
            setDeleteDialog(false)
        }).catch((err) => {
            enqueueSnackbar("Unable to delete passkey! " + err.response.data.error, { variant: "error" });
            setLoading(false);
            setDeleteLoading(false)
        })
    }

    const handleDeleteClose = () => {
        setDeleteDialog(false)
    }

    useEffect(() => {
        getPasskeys()
    }, [])

    return (
        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle icon={<KeyRounded />} title="Manage Passkeys" />
                    <Box mt={"1rem"}>
                        <DataGrid
                            rows={passkeys}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10]}
                            loading={loading}
                            autoHeight
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'id', sort: 'desc' }],
                                },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
            <Dialog open={deleteDialog} onClose={handleDeleteClose}>
                <DialogTitle>Delete Passkey</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to delete this passkey? You will not be able to login with this device again.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton loadingPosition="start" loading={deleteLoading} variant="text" color="error" startIcon={<DeleteRounded />} onClick={handleDeletePasskey}>Delete</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}