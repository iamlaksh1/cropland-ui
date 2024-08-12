import { useState, useCallback } from 'react';

// Define a type for the GeoJSON object - NOT USED IN THIS SNIPPET
// created a dedicated custom hook for the computation of cropland data. This is not being used in the current project

type GeoJSONObject = {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[][][] | number[][] | number[];
    };
    properties?: Record<string, any>;
  }>;
};


const useCroplandComputation = () => {
  const [data, setData] =  useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const computeCropland = useCallback(async (geojson: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/compute?year=2022', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:geojson,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData);
      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      console.error('Error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { computeCropland, data, isLoading, error };
};

export default useCroplandComputation;