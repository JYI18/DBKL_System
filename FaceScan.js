import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useLocation } from 'react-router-dom';
import './icRecognition.css'; // Reusing the same CSS file

const uploadImageToImgBB = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=110446ac0c62994840a07e952ac01b59`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

const fetchUserDataByIC = async (icNumber) => {
  const response = await fetch(`http://localhost:5000/api/check-ic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icNumber }),
  });

  if (response.ok) {
      return await response.json();
  } else {
      console.error('API Error:', response.statusText);
      return null;
  }
};


const checkLocationMatch = (capturedLocation, userLocation) => {
    return capturedLocation.latitude === userLocation.latitude && capturedLocation.longitude === userLocation.longitude;
};

const verifyCapturedImage = async (capturedImageUrl, icNumber, location) => {
  try {
      const userData = await fetchUserDataByIC(icNumber);
      if (!userData) {
          throw new Error('User not found or API error occurred.');
      }

      const dbImageUrl = userData.imageUrl;
      const isFaceMatch = capturedImageUrl === dbImageUrl;
      const isLocationMatch = checkLocationMatch(location, userData);

      return isFaceMatch && isLocationMatch ? 'green' : isFaceMatch || isLocationMatch ? 'yellow' : 'red';
  } catch (error) {
      console.error('Error verifying captured image:', error);
      throw error;
  }
};


const ScanFace = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const { state } = useLocation();
    const icNumber = state?.icNumber || ''; // Retrieve icNumber from location state

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setImageSrc(imageSrc);
            getLocation();
        } else {
            console.error('Failed to capture image.');
        }
    };

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
            },
            (error) => {
                console.error('Error getting location:', error);
            }
        );
    };

    const dataURLToFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleVerification = async () => {
      console.log('IC Number:', icNumber);
      if (!icNumber) {
          alert('Please enter an IC Number');
          return;
      }
  
      if (!imageSrc || location.latitude === null || location.longitude === null) {
          alert('Please capture an image and ensure location is available.');
          return;
      }
  
      const imageFile = dataURLToFile(imageSrc, 'captured-image.jpg');
      const capturedImageUrl = await uploadImageToImgBB(imageFile);
  
      if (!capturedImageUrl) {
          alert('Failed to upload image.');
          return;
      }
  
      // Sending data to the /api/verify endpoint
      try {
          const response = await fetch('http://localhost:5000/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  icNumber,
                  imageUrl: capturedImageUrl, // Ensure this is the correct name your backend expects
                  latitude: location.latitude,
                  longitude: location.longitude,
              }),
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const result = await response.json();
          let message;
          switch (result.result) { // Access result object correctly
            case 'green':
                message = "Recognition Successful: Face and location match.";
                break;
            case 'yellow':
                message = "Partial Match: Either face or location does not match.";
                break;
            case 'red':
                message = "Verification Failed: Face and location do not match.";
                break;
            default:
                message = "An unexpected error occurred during verification.";
        }        
  
          alert(`Verification result: ${message}`);
  
          setTimeout(() => {
              navigate('/');
          }, 500);
      } catch (error) {
          console.error('Verification error:', error);
          alert('An error occurred during verification.');
      }
  };
  

    return (
        <div className="ic-recognition-container">
            <h1>Face Scan</h1>
            <div className="ic-form">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={400}
                    height={250}
                    className="webcam-view"
                />
                <button onClick={capture} className="submit-button">Capture Image</button>
                {imageSrc && <img src={imageSrc} alt="Captured" className="captured-image" style={{ marginTop: '18px'}} />}
                <button onClick={handleVerification} className="submit-button">Verify</button>
            </div>
        </div>
    );
};

export default ScanFace;
