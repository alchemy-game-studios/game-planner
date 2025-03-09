import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

const QUERY_Hello_World = gql`
    query {
        hello {
            message
        }
    }
`;

const SUBMIT_TEXT = gql`
    mutation SubmitText($input: SubmitText!) {
        submitText(input: $input) {
            message
        }
    }
`;

const QUERY_Places = gql`
    query {
        places {
           id
           name
           description
        }
    }
`;


export function TextSubmitter () {
    const [submitText, { data, loading, error }] = useMutation(SUBMIT_TEXT);

    const [inputText, setInputText] = useState('');
    const [resultText, setResultText] = useState('');

    const handleSubmit = async (event) => {
        try{
            const result = await submitText({ variables: { input: { text: inputText } } });
            console.log(result);
            setResultText(result.data.submitText.message)
        } catch (err) {
            console.log(err);
        }
    };

    const onInputChange = (event) => {
        setInputText(event.target.value);
    };

    return (
        <div>
            <input id="text-input" type="text" value={inputText} onChange={onInputChange} placeholder="Enter text..." />
            <button onClick={handleSubmit}>Submit</button>
            <p>{resultText}</p>
        </div>
    );
}
export function Message () {
    const {loading, error, data} = useQuery(QUERY_Hello_World);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :</p>;
    return (
       <p>{data.hello.message}</p>
    );
}

export function Places () {
    const {loading, error, data} = useQuery(QUERY_Places);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message} </p>;
    return (
        <>
        {data.places.map((place)=> (
            <div>
            <p>{place.name}</p>
            <p>{place.description}</p>
            </div>
        ))}
       </>
    );
}