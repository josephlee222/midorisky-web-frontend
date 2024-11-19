import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';

function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

/**
 * Mimic fetch with abort controller https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
 * ⚠️ No IE11 support
 */
function fakeFetch(date, { signal }) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));

            resolve({ daysToHighlight });
        }, 500);

        signal.onabort = () => {
            clearTimeout(timeout);
            reject(new DOMException('aborted', 'AbortError'));
        };
    });
}

const initialValue = dayjs();

function ServerDay(props) {
    const { availabilities = [], day, outsideCurrentMonth, ...other } = props;

    // Find the availability for the current day
    const availability = availabilities.find(avail => dayjs(avail.date).startOf('day').isSame(day, 'day'));

    // Extract the price from the availability, if available
    const price = availability ? availability.price : null;
    const pax = availability ? availability.maxPax : null;

    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            // badgeContent={(
            //     <div
            //         style={{
            //             fontSize:"8px"
            //         }}
            //     >
            //         <div
            //             style={{
            //                 width:'10px',
            //                 height:'25px'

            //             }}
            //         ></div>
            //         {price != null && <div
            //             style={{
            //                 backgroundColor: "#E8533F",
            //                 color: 'white',
            //                 padding: '4px',
            //                 borderRadius: '25px'
            //             }}
            //         >${price}</div>}
            //         <br
            //         style={{
            //             height:'5px'

            //         }}
            //         />
            //         {pax != null && <div
            //             style={{
            //                 backgroundColor: "#E8533F",
            //                 color: 'white',
            //                 padding: '4px',
            //                 borderRadius: '25px',
                            

            //             }}
            //         >${pax}</div>}
            //     </div>
            // )}
        badgeContent={(
            <Tooltip title={pax + " pax"} arrow
            >
            <div>
                {price != null && <div
                    style={{
                        backgroundColor: "#E8533F",
                        color: 'white',
                        padding: '4px',
                        borderRadius: '25px'
                    }}
                >${price}</div>}
            </div>
            </Tooltip>
        )}
        >
            <div
            //style={{ padding: '10px' }}
            > {/* Adjust spacing here */}
                <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} sx={{ paddingLeft: '8px', paddingRight: '8px' }} /> {/* Adjust paddingLeft and paddingRight */}
            </div>
        </Badge>
    );
}



export default function DateCalendarServerRequest({ activityId, availabilities, setDialogOpen, onChange, big }) {
    const requestAbortController = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchHighlightedDays = (date) => {
        const controller = new AbortController();
        fakeFetch(date, {
            signal: controller.signal,
        })
            .then(({ daysToHighlight }) => {
                setIsLoading(false);
            })
            .catch((error) => {
                // ignore the error if it's caused by `controller.abort`
                if (error.name !== 'AbortError') {
                    throw error;
                }
            });

        requestAbortController.current = controller;
    };

    useEffect(() => {
        fetchHighlightedDays(initialValue);
        // abort request on unmount
        return () => requestAbortController.current?.abort();
    }, []);

    const handleMonthChange = (date) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        setIsLoading(true);
        fetchHighlightedDays(date);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
                defaultValue={initialValue}
                loading={isLoading}
                onMonthChange={handleMonthChange}
                renderLoading={() => <DayCalendarSkeleton />}
                onChange={onChange}
                slots={{
                    day: ServerDay,
                }}
                slotProps={{
                    day: {
                        availabilities,
                        sx: { fontSize: '1.2rem' }
                    },
                }}
                sx={big ? { transform: 'scale(1.5,1.5)' } :  {  }}


            />
        </LocalizationProvider>
    );
}
