import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

const QUERY_All_Tags = gql`
    query {
        tags {
            id
            name
            description
            type
        }
    }
`;

const MUTATE_Add_Tag = gql`
    mutation AddTag($tag: TagInput!) {
        addTag(tag: $tag) {
           message
        }
    }
`;

export function Tags () {
    const {loading, error, data, refetch} = useQuery(QUERY_All_Tags);

    const onTagUpdate = () => {
        refetch();
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :</p>;
    return (
        <>
        {data.tags.map((tag)=> (
            <TagItem initTag={tag} onChange={onTagUpdate}/>
        ))}
       </>
    );
}


export function TagItem ({initTag, onChange}) {
    const [AddTag, { data, loading, error }] = useMutation(MUTATE_Add_Tag);

    const [tag, setTag] = useState(initTag);
    const [resultText] = useState('');

    const handleSubmit = async (event) => {
        try{
            const sentTag = {
                id: '',
                name: tag.name,
                description: tag.description
            }

            await AddTag({ variables: { tag: sentTag } });
            onChange(sentTag)
        } catch (err) {
            console.log(err);
        }
    };

    const onInputChange = (event, field) => {
        setTag((prevTag) => ({
            ...prevTag, // Spread previous state
            [field]: event.target.value, // Update the specific field dynamically
        }));
    };

    return (
        <div>
            <input id="text-input-name" type="text" value={tag.name} onChange={(event) => onInputChange(event, "name")} placeholder={initTag.name} />
            <input id="text-input-description" type="text" value={tag.description} onChange={(event) => onInputChange(event, "description")} placeholder={initTag.description} />
            <input id="text-input-type" type="text" value={tag.type} onChange={(event) => onInputChange(event, "type")} placeholder={initTag.type} />

            <button onClick={handleSubmit}>Submit</button>
            <p>{resultText}</p>
        </div>
    );

}