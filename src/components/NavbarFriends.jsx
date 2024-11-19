import { useState, useContext, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, Badge } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../App";

import { Diversity3Rounded } from "@mui/icons-material";

export default function NavbarFriends() {
    //const { notifications, currentNotification, setCurrentNotification } = useContext(AppContext);
    const [friendRequests, setFriendRequests] = useState([])
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const buttonRef = useRef(null)
    const navigate = useNavigate()

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
    }

    useEffect(() => {
        // Load friend requests
    }, [])


    // Profile picture should be implemented later
    return (
        <>
            <Tooltip title="Friends & Groups" arrow sx={{display: {xs: "none", md: "flex"}}}>
                <IconButton onClick={(e) => handlePopoverOpen(e)} ref={buttonRef} LinkComponent={Link} to="/groupList">
                    {friendRequests.length > 0 &&
                        <Badge badgeContent={friendRequests.length} color="yellow" overlap="circular">
                            <Diversity3Rounded sx={{ fill: "white" }} />
                        </Badge>
                    }
                    {friendRequests.length === 0 &&
                        <Diversity3Rounded sx={{ fill: "white" }} />
                    }
                </IconButton>
            </Tooltip>
        </>
    )
}