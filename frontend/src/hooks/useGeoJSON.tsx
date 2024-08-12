import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface GeoJSON {
    type: string;
    features: any[];
}

const useGeoJSON = (stateName: string, countyName: string) => {
    const [geoJsonData, setGeoJsonData] = useState<GeoJSON | null>(null);  
    useEffect(() => {
        const fetchGeoJSON = async () => {          
            try {              
               // Build the query based on whether the county name is provided
                const query = countyName && countyName.trim() !== ''
                    ? `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/1/query?where=NAME%20%3D%20%27${encodeURIComponent(countyName)}%27&f=geojson`
                    : stateName
                        ? `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0/query?where=NAME%20%3D%20%27${encodeURIComponent(stateName)}%27&f=geojson`
                        : '';
                
                const response = await fetch(query);
               
                 if (query !== '') {
                
                    if (!response.ok) {
                        toast.error('Failed to fetch GeoJSON data.');
                        throw new Error('Failed to fetch GeoJSON data');                   
                    }
                    const data = await response.json();                 
                    setGeoJsonData(data);
                    if(data?.features?.length > 0)
                        toast.success('GeoJSON data fetched successfully!');
                    else
                        toast.error('No data returned from API.');
                     
                 }
           
            } catch (err: any) {              
               setGeoJsonData(null)
               toast.error('Failed to fetch GeoJSON data.');
            } finally {
               
            }
        };

        // Only fetch data if the state name is provided
      
        fetchGeoJSON();
       
    }, [stateName, countyName]);

    return { geoJsonData};
};

export default useGeoJSON;
