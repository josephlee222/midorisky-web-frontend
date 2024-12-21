import { useContext, useEffect, useState } from "react";
import { Box, Card, CardActions, CardContent, Grid, Typography, Button, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Stepper, Step, StepLabel, Alert } from "@mui/material";
import { AppContext } from "../../App";
import { ProfileContext } from "./ProfileRoutes";
import CardTitle from "../../components/CardTitle";
import { AddLinkRounded, ArrowBackRounded, ArrowForwardRounded, CheckRounded, CloseRounded, Info, Key, KeyOffRounded, KeyRounded, LinkOffRounded, LinkRounded, LockRounded, ManageAccountsRounded, PinRounded, SecurityRounded, WarningRounded } from "@mui/icons-material";
import InfoBox from "../../components/InfoBox";
import { useSnackbar } from "notistack";
import http from "../../http";
import { LoadingButton } from "@mui/lab";
import { Link, json } from "react-router-dom";
import { coerceToArrayBuffer, coerceToBase64Url } from "../../functions/fidoHelpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { setUpTOTP, verifyTOTPSetup, updateMFAPreference, fetchMFAPreference } from "aws-amplify/auth";
import QRCode from "qrcode";
import { useTheme } from "@emotion/react";
import titleHelper from "../../functions/helpers";


