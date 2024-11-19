import { useState } from 'react'
import { useElements, PaymentElement, useStripe } from '@stripe/react-stripe-js'
import { DialogContent, DialogActions, Button, Divider, Box, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

function PaymentForm(props) {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const elements = useElements();
    const stripe = useStripe();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: location.protocol + '//' + location.host + "/profile",
            },
            redirect: "if_required",
        }).then((result) => {
            console.log(result);
            if (result.error) {
                // Show error to your customer (e.g., insufficient funds)
                enqueueSnackbar(result.error.message, { variant: "error" });
            } else {
                // The payment has been processed!
                if (result.paymentIntent.status === "succeeded" || result.paymentIntent.status === "processing") {
                    // I set up the webhook on the backend to handle the topup, no action needed here
                    enqueueSnackbar("Top-up successful!", { variant: "success" });
                    props.onClose();
                } else {
                    enqueueSnackbar("Top-up is not successful!", { variant: "error" });
                }
            }
            setLoading(false);
        });
    }

    const paymentElementOptions = {
        layout: "tabs"
    }

    return (
        <>
            <form id="payment-form" onSubmit={handleSubmit}>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <Box>
                        <Typography variant="body2" fontWeight={700}>Total Payable</Typography>
                        <Typography variant="h5" mt={1} fontWeight={700}>S${props.amount}</Typography>
                    </Box>
                    <Divider sx={{my: "1rem"}} />
                    <PaymentElement options={paymentElementOptions} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton id='submit' type="submit" loadingPosition="start" loading={loading} variant="text" color="primary" startIcon={<AddIcon />}>Pay</LoadingButton>
                </DialogActions>
            </form>
        </>
    )
}

export default PaymentForm