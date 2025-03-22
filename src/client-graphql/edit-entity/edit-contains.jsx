import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';

//import './edit-contains.css'
import { capitalizeFirst } from '../util.js'



export function EditContainsComponent({id, type, initContents}) {
    const queries = {
        addRelation: addRelationMutation(),
        removeRelation: removeRelationMutation(),
    }

    const [Add] = useMutation(queries.addRelation);
    const [Remove] = useMutation(queries.removeRelation);

    const [contents, setContents] = useState(initContents);

    useEffect(() => {
        setContents(initContents);
      }, [initContents]);

    // const onInputChange = (event, field) => {
    //     setEntity((prevEntity) => ({
    //         ...prevEntity, // Spread previous state
    //         [field]: event.target.value, // Update the specific field dynamically
    //     }));
    // };

    return (
        <div className="relation-list m-5">
            <h3 class="text-xl font-bold text-gray-400 leading-tight tracking-tight">{capitalizeFirst(type)}s</h3>
            <ol>
                {contents.filter((content) => {
                    return content._nodeType == type
                }).map((content)=> (
                   <li key={content.id} className="flex gap-4 p-4">
                        <div className="bg-blue-200 p-4 rounded w-auto">
                            <h5>{content.properties.name}</h5>
                        </div>
                   </li>
                ))}
            </ol>
        </div>
    );
}

function addRelationMutation() {
    let mutationGQL = `
       mutation RelateContains($relation: RelatableInput!) {
        relateContains(relation: $relation) {
            message
        }
        }
    `;

    return gql`${mutationGQL}`
}

function removeRelationMutation() {
    let mutationGQL = `
       mutation UnrelateContains($relation: RelatableInput!) {
        relateContains(relation: $relation) {
            message
        }
        }
    `;

    return gql`${mutationGQL}`
}