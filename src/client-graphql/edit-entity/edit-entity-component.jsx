import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
//import './edit-entity.css'
import { EditContainsComponent } from './edit-contains'
import { capitalizeFirst, grouped } from '../util.js'




export function EditEntityComponent({id, type}) {
    let nodeType = capitalizeFirst(type)

    const queries = {
        all: allQuery(type),
        one: oneQuery(type),
        add:  mutationQuery(type, "add"),
        remove:  mutationQuery(type, "remove"),
        edit: mutationQuery(type, "edit")
    }

    const [Add] = useMutation(queries.add);
    const [Edit] = useMutation(queries.edit);
    const [Get] = useLazyQuery(queries.one);

    const initEntity = {
        properties: {
            id: '',
            name: '',
            description: '',
            type: ''
        },
        contents: []
       
    }

    const [entity, setEntity] = useState(initEntity);
    const [resultText] = useState('');

    useEffect(() => {
        const fetchData = async() => {
            if (id) {
                const result = await Get({ variables: { obj: { id } } });
                console.log(result.data[type])
                setEntity(result.data[type])
            }
        }

        fetchData()
      
    }, [id, Get]);

       
        


    const handleAdd = async (event) => {
        try{
            const sentEntity = {
                name: entity.name,
                description: entity.description,
                type: entity.type
            }

            params = { variables: { } }
            params.variables[type] = sentEntity

            await Add(params);
            onChange()

            setEntity({
                id: '',
                name: '',
                description: '',
                type: ''
            })
        } catch (err) {
            console.log(err);
        }
    };

    const handleEdit = async (event) => {
        try{
            const sentEntity = {
                id: entity.id,
                name: entity.name,
                description: entity.description,
                type: entity.type
            }

            params = { variables: { } }
            params.variables[type] = sentEntity

            await Edit(params);
            onChange(sentEntity)
        } catch (err) {
            console.log(err);
        }
    };


    const onInputChange = (event, field) => {
        setEntity((prevEntity) => ({
            ...prevEntity, // Spread previous state
            [field]: event.target.value, // Update the specific field dynamically
        }));
    };

    return (
        <>
        {/* <h2 className="text-3xl font-bold text-gray-200 leading-tight tracking-tight">
            {entity.properties.name}
        </h2>
        <div className="edit m-5">
            <div className="field m-3">
                <h5 className="text-xl font-bold text-gray-200 leading-tight tracking-tight">{nodeType} Name</h5>
                <input id="text-input-name" type="text" className="bg-gray-700 text-gray-100 rounded p-4 w-100" value={entity.properties.name} onChange={(event) => onInputChange(event, "name")} placeholder={initEntity.properties.name} />
            </div>
            <div className=" m-3">
                <h5 className="text-xl font-bold text-gray-200 leading-tight tracking-tight">{nodeType} Type</h5>
                <input id="text-input-type" type="text" className="bg-gray-700 text-gray-100 rounded p-4 w-100" value={entity.properties.type} onChange={(event) => onInputChange(event, "type")} placeholder={initEntity.properties.type} />
            </div>
            <div className="field  m-3">
                <h5 className="text-xl font-bold text-gray-200 leading-tight tracking-tight">{nodeType} Description</h5>
                <textarea id="text-input-description" type="text" className="bg-gray-700 resize-y w-100 min-h-[100px] p-4 border rounded" value={entity.properties.description} onChange={(event) => onInputChange(event, "description")} placeholder={initEntity.properties.description} />
            </div>
            
            {(entity.id != null && entity.id != '') && (
                <>
                <button className="edit bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer m-5" onClick={handleEdit}>Edit {nodeType}</button>
                <p>{resultText}</p>
                </>
            )}

            {(entity.id == null || entity.id == '') && (
                <>
                <button className="add" onClick={handleAdd}>Add New {nodeType}</button>
                <p>{resultText}</p>
                </>
            )} */}

            <>
            {
            
            Object.entries(grouped(entity.contents)).map(([_type, items]) => (
                
                <EditContainsComponent
                key={_type}
                id={id}
                type={_type}
                initContents={items}
                />
               
            ))}
             <hr />
            </> 
        {/* </div> */}
        </>
    );
}

function allQuery(type) {
    let nodeType = capitalizeFirst(type)
    return gql`
            query ${nodeType}s {
                    ${type} {
                        id
                        contents {
                            _nodeType
                            properties {
                                id
                            }
                        }
                        properties {
                            id
                            name
                            description
                            type
                        }
                        tags {
                            id
                        }
                    }
            }
        `;
}

function oneQuery(type) {
    let nodeType = capitalizeFirst(type)

    let queryStr = `
    query ${nodeType}($obj: IdInput!) {
            ${type}(obj: $obj) {
                id
                contents {
                    _nodeType
                    properties {
                        id
                        name
                        description
                        type
                    }
                }
                properties {
                    name
                    description
                    type
                }
                tags {
                    id
                    name
                    description
                    type
                }
            }
    }
`

    return gql`${queryStr}`
}

function mutationQuery(type, mutation) {
    let nodeType = capitalizeFirst(type)
    let mutationCommand = capitalizeFirst(mutation)
    let mutationGQL = `
        mutation ${mutationCommand}${nodeType}($${type}: ${nodeType}Input!) {
            ${mutation}${nodeType}(${type}: $${type}) {
                message
            }
        }
    `;

    return gql`${mutationGQL}`
}

