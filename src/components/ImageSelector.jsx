import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


const ImageSelector = ({ imageUrls }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const url = import.meta.env.VITE_API_URL + "/uploads/"

  const handleClickImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNavigate = (direction) => {
    if (direction === 'left') {
      setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    } else if (direction === 'right') {
      setSelectedImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    }
  };

  return (
    <Grid container rowSpacing={1} sx={{ height: '20rem' }}>
      <Grid item xs={6} md={8} sx={{ position: 'relative' }}>
        <Grid container rowSpacing={1} sx={{ height: '20rem', overflow: 'hidden' }}>
          <Grid item xs={12} sx={{ position: 'relative', display: 'flex', transition: 'transform 0.7s ease-in-out', transform: `translateX(-${selectedImageIndex * 100}%)` }}>
            {imageUrls.map((imageUrl, index) => (
              <img
                key={index}
                src={url + imageUrl}
                alt={`Preview ${index}`}
                style={{ flex: '0 0 auto', width: '100%', maxHeight: '20rem', objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => handleClickImage(index)}
              />
            ))}
          </Grid>
          <KeyboardArrowLeftIcon
            sx={{ position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1 }}
            onClick={() => handleNavigate('left')}
          />
          <KeyboardArrowRightIcon
            sx={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1 }}
            onClick={() => handleNavigate('right')}
          />
        </Grid>
      </Grid>
      <Grid item xs={6} md={4} sx={{ padding: '10px', maxHeight: '20rem' }}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ maxHeight: '20rem', overflow: 'auto' }}>
          {imageUrls.map((imageUrl, index) => (
            <Grid item xs={6} key={index} >
              <img
                src={url + imageUrl}
                alt={`Preview ${index}`}
                style={{
                  width: '100%', cursor: 'pointer', maxHeight: '100%', height: 'auto',
                  border: `2px solid ${selectedImageIndex === index ? 'black' : 'transparent'}`
                }}
                onClick={() => handleClickImage(index)}

              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>



  );
};

export default ImageSelector;


/*import React, { useState } from 'react';
import { Grid, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


const ImageSelector = ({ imageUrls }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const url = import.meta.env.VITE_API_URL + "/uploads/"

  const handleClickImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNavigate = (direction) => {
    if (direction === 'left') {
      setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1));
    } else if (direction === 'right') {
      setSelectedImageIndex((prevIndex) => (prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1));
    }
  };

  return (
    <Grid container rowSpacing={1} sx={{ height: '20rem' }}>
            <Grid item xs={6} md={8} sx={{ position: 'relative' }}>
            <KeyboardArrowLeftIcon
            sx={{ position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1 }}
            onClick={() => handleNavigate('left')}
            />
            <img
            src={url + imageUrls[selectedImageIndex]}
            alt="Selected"
            style={{ maxWidth: '100%', height: '20rem', display: 'block', marginLeft: 'auto', marginRight: 'auto', overflow:'hidden' }}
            />
            <KeyboardArrowRightIcon
            sx={{ position: 'absolute', top: '50%', right: '0', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1 }}
            onClick={() => handleNavigate('right')}
            />
        </Grid>
    <Grid item xs={6} md={4} sx={{ padding: '10px', maxHeight: '20rem' }}>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ maxHeight: '20rem', overflow: 'auto' }}>
        {imageUrls.map((imageUrl, index) => (
          <Grid item xs={6} key={index} >
            <img
              src={url + imageUrl}
              alt={`Preview ${index}`}
              style={{ width: '100%', cursor: 'pointer', maxHeight:'100%', height: 'auto' }}
              onClick={() => handleClickImage(index)}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  </Grid>
  
  

  );
};

export default ImageSelector;
*/