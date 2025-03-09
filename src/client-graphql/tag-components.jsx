import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import './Tags.css'
import e from 'cors';

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

const MUTATE_Remove_Tag = gql`
    mutation RemoveTag($tag: TagInput!) {
        removeTag(tag: $tag) {
           message
        }
    }
`;

export function Tags () {
    const {loading, error, data, refetch} = useQuery(QUERY_All_Tags);

    const [isAddingTag, setIsAddingTag] = useState(false);
    const [isEditingTag, setIsEditingTag] = useState(false);
    const [editTag, setEditTag] = useState({});

    const onTagUpdate = () => {
        refetch({ fetchPolicy: "network-only" });
    }

    const onAddTagClose = () => {
        setIsAddingTag(false)
    }

    const onAddTagOpen = () => {
        setIsAddingTag(!isAddingTag)
        setIsEditingTag(false)
    }

    const onEditTagOpen = (tag) => {
        setIsAddingTag(false); // Ensure add mode is off
        setIsEditingTag(true); // Ensure edit mode is on
    
        setEditTag((prevTag) => {
            // If the same tag is clicked again, close editing
            if (prevTag.id === tag.id) {
                setIsEditingTag(false);
                return {}; // Reset editTag
            }
            return tag; // Otherwise, set new tag
        });
    };
    

    const onEditTagClose = () => {
        setIsEditingTag(false)
    }



    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :</p>;
    return (
        <>
        <ol className="tag-list">
        <button class="open-add-tag" onClick={onAddTagOpen}>+</button>
        {data.tags.map((tag)=> (
            <button key={tag.id} onClick={() => onEditTagOpen(tag)}>
            <TagItem initTag={tag} onChange={onTagUpdate}/>
            </button>
        ))}
        
        </ol>
        {isAddingTag && !isEditingTag && (
            <div className="add-tag" >
                <div className="close">
                    <button onClick={onAddTagClose}>X</button>
                </div>
                <h3>
                    Add New Tag
                </h3>
            
                <TagEditItem initTag={{
                    name: '',
                    description: ''
                }} onChange={onTagUpdate} />
             </div>
        )}
        {!isAddingTag && isEditingTag && (
            <div className="add-tag" key={editTag.id}>
                <div className="close">
                    <button onClick={onEditTagClose}>X</button>
                </div>
                <h3>
                    Edit Tag
                </h3>
            
                <TagEditItem key={editTag.id} initTag={{
                    name: editTag.name,
                    description: editTag.description,
                    type: editTag.type
                }} onChange={onTagUpdate} />
             </div>
        )}
       </>
      
    );
}

export function TagItem ({initTag, onChange}) {
    const [RemoveTag, { data, loading, error }] = useMutation(MUTATE_Remove_Tag);

    const [tag] = useState(initTag);

    const handleDelete = async (event) => {
        try{
            const sentTag = {
                id: tag.id,
                name: tag.name,
                description: tag.description,
                type: tag.type
            }

            await RemoveTag({ variables: { tag: sentTag } });

            onChange()
        } catch (err) {
            console.log(err);
        }
    };

    return (
       
        <li className={"tag " + tag.type}>{tag.name}
            <button className="delete" onClick={handleDelete}>
                X
            </button>
        </li>
    );

}

export function TagEditItem ({initTag, onChange}) {
    const [AddTag, { data, loading, error }] = useMutation(MUTATE_Add_Tag);

    const [tag, setTag] = useState(initTag);
    const [resultText] = useState('');

    const handleSubmit = async (event) => {
        try{
            const sentTag = {
                id: '',
                name: tag.name,
                description: tag.description,
                type: tag.type
            }

            await AddTag({ variables: { tag: sentTag } });
            onChange()

            
            setTag({
                id: '',
                name: '',
                description: '',
                type: ''
            })
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
        <div className="edit">
            <div className="field">
                <h5>Tag Name</h5>
                <input id="text-input-name" type="text" value={tag.name} onChange={(event) => onInputChange(event, "name")} placeholder={initTag.name} />
            </div>
            <div className="field">
                <h5>Tag Type</h5>
                <input id="text-input-type" type="text" value={tag.type} onChange={(event) => onInputChange(event, "type")} placeholder={initTag.type} />
            </div>
            <div className="field">
                <h5>Tag Description</h5>
                <textarea id="text-input-description" type="text" value={tag.description} onChange={(event) => onInputChange(event, "description")} placeholder={initTag.description} />
            </div>
            <button className="add" onClick={handleSubmit}>Add Tag</button>
            <p>{resultText}</p>
        </div>
    );

}