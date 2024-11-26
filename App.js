import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; //browserRouter is the main container for all the routes in a React application
import IcRecognition from './components/icRecognition';
import FaceScan from './components/FaceScan';

function App() {
    const [tenant, setTenant] = useState(null); // Store tenant info if found

    return (
        <Router>
            <div className="App">
                <h1>Store Rental Recognition System</h1>
                <Routes>
                    {/* Redirect the root "/" path to "/icRecognition" */}
                    <Route path="/" element={<Navigate to="/icRecognition" replace />} />
        
                    {/* Route for IC Recognition page */}
                    <Route path="/icRecognition" element={<IcRecognition setTenant={setTenant} />} /> {/*specify a path prop that defines the URL, and the element prop that defines which React component should be rendered when the path is matched*/}
                    
                    {/* Route for Face Scan page, pass tenant info */}
                    <Route path="/face-scan" element={<FaceScan tenant={tenant} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
