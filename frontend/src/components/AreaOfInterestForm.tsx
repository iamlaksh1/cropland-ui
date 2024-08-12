import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField,  FormControl, Autocomplete } from '@mui/material';
import useGeoJSON from '../hooks/useGeoJSON';



interface CountyData {
  County: string;
  State: string;
}

const AreaOfInterestForm: React.FC = () => {
  const [usCountiesData, setUsCountiesData] = useState<CountyData[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>('');
  const [selectedCounty, setSelectedCounty] = useState<string | null>('');
  const [counties, setCounties] = useState<string[]>([]);
  
  const geoJsonData = useGeoJSON(selectedState || '',  selectedCounty || '');
 

  useEffect(() => {
    // Fetch the JSON data
    fetch('/us_counties.json')  // Adjust this path to where your JSON file is located
      .then(response => response.json())
      .then((data: CountyData[]) => {
        setUsCountiesData(data);
        const uniqueStates = [...new Set(data.map(item => item.State))].sort();
        setStates(uniqueStates);
      })
      .catch(error => console.error('Error loading US counties data:', error));
  }, []);

  useEffect(() => {
    if (selectedState) {
      const stateCounties = usCountiesData
        .filter(item => item.State === selectedState)
        .map(item => item.County)
        .sort();
      setCounties(stateCounties);
    } else {
      setCounties([]);
    }
  }, [selectedState, usCountiesData]);

  return (
    <Box
      component="form"
      className="usa-form usa-nav__submenu"
      sx={{
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h4" className="submenu-header">
        Select area of interest
      </Typography>

      <FormControl fullWidth>
        <Typography variant="subtitle2" component="label" htmlFor="state-combobox">
          State
        </Typography>
        <Autocomplete
          id="state-combobox"
          options={states}
          renderInput={(params) => <TextField {...params} size="small" />}
          onChange={(event, newValue) => {
            setSelectedState(newValue);          
            setSelectedCounty(null);
          }}

     
        />
         
      
      </FormControl>

      <FormControl fullWidth>
        <Typography variant="subtitle2" component="label" htmlFor="county-combobox">
          County
        </Typography>
        <Autocomplete
          id="county-combobox"
          options={counties}
          renderInput={(params) => <TextField {...params} size="small" />}
          disabled={!selectedState}
          onChange={(event, newValue) => {
            setSelectedCounty(newValue);         
          
          }}
        />
      </FormControl>

      <FormControl fullWidth>
        <Typography variant="subtitle2" component="label" htmlFor="nass-region-combobox">
          Get Cropland Statistics
        </Typography>
        <Button variant="contained" disabled={!(geoJsonData?.geoJsonData?.features?.length > 0)}>
          Process 
        </Button>
      </FormControl>
      
     {/* {geoJsonData && (
        <pre style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto' }}>
          {JSON.stringify(geoJsonData, null, 2)}
        </pre>
      )} */}

     
    </Box>
  );
};

export default AreaOfInterestForm;