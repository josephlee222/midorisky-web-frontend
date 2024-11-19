import { useState, useContext, useEffect, useRef } from "react";
import { Box, IconButton, Tooltip, Badge } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { AppContext } from "../App";

import { Diversity3Rounded, ShoppingCartRounded } from "@mui/icons-material";

export default function NavbarCart() {
    //const { notifications, currentNotification, setCurrentNotification } = useContext(AppContext);
    const { user } = useContext(AppContext);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const buttonRef = useRef(null)
    const navigate = useNavigate()

    function handlePopoverOpen(event) {
        setAnchorEl(event.currentTarget);
        setIsPopoverOpen(true);
    }

    useEffect(() => {
        // Load cart
    }, [])


    // Profile picture should be implemented later
    return (
        <>
            <Tooltip title="My Cart" arrow sx={{display: {xs: "none", md: "flex"}}}>
                <IconButton LinkComponent={Link} to="/cart">
                    {user.cart.length > 0 &&
                        <Badge badgeContent={user.cart.length} color="yellow" overlap="circular">
                            <ShoppingCartRounded sx={{ fill: "white" }} />
                        </Badge>
                    }
                    {user.cart.length === 0 &&
                        <ShoppingCartRounded sx={{ fill: "white" }} />
                    }
                </IconButton>
            </Tooltip>
        </>
    )
}