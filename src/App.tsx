import { useState, useEffect } from "react";
import fetch from 'isomorphic-fetch';
import { Message, Places } from './client-graphql/graphql-components'
import { EditEntityComponent } from './client-graphql/edit-entity/edit-entity-component'
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
            <div className="panel">
               <EditEntityComponent id="9919e21f-d9e9-4449-9068-329ba5d2b50b" type="universe" />
               {/* <EditEntityComponent id="7198a74d-8939-4262-a69d-00192db9c9ff" type="place" />
               <EditEntityComponent id="db421343-1ce6-41e4-972c-b13b6dd06877" type="character" /> */}
            </div>
        </div>
    );
    
}

export default App;