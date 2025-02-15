import React, { useEffect, useCallback } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Divider, Box, CircularProgress, Dialog, AppBar, Toolbar, useMediaQuery, useTheme, DialogContent, Chip, Grid2, TextField, MenuItem, Alert, ButtonBase, Card, CardContent, DialogTitle, DialogContentText, DialogActions, Autocomplete } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { WarningRounded, CloseRounded, MoreVertRounded, FileDownloadOffRounded, PersonRounded, EditRounded, RefreshRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, CheckRounded, AccessTimeRounded, HourglassTopRounded, NewReleasesRounded, SaveRounded, EditOffRounded, UploadFileRounded, InsertDriveFileRounded, DownloadRounded, DeleteRounded, AddRounded } from '@mui/icons-material';
import { get, put, del, post } from 'aws-amplify/api';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { LoadingButton } from '@mui/lab';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { enqueueSnackbar } from 'notistack';
import debounce from 'lodash.debounce';

export default function AssigneeDialog(props) {
    const navigate = useNavigate()
    const theme = useTheme()
    const [loading, setLoading] = useState(false)
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [predicting, setPredicting] = useState(false)
    const [users, setUsers] = useState([])
    const [username, setUsername] = useState("")
    const api_url = import.meta.env.VITE_API_URL


    const handlePredictUser = async () => {
        console.log(username)
        const value = username.trim()

        if (value.length < 3 || !value) {
            return
        }

        var req = get({
            apiName: "midori",
            path: "/predict/users/" + username,
        })

        try {
            setPredicting(true)
            const res = await req.response
            var data = await res.body.json()
            setUsers(data)
            setPredicting(false)
        } catch (error) {
            console.error(error)
            enqueueSnackbar("Failed to fetch users", { variant: "error" })
            setPredicting(false)
        }
    }

    const userFormik = useFormik({
        initialValues: {
            usernames: []
        },
        validationSchema: Yup.object({
            usernames: Yup.array().min(1, "Please select at least one user")
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true)
                var req = post({
                    apiName: "midori",
                    path: "/tasks/" + props.taskId + "/assignees",
                    options: {
                        body: {
                            assignees: values.usernames
                        }
                    }
                })

                const res = await req.response
                setLoading(false)
                props.onClose()
                props.onUpdate()
            } catch (error) {
                console.error(error)
                enqueueSnackbar("Failed to assign users", { variant: "error" })
            }
        }
    })

    const handleGetAssignees = async () => {
        setLoadingUsers(true)
        // Fetch users
        var req = get({
            apiName: "midori",
            path: "/tasks/" + props.taskId + "/assignees"
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            userFormik.setFieldValue("usernames", data)
            setLoadingUsers(false)
        } catch (error) {
            console.error(error)
            enqueueSnackbar("Failed to fetch users", { variant: "error" })
        }
    }


    useEffect(() => {
        // Wait for user to stop typing
        const handler = setTimeout(() => {
            handlePredictUser()
        }, 500);

        // Cleanup the timeout if `query` changes before 500ms
        return () => {
            clearTimeout(handler);
        };
    }, [username])

    useEffect(() => {
        if (props.open) {
            handleGetAssignees()
        }
    }, [props.open])

    return (
        <>
            <Dialog
                open={props.open}
                onClose={props.onClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle icon={<PersonRounded />}>Assign Users</DialogTitle>
                <DialogContent>
                    {loadingUsers && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: "1rem" }} >
                            <CircularProgress />
                        </Box>
                    )}

                    {(!loadingUsers) && (<>
                        <DialogContentText mb={"0.5rem"}>
                            Select task assignees
                        </DialogContentText>

                        <Autocomplete
                            multiple
                            id="tags-filled"
                            options={users}
                            getOptionLabel={(option) => option} // Add this line to display strings correctly
                            value={userFormik.values.usernames}
                            onChange={(event, newValue) => { // Correct onChange parameters
                                userFormik.setFieldValue("usernames", newValue);
                            }}
                            onInputChange={(event, newValue) => { // Update to use newValue from input
                                setUsername(newValue);
                            }}
                            loading={predicting}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="filled"
                                    label="Select Assignees"
                                    placeholder="Select Users..."
                                    error={userFormik.touched.usernames && Boolean(userFormik.errors.usernames)}
                                    helperText={userFormik.touched.usernames && userFormik.errors.usernames}
                                />
                            )}
                        />
                    </>)}

                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} startIcon={<CloseRounded />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={(loading || loadingUsers)} variant="text" color="primary" startIcon={<AddRounded />} onClick={userFormik.handleSubmit}>Assign</LoadingButton>
                </DialogActions>
            </Dialog>
        </>

    )
}