export default function ViewSecurity() {
    const { setActivePage } = useContext(ProfileContext);
    const { user } = useContext(AppContext);
    const { enqueueSnackbar } = useSnackbar();
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [PasskeyDialog, setPasskeyDialog] = useState(false);
    const [FAEnabled, setFAEnabled] = useState(false);
    const [FALoading, setFALoading] = useState(false);
    const [showSetup2fa, setShowSetup2fa] = useState(false);
    const [showDisable2fa, setShowDisable2fa] = useState(false);
    const [showBackup, setShowBackup] = useState(false);
    const [faStep, setFaStep] = useState(0);
    const [qrCode, setQrCode] = useState("");
    const [faPreferenceLoading, setFAPreferenceLoading] = useState(true);
    const theme = useTheme();

    const verifyFormik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Code is required"),
        }),
        onSubmit: async (values) => {
            try {
                setFALoading(true);
                await verifyTOTPSetup({ code: values.code });
                await updateMFAPreference({
                    totp: "PREFERRED"
                });
                setFAEnabled(true);
                setFALoading(false);
                setFaStep(2);
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Failed to verify TOTP. " + e.message, { variant: "error" });
                setFALoading(false);
                return;
            }
        }
    });

    useEffect(() => {
        setActivePage(4);

        fetchMFAPreference().then((res) => {
            if (res.enabled) {
                if (res.enabled.includes("TOTP")) {
                    setFAEnabled(true);
                }
            }

            setFAPreferenceLoading(false);
        }).catch((err) => {
            console.log(err);
            enqueueSnackbar("Failed to fetch MFA preference. " + err, { variant: "error" });
        })
    }, [])

    const handlePasskeyDialogOpen = () => {
        setPasskeyDialog(true);
    }

    const handlePasskeyDialogClose = () => {
        setPasskeyDialog(false);
    }

    const handlePasskeySetup = async (password) => {
        setPasskeyLoading(true);

        // try {
        //     var credentials = await http.post("/User/Passkey/Setup", {password: password});
        // } catch (e) {
        //     console.log(e);
        //     enqueueSnackbar("Failed to setup passkey. " + e.response.data.error, { variant: "error" });
        //     setPasskeyLoading(false);
        //     return;
        // }

        // credentials = credentials.data;
        // var rawCredentials = credentials;
        // console.log("Credential Options Object", credentials);  // DEBUG


        // // Turn the challenge back into the accepted format of padded base64
        // credentials.challenge = coerceToArrayBuffer(credentials.challenge);
        // // Turn ID into a UInt8Array Buffer for some reason
        // credentials.user.id = coerceToArrayBuffer(credentials.user.id);

        // credentials.excludeCredentials = credentials.excludeCredentials.map((c) => {
        //     c.id = coerceToArrayBuffer(c.id);
        //     return c;
        // });


        // if (credentials.authenticatorSelection.authenticatorAttachment === null) credentials.authenticatorSelection.authenticatorAttachment = undefined;

        // var newCredential;
        // try {
        //     newCredential = await navigator.credentials.create({
        //         publicKey: credentials
        //     });
        // } catch (e) {
        //     var msg = "Could not create credentials in browser."
        //     enqueueSnackbar(msg, { variant: "error" });
        //     setPasskeyLoading(false);
        //     handlePasskeyDialogClose();
        //     return;
        // }

        // try {
        //     await handlePasskeySave(newCredential, rawCredentials);
        // } catch (e) {
        //     console.log(e);
        //     enqueueSnackbar("Failed to save passkey. " + e, { variant: "error" });
        //     setPasskeyLoading(false);
        //     return;
        // }
        setPasskeyLoading(false);
        handlePasskeyDialogClose();
    }

    titleHelper("Profile Security");

    const enable2FA = async () => {
        // TOTP Setup
        try {
            setFaStep(0);
            setFALoading(true);
            var options = await setUpTOTP();
            console.log("TOTP Setup Options", options);
            var uri = options.getSetupUri("MidoriSKY Systems", user.name);
            console.log("TOTP Setup URI", uri);
            var qrCode = await QRCode.toDataURL(uri.href);

            setQrCode(qrCode);
            setFALoading(false);
            setShowSetup2fa(true);
        } catch (e) {
            console.log(e);
            enqueueSnackbar("Failed to setup TOTP. " + e.message, { variant: "error" });
            setPasskeyLoading(false);
            return;
        }
    }

    const disable2FA = async () => {
        setFALoading(true);
        try {
            await updateMFAPreference({
                totp: "DISABLED"
            });
            setFAEnabled(false);
            setShowDisable2fa(false);
            setFALoading(false);
            enqueueSnackbar("2FA disabled successfully!", { variant: "success" });
        } catch (e) {
            console.log(e);
            enqueueSnackbar("Failed to disable 2FA. " + e.message, { variant: "error" });
            setPasskeyLoading(false);
            return;
        }
    }

    const handleQrNext = async () => {
        if (faStep == 0) {
            setFaStep(1);
        } else if (faStep == 1) {
            verifyFormik.handleSubmit();
        } else if (faStep == 2) {
            // Save backup codes
            try {
                var response = await http.post("/User/2FA/Enable");
                console.log("2FA Enable Response", response);
                setFAEnabled(true);

                enqueueSnackbar("2FA enabled successfully!", { variant: "success" });
            } catch (e) {
                console.log(e);
                enqueueSnackbar("Failed to enable 2FA. " + e, { variant: "error" });
                setPasskeyLoading(false);
                return;
            }
        }
    }

    const handleQrBack = () => {
        if (faStep == 1) {
            setFaStep(0);
        }
    }


    const handlePasskeySave = async (newCredential, credentialsOptions) => {
        console.log("New Credential Object", newCredential);  // DEBUG
        let attestationObject = new Uint8Array(newCredential.response.attestationObject);
        let clientDataJSON = new Uint8Array(newCredential.response.clientDataJSON);
        let rawId = new Uint8Array(newCredential.rawId);

        const data = {
            id: newCredential.id,
            rawId: coerceToBase64Url(rawId),
            type: newCredential.type,
            extensions: newCredential.getClientExtensionResults(),
            response: {
                AttestationObject: coerceToBase64Url(attestationObject),
                clientDataJson: coerceToBase64Url(clientDataJSON)
            }
        };
        console.log("Cred Options", credentialsOptions);  // DEBUG
        credentialsOptions.user.id = coerceToBase64Url(credentialsOptions.user.id);
        credentialsOptions.challenge = coerceToBase64Url(credentialsOptions.challenge);
        credentialsOptions.excludeCredentials = credentialsOptions.excludeCredentials.map((c) => {
            c.id = coerceToBase64Url(c.id);
            return c;
        });
        let response;
        try {
            response = await http.post("/User/Passkey/Save", { AttestationResponse: data, Options: JSON.stringify(credentialsOptions) });
        } catch (e) {
            enqueueSnackbar("Failed to register passkey. " + e, { variant: "error" });
            return;
        }

        console.log("Credential Object", response);

        // show error
        if (response.status !== 200) {
            enqueueSnackbar("Failed to register passkey. " + response.errorMessage, { variant: "error" });
            return;
        }

        enqueueSnackbar("Passkey registered successfully!", { variant: "success" });
    }

    const formik = useFormik({
        initialValues: {
            password: "",
        },
        validationSchema: Yup.object({
            password: Yup.string().required("Password is required"),
        }),
        onSubmit: async (values) => {
            handlePasskeySetup(values.password);
        }
    });


    return (
        <>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle icon={<SecurityRounded />} title="2-Factor Authentication" />
                    <Box marginY={"1rem"}>
                        <Typography variant="body">
                            2-Factor Authentication (2FA) is an extra layer of security used to make sure that your account is only accessed by you. After you have enabled 2FA, you will be required to enter a unique code generated by an authenticator app on your phone, tablet or PC.
                        </Typography>
                        <br /><br />
                        <Typography variant="body">
                            This code will be required in addition to your password to log in to your account.
                        </Typography>
                        <br /><br />
                        <InfoBox flexGrow={1} title="2-Factor Authentication" value={FAEnabled ? "Enabled" : "Disabled"} boolean={FAEnabled} loading={faPreferenceLoading} />
                    </Box>
                </CardContent>
                <CardActions>
                    {!FAEnabled &&
                        <LoadingButton loading={FALoading} variant="text" color="primary" loadingPosition='start' startIcon={<LockRounded />} onClick={enable2FA}>Enable 2FA</LoadingButton>
                    }
                    {FAEnabled &&
                        <Button variant="text" color="error" startIcon={<LinkOffRounded />} onClick={() => { setShowDisable2fa(true) }}>Disable 2FA</Button>
                    }
                </CardActions>
            </Card>
            <Card sx={{ mt: "1rem" }}>
                <CardContent>
                    <CardTitle title="Passkey Access" icon={<KeyRounded />} />
                    <Typography variant="body1" mt={"1rem"}>Passkeys allows you to login into MidoriSKY without the need of a password by using your biometrics via mobile device or USB security key to verify your identity.</Typography>
                </CardContent>
                <CardActions>
                    <Button variant="text" color="primary" startIcon={<KeyRounded />} onClick={handlePasskeyDialogOpen}>Setup Passkey</Button>
                    <Button variant="text" color="primary" startIcon={<ManageAccountsRounded />} LinkComponent={Link} to="/profile/passkeys">Manage Passkeys</Button>
                </CardActions>
            </Card>
            <Dialog open={PasskeyDialog} onClose={handlePasskeyDialogClose}>
                <DialogTitle>Create New Passkey</DialogTitle>
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            To create a new passkey, please enter your password to verify your identity.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="Password"
                            type="password"
                            name="password"
                            fullWidth
                            variant="standard"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePasskeyDialogClose} startIcon={<CloseRounded />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={passkeyLoading} variant="text" color="primary" startIcon={<KeyRounded />}>Create Passkey</LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog maxWidth="sm" fullWidth open={showSetup2fa} onClose={() => { setShowSetup2fa(false) }}>
                <DialogTitle>Setup 2FA</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={faStep} alternativeLabel>
                        <Step>
                            <StepLabel>Register Authenticator</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Verify Authenticator</StepLabel>
                        </Step>
                    </Stepper>
                </DialogContent>
                <Box sx={{ display: faStep == 0 ? "initial" : "none" }}>
                    <DialogContent>

                        <Box display="flex" flexDirection={"column"} justifyContent="center" alignItems={"center"}>
                            <DialogContentText mb="1rem">
                                Register your authenticator app by scanning the QR code below.
                            </DialogContentText>
                            <img src={qrCode} />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setShowSetup2fa(false) }} startIcon={<CloseRounded />}>Cancel</Button>
                        <Button onClick={handleQrNext} startIcon={<ArrowForwardRounded />}>Continue</Button>
                    </DialogActions>
                </Box>
                <Box sx={{ display: faStep == 1 ? "initial" : "none" }}>
                    <DialogContent>

                        <Box display="flex" flexDirection={"column"} justifyContent="center" alignItems={"center"}>
                            <DialogContentText mb="1rem">
                                Verify your authenticator app by entering the code generated by the app.
                            </DialogContentText>
                            <Box component={"form"} autoComplete="off" onSubmit={verifyFormik.handleSubmit}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="code"
                                    label="Code"
                                    type="text"
                                    name="code"
                                    fullWidth
                                    variant="standard"
                                    value={verifyFormik.values.code}
                                    onChange={verifyFormik.handleChange}
                                    error={verifyFormik.touched.code && Boolean(verifyFormik.errors.code)}
                                    helperText={verifyFormik.touched.code && verifyFormik.errors.code}
                                    sx={{ textAlign: "center" }}
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleQrBack} startIcon={<ArrowBackRounded />}>Back</Button>
                        <LoadingButton loading={FALoading} onClick={handleQrNext} startIcon={<ArrowForwardRounded />}>Continue</LoadingButton>
                    </DialogActions>
                </Box>
                <Box display={faStep == 2 ? "initial" : "none"}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <CheckRounded sx={{ fontSize: "3rem", color: theme.palette.success.main }} />
                            <DialogContentText sx={{ textAlign: "center", marginTop: "0.5rem" }}>
                                2FA has been successfully enabled on your account.
                            </DialogContentText>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setShowSetup2fa(false) }} startIcon={<CloseRounded />}>Done</Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={showDisable2fa} onClose={() => { setShowDisable2fa(false) }}>
                <DialogTitle>Disable 2FA</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to disable 2FA on your account? You will no longer be required to enter a code from your authenticator app to login.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowDisable2fa(false) }} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton loading={FALoading} onClick={disable2FA} startIcon={<CheckRounded />} color="error">Disable 2FA</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    )
}