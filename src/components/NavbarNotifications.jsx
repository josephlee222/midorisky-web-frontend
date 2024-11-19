import { useState, useContext, useEffect, useRef } from "react";
import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Popover, Divider, Typography, Button, colors, Tooltip, Stack, Card, CardContent, Badge, Popper, Fade } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import ProfilePicture from "./ProfilePicture";
import { AppContext } from "../App";
import CardTitle from "./CardTitle";

import { enqueueSnackbar } from "notistack";
import { NotificationsActiveRounded, NotificationsRounded, ShoppingBagRounded } from "@mui/icons-material";
import http from "../http";

export default function NavbarNotifications() {
    const { notifications, currentNotification, setCurrentNotification } = useContext(AppContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isPopperOpen, setIsPopperOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const buttonRef = useRef(null)
    const navigate = useNavigate()

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
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

    function handleNotificationDismiss(id) {
        http.get("User/Notification/Read?notificationId=" + id).then((res) => {
            enqueueSnackbar("Notification dismissed", { variant: "success" })
        }).catch((err) => {
            enqueueSnackbar("Failed to dismiss notification", { variant: "error" })
        })
    }

    function handleAllNotificationDismiss() {
        http.get("User/Notification/ReadAll").then((res) => {
            enqueueSnackbar("All Notifications dismissed", { variant: "success" })
        }).catch((err) => {
            enqueueSnackbar("Failed to dismiss notifications", { variant: "error" })
        })
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
                open={isPopoverOpen}
                anchorEl={anchorEl}
                onClose={() => setIsPopoverOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: "400px",
                            borderRadius: "1rem"
                        }
                    }
                }}
            >
                <Box sx={{ margin: "1rem" }}>
                    <CardTitle title="Account Notifications" icon={<NotificationsRounded />} />
                    <Stack spacing={".5rem"} mt={"1rem"}>
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
                                    <Typography variant="body2" mb={".5rem"}>{notification.subtitle}</Typography>
                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button variant="contained" color="primary" size="small" sx={{ mr: ".5rem" }} onClick={() => handleNotificationClick(notification.actionUrl)}>{notification.action}</Button>
                                        <Button variant="outlined" color="primary" size="small" onClick={() => handleNotificationDismiss(notification.id)}>Dismiss</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))
                        }
                        <Button disabled={notifications.length === 0} variant="outlined" color="primary" size="small" fullWidth onClick={handleAllNotificationDismiss}>Clear All Notifications</Button>
                    </Stack>
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
                                        <Typography variant="body1" fontWeight={700}>{currentNotification?.title}</Typography>
                                        <Typography variant="body2" mb={".5rem"}>{currentNotification?.subtitle}</Typography>
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
        </>
    )
}