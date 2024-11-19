import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Chip } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import CardTitle from '../../components/CardTitle'
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LabelIcon from '@mui/icons-material/Label';
import http from '../../http'
import { DoneRounded, HistoryRounded, PendingRounded } from '@mui/icons-material';

export default function ViewTransactions() {

    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const date = new Date()
    const navigate = useNavigate()
    const columns = [
        { field: 'id', headerName: 'ID', width: 100, type: 'number' },
        {
            field: 'settled', headerName: 'Status', minWidth: 120, renderCell: (params) => {
                return <Chip variant="filled" size="small" icon={params.value ? <DoneRounded/> : <PendingRounded/>} label={params.value ? "Done" : "Incomplete"} color={params.value ? "success" : "warning"}  />;
            },
            
            type: 'boolean',
        },
        { field: 'type', headerName: 'Type', type: 'string', minWidth: 100, flex: 1, },
        { field: 'description', headerName: 'Notes', type: 'string', minWidth: 200 },
        { field: 'amount', headerName: 'Amount Paid ($)', type: 'number', minWidth: 150, valueFormatter: (params) => `$${params.value.toLocaleString()}` },
        { field: 'createdAt', headerName: 'Created On', type: 'dateTime', minWidth: 200, valueFormatter: (params) => new Date(params.value).toLocaleString() },
        {
            field: 'actions', type: 'actions', width: 40, getActions: (params) => [
                <GridActionsCellItem
                    icon={<VisibilityIcon />}
                    label="View Details"
                    onClick={() => {
                        navigate("/profile/transaction/" + params.row.id)
                    }}
                />
            ]
        },
    ];

    const getTransactions = async () => {
        const response = await http.get('/User/Transactions')
        setTransactions(response.data)
        setLoading(false)
    }

    useEffect(() => {
        document.title = "Transaction History - UPlay"
        getTransactions()
    }, [])

    return (
        <>
            <Card sx={{mt: "1rem"}}>
                <CardContent>
                    <CardTitle icon={<HistoryRounded />} title="Transaction History" />
                    <Box mt={"1rem"}>
                        <DataGrid
                            rows={transactions}
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
        </>
    )
}