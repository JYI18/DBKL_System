import React, { useState } from 'react';
import axios from 'axios';
import './icRecognition.css';
import { useNavigate } from 'react-router-dom';

const IcRecognition = () => {
    const [icNumber, setIcNumber] = useState('');
    const navigate = useNavigate();

    const handleIcChange = (event) => {
        setIcNumber(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/check-ic', {
                icNumber,
            });

            if (response.data.exists) {
                alert(`Tenant found`);
                navigate('/face-scan', { state: { tenant: response.data.tenant, icNumber } });
            } else {
                alert('Tenant not found');
            }
        } catch (error) {
            console.error('Error checking IC number:', error);
            alert('An error occurred while checking the IC number.');
        }
    };

    return (
        <div className="ic-recognition-container">
            <h1>IC Recognition</h1>
            <form className="ic-form" onSubmit={handleSubmit}>
                <label>
                    IC Number:
                    <input
                        className="ic-input"
                        type="text"
                        value={icNumber}
                        onChange={handleIcChange}
                        required
                    />
                </label>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default IcRecognition;
