import { useState, useEffect } from "react";
import fetch from 'isomorphic-fetch';
import './App.css';

const App = () => {
    const [apiResponse, setApiResponse] = useState('Loading Data...')

    // const callApi = () => {
    //     fetch("http://localhost:3000/testApi")
    //         .then(res => res.text())
    //         .then (res => setApiResponse(res))
    //         .catch(err => err);
    // }

    // const postApi = () => {
    //     fetch("http://localhost:3000/testApi", {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({})
    //     }).then(res => res.text())
    //     .then (res => setApiResponse(res))
    //     .catch(err => err);
    // }

  

    return (
        <div className="app">
          

        </div>
    );
    
}

export default App;