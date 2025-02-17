import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Button, Card, Grid, CardContent, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, useTheme, Stack, Stepper, Step, StepLabel } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CardTitle from "../components/CardTitle";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import LoginIcon from '@mui/icons-material/LoginRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/CloseRounded';
import LockResetIcon from '@mui/icons-material/LockResetRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import http from "../http";
import { AppContext } from "../App";
import PageHeader from "../components/PageHeader";
import titleHelper from "../functions/helpers";
import { coerceToBase64Url } from "../functions/fidoHelpers";
import { signIn, confirmSignIn, fetchUserAttributes, resetPassword, confirmResetPassword, fetchAuthSession } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { get } from "aws-amplify/api";
import { ArrowForwardRounded, CancelRounded, CloseRounded } from "@mui/icons-material";


export default function Login() {
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [resetUsername, setResetUsername] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [setPasswordLoading, setSetPasswordLoading] = useState(false);
    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [setPasswordDialog, setSetPasswordDialog] = useState(false);
    const [resendDialog, setResendDialog] = useState(false);
    const [verifyDialog, setVerifyDialog] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [loginType, setLoginType] = useState("email");
    const { enqueueSnackbar } = useSnackbar();
    const { setUser, setConnection, setNotifications, setUserRoles } = useContext(AppContext);
    const navigate = useNavigate();
    const theme = useTheme();
    titleHelper("Login");

    const handleResetPasswordDialog = () => {
        setResetPasswordDialog(true);
    }

    const handleResetPasswordDialogClose = () => {
        setResetStep(0);
        setResetPasswordDialog(false);
    }

    const handleResendDialog = () => {
        setResendDialog(true);
    }

    const handleResendDialogClose = () => {
        setResendDialog(false);
    }

    const handleSetPasswordDialogOpen = () => {
        setSetPasswordDialog(true);
    }

    const handleSetPasswordDialogClose = () => {
        setSetPasswordDialog(false);
    }

    const handleVerifyDialogClose = () => {
        setVerifyDialog(false);
    }

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Username is required"),
            password: Yup.string().required("Password is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            //enqueueSnackbar("Logging in...", { variant: "info" });
            data.username = data.username.trim();
            data.password = data.password.trim();



            signIn({
                username: data.username,
                password: data.password,
            }).then((res) => {
                console.log(res);
                handleLoginSuccess(res);
            }).catch((err) => {
                console.log(err);
                enqueueSnackbar("Login failed! " + err.message, { variant: "error" });
                setLoading(false);
            })


            // http.post("/User/Login", data).then((res) => {
            //     if (res.status === 200) {
            //         handleLoginSuccess(res);
            //     } else {
            //         enqueueSnackbar("Login failed! Check your e-mail and password.", { variant: "error" });
            //         setLoading(false);
            //     }
            // }).catch((err) => {
            //     if (err.response) {
            //         enqueueSnackbar("Login failed! " + err.response.data.error, { variant: "error" });
            //         setLoading(false);
            //     } else {
            //         enqueueSnackbar("Login failed! " + err.message, { variant: "error" });
            //         setLoading(false);
            //     }
            // })
        }

    })

    const resetFormik = useFormik({
        initialValues: {
            username: "",
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Username is required"),
        }),
        onSubmit: (data) => {
            setResetLoading(true);

            resetPassword({
                username: data.username
            }).then((res) => {
                enqueueSnackbar("Password reset e-mail sent!", { variant: "success" });
                setResetUsername(data.username);
                setResetStep(1);
                setResetLoading(false);
            }).catch((err) => {
                enqueueSnackbar("Password reset failed! " + err.message, { variant: "error" });
                setResetLoading(false);
            })
        }
    })


    const confirmResetFormik = useFormik({
        initialValues: {
            code: "",
            password: "",
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Code is required"),
            password: Yup.string().required("New password is required"),
        }),
        onSubmit: (data) => {
            setResetLoading(true);
            confirmResetPassword({
                username: resetUsername,
                newPassword: data.password,
                confirmationCode: data.code
            }).then(() => {
                enqueueSnackbar("Password reset successful!", { variant: "success" });
                setResetLoading(false);
                setResetStep(2);
            }).catch((err) => {
                enqueueSnackbar("Password reset failed! " + err.message, { variant: "error" });
                setResetLoading(false);
            })
        }
    })


    // Currently not in use
    const resendFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: (data) => {
            setResendLoading(true);
            data.email = data.email.trim();
            http.post("/User/Resend", data).then((res) => {
                if (res.status === 200) {
                    enqueueSnackbar("Verification e-mail sent!", { variant: "success" });
                    setResendDialog(false);
                    setResendLoading(false);
                } else {
                    enqueueSnackbar("Verification e-mail failed! Check your e-mail.", { variant: "error" });
                    setResendLoading(false);
                }
            }).catch((err) => {
                enqueueSnackbar("Verification e-mail failed! " + err.response.data.message, { variant: "error" });
                setResendLoading(false);
            })
        }
    })

    const setFormik = useFormik({
        initialValues: {
            password: "",
        },
        validationSchema: Yup.object({
            password: Yup.string().required("New password is required"),
        }),
        onSubmit: (data) => {
            setSetPasswordLoading(true);

            confirmSignIn({
                challengeResponse: data.password
            }).then((res) => {
                console.log(res);
                handleLoginSuccess(res);
            }).catch((err) => {
                console.log(err);
                enqueueSnackbar("Login failed! " + err.message, { variant: "error" });
                setSetPasswordLoading(false);
            })
        }
    })

    const verifyFormik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Code is required"),
        }),
        onSubmit: (data) => {
            setVerifyLoading(true);
            confirmSignIn({
                challengeResponse: data.code
            }).then((res) => {
                console.log(res);
                setVerifyLoading(false);
                setVerifyDialog(false);
                handleLoginSuccess(res);
            }).catch((err) => {
                console.log(err);
                enqueueSnackbar("Login failed! " + err.message, { variant: "error" });
                setVerifyLoading(false);
            })
        }
    })

    const handleVerifySubmit = () => {
        verifyFormik.handleSubmit();
    }

    const handlePasskeySetup = async () => {
        setLoading(true);
        var credentials = await http.get("/User/Login/Passkey");
        credentials = credentials.data;
        var rawCredentials = credentials;
        console.log("Credential Options Object", credentials);  // DEBUG


        // show options error to user
        if (credentials.status !== "ok") {
            enqueueSnackbar("Failed to get passkey options. " + credentials.errorMessage, { variant: "error" });
            return;
        }

        const challenge = credentials.challenge.replace(/-/g, "+").replace(/_/g, "/");
        credentials.challenge = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));

        credentials.allowCredentials.forEach(function (listItem) {
            var fixedId = listItem.id.replace(/\_/g, "/").replace(/\-/g, "+");
            listItem.id = Uint8Array.from(atob(fixedId), c => c.charCodeAt(0));
        });

        var newCredential;
        try {
            newCredential = await navigator.credentials.get({ publicKey: credentials })
            await handlePasskeyLogin(newCredential, rawCredentials);
        } catch (e) {
            enqueueSnackbar("Could not sign in using the passkey", { variant: "error" });
            //console.log(msg);
            console.log(e);
        }

        setLoading(false);
    }

    async function handlePasskeyLogin(newCredential, credentialsOptions) {
        let authData = new Uint8Array(newCredential.response.authenticatorData);
        let clientDataJSON = new Uint8Array(newCredential.response.clientDataJSON);
        let rawId = new Uint8Array(newCredential.rawId);
        let sig = new Uint8Array(newCredential.response.signature);
        let userHandle = new Uint8Array(newCredential.response.userHandle)
        const data = {
            id: newCredential.id,
            rawId: coerceToBase64Url(rawId),
            type: newCredential.type,
            extensions: newCredential.getClientExtensionResults(),
            response: {
                authenticatorData: coerceToBase64Url(authData),
                clientDataJSON: coerceToBase64Url(clientDataJSON),
                userHandle: userHandle !== null ? coerceToBase64Url(userHandle) : null,
                signature: coerceToBase64Url(sig)
            }
        };

        credentialsOptions.challenge = coerceToBase64Url(credentialsOptions.challenge);

        http.post("/User/Login/Passkey", { AttestationResponse: data, Options: JSON.stringify(credentialsOptions) }).then((res) => {
            if (res.status === 200) {
                handleLoginSuccess(res);
            } else {
                enqueueSnackbar("Login failed! " + res.errorMessage, { variant: "error" });
            }
        }).catch((err) => {
            console.log(err);
            enqueueSnackbar("Login failed! " + err.response.data.error, { variant: "error" });
        })
    }

    const refreshNotifications = () => {
        // Check for notifications
        var notificationReq = get({
            apiName: "midori",
            path: "/notifications",
        });

        notificationReq.response.then((res) => {
            res.body.json().then((data) => {
                setNotifications(data);
            }).catch((e) => {
                console.log(e);
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    function handleLoginSuccess(res) {
        if (!res.isSignedIn) {
            // Check next steps
            if (res.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
                // Open dialog to change password
                enqueueSnackbar("Please change your password to continue.", { variant: "info" });
                handleSetPasswordDialogOpen();
            } else if (res.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
                // Open dialog to verify TOTP code
                enqueueSnackbar("Please verify your identity with your authenticator app.", { variant: "info" });
                setVerifyDialog(true);
            } else {
                // Show unimplemented error
                enqueueSnackbar("Login failed! Unimplemented error.", { variant: "error" });
                console.log(res);
                setLoading(false);
            }
        } else {
            // Store token in local storage
            //localStorage.setItem("token", res.data.token);
            // Load user data
            fetchUserAttributes().then((attributes) => {
                setUser(attributes);
                fetchAuthSession().then((session) => {
                    var token = session.tokens.accessToken.toString();
                    setUserRoles(session.tokens.accessToken.payload["cognito:groups"] ? session.tokens.accessToken.payload["cognito:groups"] : []);
                    const existingConfig = Amplify.getConfig();
                    Amplify.configure(existingConfig, {
                        API: {
                            REST: {
                                headers: async () => {
                                    return { Authorization: token };
                                }
                            }
                        }
                    });

                    refreshNotifications();
                    localStorage.setItem("token", token);
                    enqueueSnackbar("Login successful. Welcome back!", { variant: "success" });
                    navigate("/")
                }).catch((e) => {
                    console.log(e);
                    enqueueSnackbar("Failed to load user data! " + e.message, { variant: "error" });
                })
            }).catch((e) => {
                console.log(e);
                enqueueSnackbar("Failed to load user data! " + e.message, { variant: "error" });
            })
        }
    }


    return (
        <>
            <PageHeader icon={LoginIcon} title="Welcome Back" navTitle="Login" />
            <Container sx={{ mt: "2rem", mb: "1rem" }} maxWidth="sm">
                {/* <Grid container spacing={2} justifyContent={"center"} mb={"2rem"}>
                    <Grid item xs={6} md={2}>
                        <Button variant="contained" fullWidth sx={{ fontWeight: 700 }}>Login</Button>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Button variant="secondary" fullWidth sx={{ fontWeight: 700 }} LinkComponent={Link} to="/register">Register</Button>
                    </Grid>
                </Grid> */}
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item xs={12} md={12}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Login with Username" icon={<PasswordRoundedIcon />} />
                                <Box component="form" onSubmit={formik.handleSubmit}>
                                    <TextField
                                        fullWidth
                                        id="username"
                                        name="username"
                                        label="Username"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        error={formik.touched.username && Boolean(formik.errors.username)}
                                        helperText={formik.touched.username && formik.errors.username}
                                        sx={{ mt: 3 }}
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="Password"
                                        type="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        sx={{ mt: 1 }}
                                    />
                                    <LoadingButton
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        sx={{ mt: "1rem" }}
                                        loading={loading}
                                    >
                                        Login
                                    </LoadingButton>
                                    <Stack direction={["column", "row"]} sx={{ mt: "1rem" }}>
                                        <Button
                                            fullWidth
                                            variant="secondary"
                                            component={Link}
                                            onClick={handleResetPasswordDialog}
                                            sx={{ mr: { xs: 0, sm: "1rem" } }}
                                        >
                                            Forgot password?
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="secondary"
                                            component={Link}
                                            onClick={handleResendDialog}
                                            sx={{ mt: { xs: "1rem", sm: 0 } }}
                                        >
                                            Resend verification
                                        </Button>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Card>
                            <CardContent>
                                <CardTitle title="Login via other methods" icon={<KeyRoundedIcon />} />
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <LoadingButton loading={loading} onClick={handlePasskeySetup} fullWidth variant="secondary" sx={{ mt: "1rem" }} startIcon={<KeyRoundedIcon />}>
                                            Passkey
                                        </LoadingButton>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <LoadingButton fullWidth variant="secondary" sx={{ mt: "1rem" }} startIcon={<GoogleIcon />} loading={loading}>
                                            Google
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
            <Dialog open={resetPasswordDialog} maxWidth={"sm"} fullWidth onClose={handleResetPasswordDialogClose}>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={resetStep} alternativeLabel>
                        <Step>
                            <StepLabel>Request Reset</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Confirm Reset</StepLabel>
                        </Step>
                    </Stepper>
                </DialogContent>
                <Box display={resetStep == 0 ? "initial" : "none"} component="form" onSubmit={resetFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            To reset your password, please enter your username below. We will send you a code to reset your password.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="username"
                            label="Account Username"
                            type="text"
                            name="username"
                            fullWidth
                            variant="standard"
                            value={resetFormik.values.username}
                            onChange={resetFormik.handleChange}
                            error={resetFormik.touched.username && Boolean(resetFormik.errors.username)}
                            helperText={resetFormik.touched.username && resetFormik.errors.username}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetPasswordDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={resetLoading} variant="text" color="primary" startIcon={<LockResetIcon />}>Reset</LoadingButton>
                    </DialogActions>
                </Box>

                <Box display={resetStep == 1 ? "initial" : "none"} component="form" onSubmit={confirmResetFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            An e-mail has been sent to your account with a code to reset your password. Please enter the code and your new password below.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="code"
                            label="Reset Code"
                            type="text"
                            name="code"
                            fullWidth
                            variant="standard"
                            value={confirmResetFormik.values.code}
                            onChange={confirmResetFormik.handleChange}
                            error={confirmResetFormik.touched.code && Boolean(confirmResetFormik.errors.code)}
                            helperText={confirmResetFormik.touched.code && confirmResetFormik.errors.code}
                        />
                        <TextField
                            sx={{ mt: 0 }}
                            margin="dense"
                            id="password"
                            label="New Password"
                            type="password"
                            name="password"
                            fullWidth
                            variant="standard"
                            value={confirmResetFormik.values.password}
                            onChange={confirmResetFormik.handleChange}
                            error={confirmResetFormik.touched.password && Boolean(confirmResetFormik.errors.password)}
                            helperText={confirmResetFormik.touched.password && confirmResetFormik.errors.password}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetPasswordDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={resetLoading} variant="text" color="primary" startIcon={<LockResetIcon />}>Confirm Reset</LoadingButton>
                    </DialogActions>
                </Box>

                <Box display={resetStep == 2 ? "initial" : "none"}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <LockResetIcon sx={{ fontSize: "3rem", color: theme.palette.success.main }} />
                            <DialogContentText sx={{ textAlign: "center", marginTop: "0.5rem" }}>
                                Password reset successful!<br />You can now login with your new password.
                            </DialogContentText>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetPasswordDialogClose} startIcon={<CloseIcon />}>Done</Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={setPasswordDialog} onClose={handleSetPasswordDialogClose}>
                <DialogTitle>Set New Password</DialogTitle>
                <Box component="form" onSubmit={setFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            You need to set a new password before logging in, please enter a new password below.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="password"
                            label="New Password"
                            type="password"
                            name="password"
                            fullWidth
                            variant="standard"
                            value={setFormik.values.email}
                            onChange={setFormik.handleChange}
                            error={setFormik.touched.email && Boolean(setFormik.errors.email)}
                            helperText={setFormik.touched.email && setFormik.errors.email}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSetPasswordDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={setPasswordLoading} variant="text" color="primary" startIcon={<LockResetIcon />}>Set Password</LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={verifyDialog} onClose={handleVerifyDialogClose}>
                <DialogTitle>
                    Identity Verification
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection={"column"} justifyContent="center" alignItems={"center"}>
                        <DialogContentText mb="1rem">
                            To verify your identity, please enter the code stated on your authenticator app.
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
                    <Button onClick={handleVerifyDialogClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton loading={verifyLoading} onClick={handleVerifySubmit} startIcon={<ArrowForwardRounded />}>Verify Code</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={resendDialog} onClose={handleResendDialogClose}>
                <DialogTitle>Resend Verification E-mail</DialogTitle>
                <Box component="form" onSubmit={resendFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            To resend your verification e-mail, please enter your e-mail address below. We will send you a link to verify your account.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label="E-mail Address"
                            type="email"
                            name="email"
                            fullWidth
                            variant="standard"
                            value={resendFormik.values.email}
                            onChange={resendFormik.handleChange}
                            error={resendFormik.touched.email && Boolean(resendFormik.errors.email)}
                            helperText={resendFormik.touched.email && resendFormik.errors.email}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResendDialogClose} startIcon={<CloseIcon />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={resendLoading} variant="text" color="primary" startIcon={<RefreshIcon />}>Resend E-mail</LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>
        </>

    );
}