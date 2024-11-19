import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const BookingDialog = ({ open, onClose, onSubmit }) => {
  const [date, setDate] = React.useState('');
  const [pax, setPax] = React.useState('');

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handlePaxChange = (event) => {
    setPax(event.target.value);
  };

  const handleSubmit = () => {
    // Pass the form data to the parent component for submission
    onSubmit({ date, pax });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Book Activity</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          id="date"
          name="date"
          label="Date"
          variant="outlined"
          value={date}
          onChange={handleDateChange}
          type='date'
          InputLabelProps={{ shrink: true }}
          margin="normal"
        />
        <TextField
          fullWidth
          id="pax"
          name="pax"
          label="Pax"
          variant="outlined"
          value={pax}
          onChange={handlePaxChange}
          type='number'
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Book</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDialog;
