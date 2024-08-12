
from collections import OrderedDict
from pathlib import Path
from typing import Any, Dict, List

import json
import numpy as np
import os
import tempfile
from fastapi import FastAPI, File, HTTPException, UploadFile,Body
from fastapi.responses import RedirectResponse
from osgeo import gdal, osr  

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# This back-end API cropland stats calculator is built using FastAPI and GDAL.
# There are two endpoints: /compute-cropland and /compute. Both endpoints accept GeoJSON data as input.
# /compute end point accepts GeoJSON data as a dictionary and /compute-cropland accepts GeoJSON data as a file.
# The GeoJSON data is used to clip a raster file and calculate the area of cropland for each crop type.

# CORS middleware is added to allow requests from the front-end React app. origins can be added to allow requests from specific domains.
# Geojson class is used to define the structure of the GeoJSON data.
# Input data is validated using Pydantic models.




app = FastAPI(
    title="Cropland API",
    description="API for calculating cropland area from a raster file",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Geometry(BaseModel):
    coordinates: List[List[List[float]]]
    type: str

class Feature(BaseModel):
    id: str  # ID is added as an extra feature in GeoJSON data for front-end app. geojson.io sample do not have this.
    type: str
    properties: Dict[str, Any]
    geometry: Geometry

class GeoJSONInput(BaseModel):
    type: str
    features: List[Feature]

@app.get("/", include_in_schema=False)
async def docs_redirect():
    return RedirectResponse(url='/docs')


@app.get("/gdal-version")
def get_gdal_version():
    import osgeo
    import osgeo.gdal as gd  
    return { "GDAL Version " + str(gd.__version__)  : "PROJ DB Major Version " + str(osgeo.osr.GetPROJVersionMajor())}


def configure_gdal():
    from osgeo import gdal, osr
    gdal.UseExceptions()
    gdal.SetConfigOption('GDAL_DISABLE_READDIR_ON_OPEN', 'EMPTY_DIR')
    gdal.SetConfigOption('GDAL_DRIVER_PATH', os.getenv("GDAL_DATA"))


@app.post("/compute-cropland")
async def compute_cropland_file(file: UploadFile = File(...), year: str = "2022") -> Dict[str, float]:
    try:
        geojson_data = await file.read()
        geojson = json.loads(geojson_data.decode('utf-8'))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format. The file is not a valid JSON.")

    if geojson.get('type') != 'FeatureCollection' or not geojson.get('features'):
        raise HTTPException(status_code=400, detail='Invalid GeoJSON format or no valid features found')

  
    input_tiff = Path("cropland_api/2022.tif")
    crop_code_path = Path("cropland_api/cropcode.json")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".geojson") as tmp_geojson_file:
        tmp_geojson_file.write(geojson_data)
        tmp_geojson_path = tmp_geojson_file.name

    out_raster = 'output.tif'
    ds = None
    try:
          
        configure_gdal() 
        warp_options = gdal.WarpOptions(
            cutlineDSName=tmp_geojson_path,
            cropToCutline=True,
            dstNodata=0,
            creationOptions=['COMPRESS=LZW']
        )
        gdal.Warp(out_raster, str(input_tiff), options=warp_options)

        with open(crop_code_path) as f:
            crop_code_list = json.load(f)

        ds = gdal.Open(out_raster)
        
        if ds is None:
            raise ValueError(f"Failed to open the raster file: {out_raster}")

        band = ds.GetRasterBand(1)
        array = band.ReadAsArray()

        unique, counts = np.unique(array, return_counts=True)
        counts_dict = dict(zip(unique.astype(int), counts))

        crop_code = OrderedDict((item['Crop'], int(item['Code'])) for item in crop_code_list)
        result = OrderedDict(
            (crop, round((counts_dict.get(code, 0) * 900) / 4047))
            for crop, code in crop_code.items()
        )

       
        return result     
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {}
    finally:
        if ds:
                ds = None
        gdal.UseExceptions()
        gdal.VSIFCloseL(gdal.VSIFOpenL(out_raster, 'rb'))
        if os.path.exists(out_raster):
            gdal.GetDriverByName('GTiff').Delete(out_raster)
        if tmp_geojson_path and os.path.exists(tmp_geojson_path):
            os.remove(tmp_geojson_path)
    
@app.post("/compute")
async def calculate(geojson: Dict[str, Any] = Body(...), year: str = "2022") -> Dict[str, float]:
    try:
       geojson_data = GeoJSONInput.parse_obj(geojson)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format. The file is not a valid JSON.")

    if geojson.get('type') != 'FeatureCollection' or not geojson.get('features'):
        raise HTTPException(status_code=400, detail='Invalid GeoJSON format or no valid features found')

  
    input_tiff = Path("cropland_api/2022.tif")
    crop_code_path = Path("cropland_api/cropcode.json")

    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.geojson') as temp_geojson:
        json.dump(geojson_data.dict(), temp_geojson)
        temp_geojson_path = temp_geojson.name

    out_raster = 'output.tif'
    ds = None
    try:
          
        configure_gdal() 
        warp_options = gdal.WarpOptions(
            cutlineDSName=temp_geojson_path,
            cropToCutline=True,
            dstNodata=0,
            creationOptions=['COMPRESS=LZW']
        )
        gdal.Warp(out_raster, str(input_tiff), options=warp_options)

        with open(crop_code_path) as f:
            crop_code_list = json.load(f)

        ds = gdal.Open(out_raster)
        
        if ds is None:
            raise ValueError(f"Failed to open the raster file: {out_raster}")

        band = ds.GetRasterBand(1)
        array = band.ReadAsArray()

        unique, counts = np.unique(array, return_counts=True)
        counts_dict = dict(zip(unique.astype(int), counts))

        crop_code = OrderedDict((item['Crop'], int(item['Code'])) for item in crop_code_list)
        result = OrderedDict(
            (crop, round((counts_dict.get(code, 0) * 900) / 4047))
            for crop, code in crop_code.items()
        )

       
        return result     
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {}
    finally:
        if ds:
                ds = None
        gdal.UseExceptions()
        gdal.VSIFCloseL(gdal.VSIFOpenL(out_raster, 'rb'))
        if os.path.exists(out_raster):
            gdal.GetDriverByName('GTiff').Delete(out_raster)
        if temp_geojson_path and os.path.exists(temp_geojson_path):
            os.remove(temp_geojson_path)
    