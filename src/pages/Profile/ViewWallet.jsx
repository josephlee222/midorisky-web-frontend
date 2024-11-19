import { useContext, useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography, Button, DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import { AddRounded, CheckRounded, CloseRounded, NewspaperRounded, PersonRounded, SearchRounded } from "@mui/icons-material";
import InfoBox from "../../components/InfoBox";
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcardRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import PinRoundedIcon from '@mui/icons-material/PinRounded';
import TopUpDialog from "../../components/TopUpDialog";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ProfilePicture from "../../components/ProfilePicture";
import http from "../../http";
import { useSnackbar } from "notistack";



export default function ViewWallet() {
    const { setActivePage } = useContext(ProfileContext);
    const { user, setUser } = useContext(AppContext);
    const [topupOpen, setTopupOpen] = useState(false);
    const [isGift, setIsGift] = useState(false);
    const [redeemOpen, setRedeemOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gift, setGift] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleTopupClose = () => {
        setTopupOpen(false);
    }

    const handleTopupOpen = () => {
        setIsGift(false);
        setTopupOpen(true);
    }

    const handleGiftOpen = () => {
        setIsGift(true);
        setTopupOpen(true);
    }

    const handleRedeemClose = () => {
        setGift(null);
        setRedeemOpen(false);
    }

    const handleRedeemOpen = () => {
        setRedeemOpen(true);
    }

    const redeemFormik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Gift code is required").max(16, "Gift code is too long").min(16, "Gift code is too short"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            http.get("/Shop/Redeem/" + data.code).then((res) => {
                if (res.status === 200) {
                    setGift(res.data);
                    setLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Unable to check! " + err.response.data.error, { variant: "error" });
                setLoading(false);
            })
        }
    })

    const handleRedeem = () => {
        setLoading(true);
        http.get("/Shop/Redeem/" + redeemFormik.values.code + "/Confirm").then((res) => {
            if (res.status === 200) {
                setRedeemOpen(false);
                setGift(null);
                setLoading(false);
            }
        }).catch((err) => {
            enqueueSnackbar("Unable to redeem! " + err.response.data.error, { variant: "error" });
            setLoading(false);
        })
    }

    useEffect(() => {
        setActivePage(3);
        document.title = "Wallet & Gifts - UPlay"
    }, [])

    return (
        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Wallet Balance" icon={<AccountBalanceWalletRoundedIcon />} />
                    <Typography variant="body2" mt={3} fontWeight={700}>Current Balance</Typography>
                    <Typography variant="h4" mt={1} fontWeight={700}>${user && user.balance.toFixed(2)}</Typography>
                    <Box sx={{ mt: "1rem", display: "flex" }}>
                        <Button variant="contained" sx={{ mr: ".5rem", flexGrow: 1, flexBasis: 0 }} startIcon={<AddCardRoundedIcon />} onClick={handleTopupOpen}>Top-Up Wallet</Button>
                        <Button variant="secondary" sx={{ ml: ".5rem", flexGrow: 1, flexBasis: 0 }} startIcon={<HistoryRoundedIcon />} LinkComponent={Link} to="/profile/transactions">View Transaction History</Button>
                    </Box>
                </CardContent>
            </Card>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="UPlay Gifts" icon={<CardGiftcardIcon />} />
                    <Typography variant="body1" mt={3}>UPlay Gifts lets you purchase a gift code for you to give to someone else. You can also redeem gift codes that you have received. </Typography>
                    <Box sx={{ mt: "1rem", display: "flex" }}>
                        <Button variant="contained" sx={{ mr: ".5rem", flexGrow: 1, flexBasis: 0 }} startIcon={<CardGiftcardIcon />} onClick={handleGiftOpen}>Purchase a Gift Code</Button>
                        <Button variant="secondary" sx={{ ml: ".5rem", flexGrow: 1, flexBasis: 0 }} startIcon={<PinRoundedIcon />} onClick={handleRedeemOpen}>Redeem a Gift Code</Button>
                    </Box>
                </CardContent>
            </Card>
            <TopUpDialog open={topupOpen} onClose={handleTopupClose} gift={isGift} />
            <Dialog open={redeemOpen} onClose={handleRedeemClose} maxWidth={"sm"} fullWidth>
                <form onSubmit={redeemFormik.handleSubmit}>
                    <DialogTitle>Redeem Gift Code</DialogTitle>
                    <DialogContent>
                        {!gift ?
                            <>
                                <DialogContentText>
                                    Enter the gift code you have received to redeem it.
                                </DialogContentText>
                                <TextField
                                    fullWidth
                                    id="code"
                                    name="code"
                                    label="Gift Code"
                                    variant="standard"
                                    value={redeemFormik.values.code}
                                    onChange={redeemFormik.handleChange}
                                    error={redeemFormik.touched.code && Boolean(redeemFormik.errors.code)}
                                    helperText={redeemFormik.touched.code && redeemFormik.errors.code}
                                    sx={{ mt: "1rem"}}
                                />
                            </>
                            :
                            <>
                                <Box display="flex" alignItems={"center"}>
                                    <ProfilePicture user={gift.user} sx={{ width: "48px", height: "48px" }} />
                                    <Box ml={"1rem"}>
                                        <Typography variant="h6" fontWeight={700}>{gift.user.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Amount: ${gift.amount}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" mt={"1rem"}>
                                    Are you sure you want to redeem this gift code?
                                </Typography>
                            </>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleRedeemClose} startIcon={<CloseRounded/>}>Cancel</Button>
                        {!gift ?
                            <LoadingButton type="submit" loadingPosition="start" loading={loading} variant="text" color="primary" startIcon={<SearchRounded />}>
                                Check Gift Code
                            </LoadingButton>
                            :
                            <LoadingButton loading={loading} variant="text" color="primary" startIcon={<CheckRounded />} onClick={handleRedeem}>
                                Redeem Gift
                            </LoadingButton>
                        }
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}