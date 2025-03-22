import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import './Tags.css'


export function EditEntityComponent({id, type}) {
    let nodeType = capitalizeFirst(type)

    const queries = {
        all: allQuery(type),
        one: oneQuery(type),
        add:  mutationQuery(type, "add"),
        remove:  mutationQuery(type, "remove"),
        edit: mutationQuery(type, "edit")
    }

    console.log(queries);

    const [Add] = useMutation(queries.add);
    const [Edit] = useMutation(queries.edit);
    const [Get] = useLazyQuery(queries.one);

    const initEntity = {
        id: '',
        name: '',
        description: '',
        type: ''
    }

    const [entity, setEntity] = useState(initEntity);
    const [resultText] = useState('');

    useEffect(() => {
        const fetchData = async() => {
            if (id) {
                const result = await Get({ variables: { obj: { id } } });
                console.log(result.data)
                setEntity(result.data[type].properties)
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
        <div className="edit">
            <div className="field">
                <h5>{nodeType} Name</h5>
                <input id="text-input-name" type="text" value={entity.name} onChange={(event) => onInputChange(event, "name")} placeholder={initEntity.name} />
            </div>
            <div className="field">
                <h5>{nodeType} Type</h5>
                <input id="text-input-type" type="text" value={entity.type} onChange={(event) => onInputChange(event, "type")} placeholder={initEntity.type} />
            </div>
            <div className="field">
                <h5>{nodeType} Description</h5>
                <textarea id="text-input-description" type="text" value={entity.description} onChange={(event) => onInputChange(event, "description")} placeholder={initEntity.description} />
            </div>
            
            {(entity.id != null && entity.id != '') && (
                <>
                <button className="edit" onClick={handleEdit}>Edit {nodeType}</button>
                <p>{resultText}</p>
                </>
            )}

            {(entity.id == null || entity.id == '') && (
                <>
                <button className="add" onClick={handleAdd}>Add New {nodeType}</button>
                <p>{resultText}</p>
                </>
            )}  
            
        </div>
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

function capitalizeFirst(str) {
    if (!str) return '';
    return str[0].toUpperCase() + str.slice(1);
  }

// export function Tags () {
//     const {loading, error, data, refetch} = useQuery(QUERY_All_Tags);

//     const [isAddingTag, setIsAddingTag] = useState(false);
//     const [isEditingTag, setIsEditingTag] = useState(false);
//     const [editTag, setEditTag] = useState({});
//     const [, forceUpdate] = useState(0);

//     const onTagUpdate = async  (updated) => {
//         console.log("refetching")
//         await refetch();
//         forceUpdate(Math.random());

//         setIsEditingTag(false)
//         setIsAddingTag(false)
//     }

//     const onAddTagClose = () => {
//         setIsAddingTag(false)
//     }

//     const onAddTagOpen = () => {
//         setIsAddingTag(!isAddingTag)
//         setIsEditingTag(false)
//     }

//     const onEditTagOpen = (tag) => {
//         setIsAddingTag(false); // Ensure add mode is off
//         setIsEditingTag(true); // Ensure edit mode is on
    
//         setEditTag((prevTag) => {
//             // If the same tag is clicked again, close editing
//             if (tag && prevTag && prevTag.id === tag.id) {
//                 setIsEditingTag(false);
//                 return {}; // Reset editTag
//             }
//             return tag; // Otherwise, set new tag
//         });
//     };
    

//     const onEditTagClose = () => {
//         setIsEditingTag(false)
//     }



//     if (loading) return <p>Loading...</p>;
//     if (error) return <p>Error :</p>;
    
//     return (
//         <>
//         <ol className="tag-list">
//         <button class="open-add-tag" onClick={onAddTagOpen}>+</button>
//         {data.tags.map((tag)=> (
//             <button class="tag-open" key={Math.random()} onClick={() => onEditTagOpen(tag)}>
//             <TagItem key={tag.id} initTag={tag} onChange={onTagUpdate}/>
//             </button>
//         ))}
        
//         </ol>
//         {isAddingTag && !isEditingTag && (
//             <div className="add-tag" >
//                 <div className="close">
//                     <button onClick={onAddTagClose}>X</button>
//                 </div>
//                 <h3>
//                     Add New Tag
//                 </h3>
            
//                 <TagEditItem key={Math.random()} initTag={{
//                     name: '',
//                     description: ''
//                 }} onChange={onTagUpdate} />
//              </div>
//         )}
//         {!isAddingTag && isEditingTag && (
//             <div className="add-tag">
//                 <div className="close">
//                     <button onClick={onEditTagClose}>X</button>
//                 </div>
//                 <h3>
//                     Edit Tag
//                 </h3>
            
//                 <TagEditItem key={editTag.id} initTag={{
//                     id: editTag.id,
//                     name: editTag.name,
//                     description: editTag.description,
//                     type: editTag.type
//                 }} onChange={onTagUpdate} />
//              </div>
//         )}
//        </>
      
//     );
// }

// export function TagItem ({initTag, onChange}) {
//     useEffect(() => {
//         console.log("TagItem updated:", initTag);
//     }, [initTag]);

//     const [RemoveTag, { data, loading, error }] = useMutation(MUTATE_Remove_Tag);

//     const [tag] = useState(initTag);

//     const handleDelete = async (event) => {
//         event.stopPropagation();
//         try{
//             const sentTag = {
//                 id: tag.id,
//                 name: tag.name,
//                 description: tag.description,
//                 type: tag.type
//             }

//             await RemoveTag({ variables: { tag: sentTag } });

//             onChange(sentTag)
            
//         } catch (err) {
//             console.log(err);
//         }
//     };

//     return (
       
//         <li className={"tag " + tag.type}>{tag.name}
//             <button className="delete" onClick={handleDelete}>
//                 X
//             </button>
//         </li>
//     );

// }

// export function TagEditItem ({initTag, onChange}) {
//     const [AddTag] = useMutation(MUTATE_Add_Tag);
//     const [EditTag] = useMutation(MUTATE_Edit_Tag);


//     const [tag, setTag] = useState(initTag);
//     const [resultText] = useState('');

//     useEffect(() => {
//         setTag(initTag);  // Sync state when initTag changes
//     }, [initTag]);  // Runs whenever initTag updates

//     const handleAdd = async (event) => {
//         try{
//             const sentTag = {
//                 id: '',
//                 name: tag.name,
//                 description: tag.description,
//                 type: tag.type
//             }

//             await AddTag({ variables: { tag: sentTag } });
//             onChange()

            
//             setTag({
//                 id: '',
//                 name: '',
//                 description: '',
//                 type: ''
//             })
//         } catch (err) {
//             console.log(err);
//         }
//     };

//     const handleEdit = async (event) => {
//         try{
//             const sentTag = {
//                 id: tag.id,
//                 name: tag.name,
//                 description: tag.description,
//                 type: tag.type
//             }

//             await EditTag({ variables: { tag: sentTag } });
//             console.log("calling on change " + sentTag)
//             onChange(sentTag)
//         } catch (err) {
//             console.log(err);
//         }
//     };


//     const onInputChange = (event, field) => {
//         setTag((prevTag) => ({
//             ...prevTag, // Spread previous state
//             [field]: event.target.value, // Update the specific field dynamically
//         }));
//     };

//     return (
//         <div className="edit">
//             <div className="field">
//                 <h5>Tag Name</h5>
//                 <input id="text-input-name" type="text" value={tag.name} onChange={(event) => onInputChange(event, "name")} placeholder={initTag.name} />
//             </div>
//             <div className="field">
//                 <h5>Tag Type</h5>
//                 <input id="text-input-type" type="text" value={tag.type} onChange={(event) => onInputChange(event, "type")} placeholder={initTag.type} />
//             </div>
//             <div className="field">
//                 <h5>Tag Description</h5>
//                 <textarea id="text-input-description" type="text" value={tag.description} onChange={(event) => onInputChange(event, "description")} placeholder={initTag.description} />
//             </div>
            
//             {(tag.id != null && tag.id != '') && (
//                 <>
//                 <button className="edit" onClick={handleEdit}>Edit Tag</button>
//                 <p>{resultText}</p>
//                 </>
//             )}

//             {(tag.id == null || tag.id == '') && (
//                 <>
//                 <button className="add" onClick={handleAdd}>Add New Tag</button>
//                 <p>{resultText}</p>
//                 </>
//             )}  
            
//         </div>
//     );

//}