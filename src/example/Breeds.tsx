import { useState, useEffect } from "react";
import fetch from 'isomorphic-fetch';
import './Breeds.css'

const Breeds = () => {
    const [breeds, setBreeds]:any[] = useState([])

    const callApi = () => {
        fetch("https://api.thecatapi.com/v1/breeds?limit=200&page=0")
            .then(res => res.json())
            .then (breeds => {
                const promises:Promise<any>[] = [];

                for(const breed of breeds) {
                    if(breed.reference_image_id) {
                        const promise = fetch(`https://api.thecatapi.com/v1/images/${breed.reference_image_id}`)
                            .then(res => res.json())
                            .then (res => {
                                breed.url = res.url;
                                return breed;
                            });

                        promises.push(promise);
                    }
                }

                Promise.all(promises).then((allBreeds) => {
                    console.log(allBreeds);
                    setBreeds(allBreeds);
                }).catch(err => err);
            })
            .catch(err => err);
    }

    useEffect(() => {
        callApi();
    },[])

    return (
        <>
        <ul className="breed-list">
            {breeds.map((breed:any) => (
                <li key={breed.id} className="breed">
                    <img className="breed-pic" src={breed.url} />
                    <div className="data">
                        <div className="name">{breed.name}</div>
                        <div className="temperment">{breed.temperament}</div>
                    </div>
                </li>
            ))}
        </ul>
        </>
    );
    
}

export default Breeds;