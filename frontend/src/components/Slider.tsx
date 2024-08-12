
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const marks = [
  {
    value: 2020,
    label: '2000',
  },
  {
    value: 2021,
    label: '2021',
  },
  {
    value: 2022,
    label: '2022',
  },
  {
    value: 2023,
    label: '2023',
  },
];

function valuetext(value: number) {
  return `${value}`;
}

export default function DiscreteSliderMarks() {
  return (    
   
    <Box sx={{ width: 300,  position: 'absolute', bottom: 40, Padding: 20, left: 20,  textAlign: 'center'}}>
      <Slider
        aria-label="Year"
        defaultValue={2022}
        getAriaValueText={valuetext}
        step={1}
        min={2020}               
        max={2023}  
        color='primary'      
        valueLabelDisplay="auto"
        marks={marks}
        valueLabelFormat={(value) => `${value}`}  
      />
    </Box>
    
  );
}
