import { useState, useContext, useEffect, useRef } from "react";
import { Box, IconButton, Popover, Divider, Typography, Button, colors, Tooltip, Stack, Card, CardContent, Badge, Popper, Fade, useMediaQuery, useTheme, Dialog, AppBar, Toolbar, DialogContent, DialogActions } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import ProfilePicture from "./ProfilePicture";
import { AppContext } from "../App";
import CardTitle from "./CardTitle";

import { enqueueSnackbar } from "notistack";
import { CloseRounded, Margin, NotificationsActiveRounded, NotificationsRounded, ShoppingBagRounded } from "@mui/icons-material";
import http from "../http";
import { get } from "aws-amplify/api";

export default function NavbarNotifications() {
    const { notifications, currentNotification, setCurrentNotification, setNotifications } = useContext(AppContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isPopperOpen, setIsPopperOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const buttonRef = useRef(null)
    const navigate = useNavigate()
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const menuSlotProps = {
        paper: {
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 0.5,
                '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                },
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 24,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
                width: "400px",
                borderRadius: "1rem",
                marginLeft: "0.5rem",
            },
        },
    }

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
    }

    function handlePopoverClose() {
        setAnchorEl(null);
        setIsPopoverOpen(false);
    }

    function handleNotificationClick(url) {
        navigate(url)
        setIsPopoverOpen(false)
    }

    useEffect(() => {
        if (currentNotification) {
            setAnchorEl(buttonRef.current);
            setIsPopperOpen(true)

            setTimeout(() => {
                setIsPopperOpen(false)
            }, 5000)

            setTimeout(() => {
                setCurrentNotification(null)
            }, 5250)
        }
    }, [currentNotification])

    async function handleNotificationDismiss(id = null) {
        if (id === null) {
            var req = get({
                apiName: "midori",
                path: "/notifications/read"
            })
        } else {
            var req = get({
                apiName: "midori",
                path: "/notifications/read/" + id
            })
        }

        try {
            var res = await req.response
            enqueueSnackbar("Notification dismissed", { variant: "success" })
            refreshNotifications()
        } catch (error) {
            console.error(error)
            enqueueSnackbar("Failed to dismiss notification", { variant: "error" })
        }
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

    // Profile picture should be implemented later
    return (
        <>
            <Tooltip title="Account Notifications" arrow>
                <IconButton onClick={(e) => handlePopoverOpen(e)} ref={buttonRef}>
                    {notifications.length > 0 &&
                        <Badge badgeContent={notifications.length} color="yellow" overlap="circular">
                            <NotificationsRounded sx={{ fill: "white" }} />
                        </Badge>
                    }
                    {notifications.length === 0 &&
                        <NotificationsRounded sx={{ fill: "white" }} />
                    }
                </IconButton>
            </Tooltip>
            <Popover
                id={"userPopover"}
                open={!fullScreen ? isPopoverOpen : false}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    horizontal: 'right',
                }}
                slotProps={menuSlotProps}
            >
                <Box sx={{ margin: "1rem" }}>
                    <CardTitle title="Account Notifications" icon={<NotificationsRounded />} />
                    <Stack spacing={".5rem"} mt={"1rem"} sx={{ whiteSpace: "nowrap", overflow: "scroll", maxHeight: "500px", display: "inline-block", width: "100%" }}>
                        {notifications.length === 0 &&
                            <Card sx={{ backgroundColor: "#ffffff", width: "100%" }}>
                                <CardContent>
                                    <Typography variant="body1" fontWeight={700} width={"100%"} textAlign={"center"}>No Unread Notifications</Typography>
                                </CardContent>
                            </Card>
                        }
                        {notifications.map((notification) => (
                            <Card sx={{ backgroundColor: "#ffffff" }}>
                                <CardContent>
                                    <Typography variant="body1" fontWeight={700} sx={{whiteSpace: "normal"}}>{notification.title}</Typography>
                                    <Typography variant="body2" mb={".5rem"} sx={{ whiteSpace: "pre-wrap" }}>{notification.subtitle}</Typography>
                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button variant="contained" color="primary" size="small" sx={{ mr: ".5rem" }} onClick={() => handleNotificationClick(notification.actionUrl)}>{notification.action}</Button>
                                        <Button variant="outlined" color="primary" size="small" onClick={() => {handleNotificationDismiss(notification.id)}}>Dismiss</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))
                        }

                    </Stack>
                    <Button disabled={notifications.length === 0} variant="outlined" color="primary" size="small" fullWidth onClick={() => { handleNotificationDismiss() }}>Clear All Notifications</Button>
                </Box>
            </Popover>
            <Popper
                open={isPopperOpen}
                anchorEl={anchorEl}
                placement="bottom-end"
                transition
                disablePortal
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        <Card sx={{ width: "400px" }} elevation={8}>
                            <CardContent>
                                <CardTitle title="New Notification!" icon={<NotificationsActiveRounded />} />
                                <Card sx={{ backgroundColor: "#ffffff", mt: "1rem" }}>
                                    <CardContent>
                                        <Typography variant="body1" fontWeight={700} sx={{whiteSpace: "normal"}}>{currentNotification?.title}</Typography>
                                        <Typography variant="body2" mb={".5rem"} sx={{ whiteSpace: "pre-wrap" }}>{currentNotification?.subtitle}</Typography>
                                        <Stack direction="row" justifyContent="flex-end">
                                            <Button variant="contained" color="primary" size="small" sx={{ mr: ".5rem" }} onClick={() => handleNotificationClick(currentNotification?.actionUrl)}>{currentNotification?.action}</Button>
                                            <Button variant="outlined" color="primary" size="small" onClick={() => handleNotificationDismiss(currentNotification?.id)}>Dismiss</Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </Fade>
                )}
            </Popper>
            <Dialog
                open={fullScreen ? isPopoverOpen : false}
                onClose={handlePopoverClose}
                fullWidth
                maxWidth="sm"
                fullScreen
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handlePopoverClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Account Notifications
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <Stack spacing={".5rem"} overflow={"scroll"}>
                        {notifications.length === 0 &&
                            <Card sx={{ backgroundColor: "#ffffff" }}>
                                <CardContent>
                                    <Typography variant="body1" fontWeight={700} width={"100%"} textAlign={"center"}>No Unread Notifications</Typography>
                                </CardContent>
                            </Card>
                        }
                        {notifications.map((notification) => (
                            <Card sx={{ backgroundColor: "#ffffff" }}>
                                <CardContent>
                                    <Typography variant="body1" fontWeight={700}>{notification.title}</Typography>
                                    <Typography variant="body2" mb={".5rem"} sx={{ whiteSpace: "pre-wrap" }}>{notification.subtitle}</Typography>
                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button variant="contained" color="primary" size="small" sx={{ mr: ".5rem" }} onClick={() => handleNotificationClick(notification.actionUrl)}>{notification.action}</Button>
                                        <Button variant="outlined" color="primary" size="small" onClick={() => handleNotificationDismiss(notification.id)}>Dismiss</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))
                        }
                        <Button disabled={notifications.length === 0} variant="outlined" color="primary" size="small" fullWidth onClick={() => { handleNotificationDismiss() }}>Clear All Notifications</Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}