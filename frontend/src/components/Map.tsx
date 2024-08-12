import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


// You might need to add this line if TypeScript complains about the CSS import
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
const MAPBOX_TOKEN: string = ''
import Slider from './Slider';
import DataTable from './DataTable';


const Map: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [data, setData] = useState<{ [key: string]: number }>({});
    const [open, setOpen] = useState(false);
    
    useEffect(() => {
      mapboxgl.accessToken = MAPBOX_TOKEN;
  
      if (mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/satellite-v9',
          center: [-120.1021486213254, 46.328342312024006],       
          zoom: 12
        });
  
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });
  
        mapRef.current.addControl(draw);
  
        mapRef.current.on('draw.create', updateArea);
        mapRef.current.on('draw.delete', updateArea);
        mapRef.current.on('draw.update', (e) => {
            updateArea(e);
            computeCropland(draw.getAll());
          });
        
        
        function updateArea(e: { type: string }) {
          const data = draw.getAll();
          const geojson = JSON.stringify(data);
          // Not using round area to display the area in map
          if (data.features.length > 0) {         
            computeCropland(geojson)
          } else {                    
            if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
          }
        }      

        function removeZeroValues(data: Record<string, number>): Record<string, number> {
          return Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== 0)
          );
        }
        async function computeCropland(geojson: any) {
          try {
              const response = await fetch('http://127.0.0.1:8000/compute?year=2022', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body:geojson, // Convert geojson to string
              });
  
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
  
              const data = await response.json();
              console.log(data);
              const filteredData = removeZeroValues(data);
              setData(filteredData); // Set the fetched data into state
              setOpen(true); // Open the DataTable with the new data
          } catch (error) {
              console.error('Error:', error);
          }
      }



      }
  
      
      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    }, []);
  
   
  
    return (
      <>
       <div style={{ height: '100%', width: '100%', position: 'relative' }}>
       <div ref={mapContainerRef} id="map" style={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}></div>
          <div className="slider-container">      
         <Slider  />
         {open && <DataTable data={data} onClose={() => setOpen(false)} />}
       </div>
        </div>
      </>
    );
  };
  
  export default Map;