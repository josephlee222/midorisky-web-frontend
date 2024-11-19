import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button, TextField, Stack, Box, InputAdornment } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { loadStripe } from "@stripe/stripe-js/pure";
import { Elements } from "@stripe/react-stripe-js"
import { useSnackbar } from 'notistack'
import http from '../http'
import { useNavigate } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PaymentForm from './PaymentForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function TopUpDialog(props) {
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(0);
    const [payment, setPayment] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const topupFormik = useFormik(
        {
            initialValues: {
                amount: "",
            },
            validationSchema: yup.object({
                amount: yup.number().required("Amount is required").min(1, "Amount must be greater than S$0").max(1000, "Cannot top-up above S$1000").typeError("Amount must be a number"),
            }),
            onSubmit: (data) => {
                setLoading(true);
                data.amount = parseFloat(data.amount).toFixed()
                var url = "/User/Wallet/Topup?amount=" + data.amount
                if (props.gift) {
                    url += "&type=Gift"
                }
                http.get(url).then((res) => {
                    if (res.status === 200) {
                        setClientSecret(res.data.clientSecret);
                        setAmount(res.data.amount);
                        setLoading(false);
                        setPayment(true);
                    }
                }).catch((err) => {
                    enqueueSnackbar("Top-up failed! " + err.response.data.message, { variant: "error" });
                })
            }
        }
    )

    const handleClose = () => {
        props.onClose();
        setPayment(false);
    }

    useEffect(() => {
        topupFormik.values.amount = props.amount;
    }, [props.amount])

    const appearance = {
        theme: "stripe",
        variables: {
            colorPrimary: '#E8533F',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Nunito, Ideal Sans, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '25px',
        },
    }

    // Stripe element options with poppins font
    const elementOptions = { 
        clientSecret: clientSecret,
        fonts: [
            {
                cssSrc: 'https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Nunito:wght@300;400;500;600;700',
            },
        ],
        appearance: appearance,
     };


    return (
        <>
            <Dialog maxWidth={"sm"} fullWidth open={props.open} onClose={handleClose}>
                <DialogTitle>{!props.gift ? "Top-up Wallet" : "Purchase Gift Code"}</DialogTitle>
                {!payment &&
                    <Box component="form" onSubmit={topupFormik.handleSubmit}>
                        <DialogContent sx={{ paddingTop: 0 }}>
                            <DialogContentText>
                                {!props.gift ? "Enter the amount you want to top-up to your wallet" : "Enter the amount you want to gift"}
                            </DialogContentText>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="amount"
                                label={!props.gift ? "Top-up Amount" : "Gift Amount"}
                                type="amount"
                                name="amount"
                                fullWidth
                                variant="standard"
                                value={topupFormik.values.amount}
                                onChange={topupFormik.handleChange}
                                error={topupFormik.touched.amount && Boolean(topupFormik.errors.amount)}
                                helperText={topupFormik.touched.amount && topupFormik.errors.amount}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">S$</InputAdornment>,
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} startIcon={<CloseIcon />}>Cancel</Button>
                            <LoadingButton type="submit" loadingPosition="start" loading={loading} variant="text" color="primary" startIcon={<AddIcon />}>
                                {!props.gift ? "Top-up" : "Purchase Gift"}
                            </LoadingButton>
                        </DialogActions>
                    </Box>
                }
                {payment &&
                    <Elements options={elementOptions} stripe={stripePromise}>
                        <PaymentForm onClose={handleClose} clientSecret={clientSecret} amount={(amount/100).toFixed(2)} />
                    </Elements>
                }
            </Dialog>
        </>
    )
}

export default TopUpDialog