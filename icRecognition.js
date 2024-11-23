import React, { useState } from 'react'; //managing component state
import axios from 'axios'; //ssed to make HTTP requests to the backenk
import './icRecognition.css'; 
import { useNavigate } from 'react-router-dom';

//const=constant, declare variable, cannot be reassigned, let also is used to declare variable 
const IcRecognition = () => {
    //initialization
    const [icNumber, setIcNumber] = useState(''); //initial state is set with useState(''), to store the user's input, managed with useState('')
    const navigate = useNavigate();

    //handling events in React, event and event.target.value are part of the event-handling system and are used to capture and process user interactions
    //(event) object is automatically passed to event handler functions (handleIcChange) in JavaScript (and React) when an event occurs
    //type of event: a click, keypress, change event
    //target element: the element on which the event occurred (e.g., an input field, button, etc.)
    const handleIcChange = (event) => { //triggered when the user types in the IC number input field.
        setIcNumber(event.target.value); //setIcNumber function updates the icNumber state with the new value.
    }; //event.target refers to the HTML element that triggered the event, event.target.value gets the current value of the input field
    //setIcNumber is part of React's state management system and is automatically provided by the useState hook that initializes state in a functional component, 
    //returns an array with two elements: state variable: icNumber, state updater function: setIcNumber

    //async=used to define asynchronous functions
    //returns a promise, even if the function does not explicitly return one, call the function no need variable to receive return value
    const handleSubmit = async (event) => {
        event.preventDefault(); //prevents the page from refreshing when the form is submitted.

        try { //await keyword can only be used inside an async, pauses the execution of the function until the promise is resolved or rejected
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
                        onChange={handleIcChange} //updates icNumber when the user types.
                        required
                    />
                </label>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default IcRecognition;
