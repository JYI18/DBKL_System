import React, { useState, useRef, useEffect } from 'react'; //react hooks that help manage state and side effects in functional components
//useRef: store mutable values, access and manipulate DOM elements (e.g., focusing an input field, controlling a video or canvas)
//useEffect: perform side effects in functional components, e.g., data fetching, subscriptions, manually changing the DOM, setting up timers
import Webcam from 'react-webcam';
import { useLocation } from 'react-router-dom'; //React Router hook that provides information about the current location in the application
import axios from 'axios';
import './FaceScan.css'; 
import { useNavigate } from 'react-router-dom';

const FaceScan = () => {
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [icNumber, setIcNumber] = useState('');
    const [tenantImageUrl, setTenantImageUrl] = useState('');
    const webcamRef = useRef(null);
    const navigate = useNavigate();


    //get IC number from location state passed via navigation
    //retrieves a value (icNumber) from the locationState using React Router's useLocation hook
    //state is a way to pass additional data when navigating between routes (e.g., using navigate('/some-route', { state: { key: 'value' } }))
    //pass the icNumber from one page to another via React Router's state object
    //when the FaceScan component is loaded, useLocation captures the state and provides the current location and the effect sets checks if an icNumber exists in the location's state and updates the icNumber state accordingly
    const locationState = useLocation();
    useEffect(() => { //ensure state is not undefined or null, to confirm icNumber was passed in the state
        if (locationState.state && locationState.state.icNumber) { //locationState.state is expected to carry the icNumber passed from another page
            setIcNumber(locationState.state.icNumber);
        }
    }, [locationState]);

    //fetch the tenant's image URL from the backend
    const getTenantImage = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/tenant-image/${icNumber}`);
            setTenantImageUrl(response.data.imageUrl); //response.data contains the JSON body returned by the server, response.data.imageUrl extracts the imageUrl field from the server's response.
        } catch (error) { //setTenantImageUrl stores this URL in the tenantImageUrl state variable, which could then be used in your component (e.g., to display the image in an <img> tag)
            console.error('Error fetching tenant image:', error);
        }
    };

    //hook that runs side effects in a functional React component, e.g. fetching data from an API
    useEffect(() => { //a React useEffect hook that is used to trigger the getTenantImage function whenever the value of the icNumber state changes
        if (icNumber) { //([icNumber]) is the dependency array, tells React to only re-run the effect when one or more of the listed dependencies change, If the array is empty ([]), the effect runs only once
            getTenantImage();
        }
    }, [icNumber]);

    // Function to get the current location
    //an asynchronous function getLocation that fetches the user's current geographical location using the browser's Geolocation API and wraps the API call in a JavaScript Promise
    const getLocation = async () => {
        return new Promise((resolve, reject) => { //takes a callback function with two parameters, resolve: called when the operation succeeds, passing the result of the operation, reject: called when the operation fails, passing an error or reason for failure
            navigator.geolocation.getCurrentPosition( //part of the browser's Geolocation API, which fetches the user's current geographical location, takes two callback functions, success callback: called when the location is successfully retrieved, error callback: called when there’s an error in retrieving the location
                (position) => {
                    const { latitude, longitude } = position.coords; //the function extracts latitude and longitude using destructuring, then passed as an object to resolve
                    setLocation({ latitude, longitude });
                    resolve({ latitude, longitude }); //when the Geolocation API successfully retrieves the position, the resolve function is called with the result, to fulfills the Promise, signaling that the operation completed successfully, and provides the result to the caller
                    console.log(latitude, longitude)
                },
                (error) => {
                    console.error('Error getting location:', error);
                    reject(error);
                }
            );
        });
    };

    // Function to capture and upload the image to imgBB
    const captureAndUploadImage = async () => {
        if (!webcamRef.current) return null;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            alert('Failed to capture image');
            return null;
        }

        const imageBlob = await fetch(imageSrc).then((res) => res.blob());
        const imageFile = new File([imageBlob], 'captured-image.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                params: { key: '110446ac0c62994840a07e952ac01b59' },
            });
            return response.data.data.url;
        } catch (error) {
            console.error('Error uploading captured image:', error);
            return null;
        }
    };

    // Function to handle verification (upload images, check face & location)
    const handleVerification = async () => {
        try {
            // Step 1: Get current location
            const locationData = await getLocation();

            // Step 2: Upload the captured image to imgBB
            const capturedImageUrl = await captureAndUploadImage();

            if (!capturedImageUrl) {
                alert('Image upload failed.');
                return;
            }

            // Step 3: Send verification request to backend
            const response = await axios.post('http://localhost:5000/api/verify', {
                icNumber,
                imageUrl: capturedImageUrl,
                tenantImageUrl, // The tenant image URL from database
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            });

            const { result } = response.data;

            switch (result) {
                case 'success':
                    alert('Face and location match successfully.');
                    break;
                case 'incomplete':
                    alert('Either face or location does not match.');
                    break;
                case 'fail':
                    alert('Face and location both do not match.');
                    break;
                default:
                    alert('Unexpected result.');
            }
            
            // Navigate back to the icRecognition page
            navigate('/icRecognition');
        } catch (error) {
            console.error('Verification error:', error);
            alert('Error during verification.');
        }
    };

    return (
        <div>
            <h1>Face and Location Verification</h1>
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: 'user' }}
            />
            <button className="verify-button" onClick={handleVerification}>Verify</button>
        </div>
    );
};

export default FaceScan;
