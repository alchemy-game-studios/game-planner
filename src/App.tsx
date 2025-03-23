import { useState, useEffect } from "react";
import { EditEntityComponent } from './client-graphql/edit-entity/edit-entity-component'
import './App.scss';

const App = () => {
    const [theme, setTheme] = useState('theme-dark');

    return (
        <div className={`app bg-gray-900 text-white p-4 rounded`}>
            <div className="panel">
               <h1 className="text-5xl font-bold text-gray-200 leading-tight tracking-tight">Universes</h1>
               <EditEntityComponent id="9919e21f-d9e9-4449-9068-329ba5d2b50b" type="universe" />
               <h1 className="text-5xl font-bold text-gray-200 leading-tight tracking-tight">Places</h1>
               <EditEntityComponent id="7198a74d-8939-4262-a69d-00192db9c9ff" type="place" />
               <h1 className="text-5xl font-bold text-gray-200 leading-tight tracking-tight">Characters</h1>
               <EditEntityComponent id="db421343-1ce6-41e4-972c-b13b6dd06877" type="character" />
            </div>

        </div> 
    );
    
}

export default App;
