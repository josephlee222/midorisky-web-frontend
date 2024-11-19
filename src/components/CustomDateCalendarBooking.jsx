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

    const handleClick = () => {
        if (availability) {
            // Call the parent component's onSelectDay function
            // and pass the selected day as an argument
            other.onSelectDay(day);
        }
    };

    return (
        <Badge
            key={day.toString()}
            overlap="circular"
            badgeContent={price != null && <div
                style={{
                    backgroundColor: "#E8533F",
                    color: 'white',
                    padding: '4px',
                    borderRadius: '25px'
                }}
            >${price}</div>}
        >
            <div
                onClick={handleClick}
                style={{ cursor: availability ? 'pointer' : 'default', opacity: availability ? 1 : 0.3, backgroundColor: availability ? '' : "#ccbcbb", borderRadius:'12px' }}
            >
                <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} sx={{ paddingLeft: '8px', paddingRight: '8px' }} />
            </div>
        </Badge>
    );
}

export default function DateCalendarServerRequest({ activityId, availabilities, setDialogOpen, onChange, big, formik }) {
    const requestAbortController = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

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

    const handleSelectDay = (day) => {
        setSelectedDate(day);
        formik.setFieldValue('date', day.format('YYYY-MM-DD'));
    };
    

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
                defaultValue={initialValue}
                loading={isLoading}
                onMonthChange={handleMonthChange}
                renderLoading={() => <DayCalendarSkeleton />}
                onChange={onChange}
                onSelectDay={handleSelectDay}
                selected={selectedDate}
                slots={{
                    day: ServerDay,
                }}
                slotProps={{
                    day: {
                        availabilities,
                        sx: { fontSize: '1.2rem' },
                        onSelectDay: handleSelectDay,
                    },
                }}
                sx={big ? { transform: 'scale(1.5,1.5)' } : {}}
                formik={formik}
            />
        </LocalizationProvider>
    );
}
