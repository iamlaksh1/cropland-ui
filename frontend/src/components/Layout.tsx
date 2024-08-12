import React, { useState } from 'react';
import AreaOfInterestForm from './AreaOfInterestForm';

import Map from './Map';


const Layout: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => setIsFormOpen(!isFormOpen);

  return (
    <div className="layout">
      <header className="banner">
        <div className="banner-content">
            <div className="logo-container">
                <img src="/usda-symbol.png" alt="USDA Logo" className="logo" />
            </div>
            <div className="site-name-container">
                <div className="site-name">                
                    <div className="agency-title-des">National Agricultural Statistics Service</div> 
                    <div className="agency-title">U.S. DEPARTMENT OF AGRICULTURE</div></div>                 
            </div>
            <div className="site-description">
               <h1 title="Cropland Collaborative Research Outcomes System (CROS)" className="svelte-qu1of3">CroplandCROS</h1>
            </div>
        </div>
      </header>
      
      <nav className="navbar">
        <button className="form-toggle-btn" onClick={toggleForm}>
          Area of Interest
        </button>
        {isFormOpen && (
          <div className="form-dropdown">
            <AreaOfInterestForm />
          </div>
        )}
      </nav>
      
      <main className="map-container">
        <Map />            
      </main>
    </div>
  );
};

export default Layout;