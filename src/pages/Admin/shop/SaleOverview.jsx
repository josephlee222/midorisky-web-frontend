import React, { useEffect, useState, useContext } from 'react'
import { Box, Card, CardContent, Chip, Grid, Skeleton, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { CategoryContext } from './AdminShopRoutes';
import CardTitle from '../../../components/CardTitle';
import { BarChartRounded, DoneRounded, PendingRounded, Person, TableRowsRounded, VisibilityRounded } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import http from '../../../http'

function getChipProps(params) {
    return {
        label: params.value,
    };
}

function SaleOverview() {
    const [users, setUsers] = useState([])
    const [sales, setSales] = useState({})
    const [loading, setLoading] = useState(true)
    const nf = new Intl.NumberFormat();
    const navigate = useNavigate()
    const { setActivePage } = useContext(CategoryContext);
    const columns = [
        { field: 'id', headerName: 'ID', width: 100, type: 'number' },
        {
            field: 'settled', headerName: 'Status', minWidth: 120, renderCell: (params) => {
                return <Chip variant="filled" size="small" icon={params.value ? <DoneRounded /> : <PendingRounded />} label={params.value ? "Done" : "Incomplete"} color={params.value ? "success" : "warning"} />;
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
                    icon={<VisibilityRounded />}
                    label="View Details"
                    onClick={() => {
                        navigate("/profile/transaction/" + params.row.id)
                    }}
                />
            ]
        },
    ];
    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }
    titleHelper("Sales Overview")

    const getSales = () => {
        http.get('/Admin/Shop/Sales').then((res) => {
            setSales(res.data)
            setLoading(false)
        })
    }

    useEffect(() => {
        setActivePage(1)
        getSales()
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Card sx={{ mb: "1rem" }}>
                    <CardContent>
                        <CardTitle title="Sales Overview" icon={<BarChartRounded />} />
                        <Grid container spacing={2} mt={"0"}>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <CardContent sx={{ color: "primary.main" }}>
                                        <Typography variant='h3' fontWeight={700}>
                                            {!sales?.transactionMoney24 && <Skeleton variant="text" width={"100px"} />}
                                            {sales?.transactionMoney24 && "$" + nf.format(sales?.transactionMoney24)}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700}>Money In</Typography>
                                        <Typography variant="body1">Last 24 Hours</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <CardContent sx={{ color: "primary.main" }}>
                                        <Typography variant='h3' fontWeight={700}>
                                            {!sales?.transactionMoney && <Skeleton variant="text" width={"100px"} />}
                                            {sales?.transactionMoney && "$" + nf.format(sales?.transactionMoney)}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700}>Money In</Typography>
                                        <Typography variant="body1">Last 30 Days</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={12} xl={4}>
                                <Card sx={{ backgroundColor: "#fff" }}>
                                    <CardContent sx={{ color: "primary.main" }}>
                                        <Typography variant='h3' fontWeight={700}>
                                            {!sales?.transactionMoneyLifetime && <Skeleton variant="text" width={"100px"} />}
                                            {sales?.transactionMoneyLifetime && "$" + nf.format(sales?.transactionMoneyLifetime)}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700}>Money In</Typography>
                                        <Typography variant="body1">Lifetime</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <CardTitle title="Overall Topup/Gift Transactions" icon={<TableRowsRounded />} />
                        <Box mt={"1rem"}>
                            <DataGrid
                                rows={sales.transactions ? sales.transactions : []}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10]}
                                loading={loading}
                                autoHeight
                                slots={{ toolbar: customToolbar }}
                                initialState={{
                                    sorting: {
                                        sortModel: [{ field: 'id', sort: 'desc' }],
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

        </>
    )
}

export default SaleOverview