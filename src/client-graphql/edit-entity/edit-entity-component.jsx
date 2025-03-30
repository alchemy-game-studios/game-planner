import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect, useRef} from 'react';
//import './edit-entity.css'
import { EditContainsComponent } from './edit-contains'
import { capitalizeFirst, grouped } from '../util.js'
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { NodeList } from './node-list.jsx';
import { Textarea } from "@/components/ui/textarea"
import { removeTypeName } from '../util.js'
import { HoverEditableText } from './hover-editable-text.jsx';



function useDebounce(value, delay = 500) {
    const [debounced, setDebounced] = useState(value);
  
    useEffect(() => {
      const timeout = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(timeout);
    }, [value, delay]);
  
    return debounced;
}

export function EditEntityComponent({id, type, isEdit}) {
    let nodeType = capitalizeFirst(type)

    const hasHydrated = useRef(false);
    const initialEntity = useRef(null);

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

    const queries = {
        all: allQuery(type),
        one: oneQuery(type),
        add:  mutationQuery(type, "add"),
        remove:  mutationQuery(type, "remove"),
        edit: mutationQuery(type, "edit")
    }

    const networkObj = { variables: { } }
    networkObj.variables[type] = entity

    const [Add] = useMutation(queries.add);
    const [EditMutation] = useMutation(queries.edit);
    const [Get] = useLazyQuery(queries.one);

    const HandleEdit = async () => {
        const networkObj = {
          variables: {}
        };
        networkObj.variables[type] = removeTypeName(entity.properties);
      
        try {
            await EditMutation(networkObj);
        } catch (e) {
            console.log(e);
        }
      };

   

   
    const [relationGroups, setRelationGroups] = useState([]);
    const [relationTypes, setRelationTypes] = useState([]);

    const [resultText] = useState('');
    const [editMode, setEditMode] = useState(isEdit);
    const [description, setDescription] = useState('');
    const deboucedDescription = useDebounce(description);

    const [name, setName] = useState('');
    const deboucedName = useDebounce(name);


    useEffect(() => {
        const fetchData = async() => {
            if (id) {
                const result = await Get({ variables: { obj: { id } } });
                const groupedResult = grouped(result.data[type].contents)
                setEntity(result.data[type])
                setDescription(result.data[type].properties.description || '');
                setName(result.data[type].properties.name)
                setRelationGroups(groupedResult)

                const typeListItems = Object.keys(groupedResult).map((key) => {
                    console.log("Grouped Contents")
                    console.log(groupedResult[key])
                    return {
                        id: key,
                        properties: {
                            name: capitalizeFirst(key) + "s",
                            contents: groupedResult[key]
                        }
                    };
                });
                setRelationTypes(typeListItems);

                initialEntity.current = result.data[type];
                hasHydrated.current = true;
            }
        }

        fetchData()
      
    }, [id, Get]);

    useEffect(() => {
      setEditMode(isEdit);
    }, [isEdit]);

    useEffect(() => {
        if (deboucedDescription !== '') {
            setEntity(prev => ({
                ...prev,
                properties: {
                    ...prev.properties,
                    description: deboucedDescription
                }
            }));
        }
    }, [deboucedDescription]);

    useEffect(() => {
        if (deboucedName !== '') {
            setEntity(prev => ({
                ...prev,
                properties: {
                    ...prev.properties,
                    name: deboucedName
                }
            }));
        }
    }, [deboucedName]);
    
    useEffect(() => {
        if (!hasHydrated.current) return;
       
        const changed =
            JSON.stringify(entity) !== JSON.stringify(initialEntity.current);

        if (changed) {
            console.log("edit called")
            HandleEdit();
        }
            
    }, [entity]);
    
    const handleBlur = () => {
        HandleEdit(); // save when the user clicks away or presses tab
    };

    return (
        <>
        <div
            className="absolute inset-0 pointer-events-none z-negative bg-cover bg-center opacity-5"
            style={{ backgroundImage: `url('https://cdn.midjourney.com/eaa04c2b-2d11-45ba-85c3-347c41c8c896/0_2.jpeg')` }}
        />
        <div className="z-10">
        <div className="flex">
            <Avatar className="size-15 ml-5 mb-3.5 mr-7 mt-5">
                <AvatarImage src="https://cdn.midjourney.com/eaa04c2b-2d11-45ba-85c3-347c41c8c896/0_2.jpeg" />
                <AvatarFallback>{entity.properties.name}</AvatarFallback>
            </Avatar>
            
            <div className="w-full">
                    <HoverEditableText
                        value={name}
                        onChange={setName}
                        className="font-heading text-color-secondary !md:text-5xl !text-5xl"
                    />
                    
            </div>
            <Badge className=" bg-yellow-700 font-heading text-2xl size-14 pl-20 pr-20 pt-3 pb-3 justify-center text-center m-auto mb-9 mr-8">{capitalizeFirst(type)}</Badge>
        </div>
            <Separator />
            <div className="flex">
            <div className="w-6/8">
                <div className="rounded mt-5 relative w-full aspect-[3/1] overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                            backgroundImage: "url('https://cdn.midjourney.com/eaa04c2b-2d11-45ba-85c3-347c41c8c896/0_2.jpeg')",
                            }}
                        />
                </div>
                {editMode && (
                    <>
                       <HoverEditableText
                            value={description}
                            onChange={setDescription}
                            multiline
                        />
                    </>
                    )}


        {!editMode && (
            <>
              <div className="flex w-full mt-9 pr-15">
                    <p className="text-xl font-book text-gray-200 leading-tight tracking-tight">
                        {entity.properties.description}
                    </p>
                </div>
            </>
          )}
      
          {/* <div id="related-contains" class="flex justify-end m-auto w-full">
            {Object.entries(relationGroups).map(([_type, items]) => (
              <div key={_type}>
                {_type=="place" && (<EditContainsComponent
                  id={id}
                  type={_type}
                  initContents={items}
                />)}
              </div>
            ))}
          </div> */}
          </div>
          
        <div id="related-contains" class="flex w-2/8 justify-end ml-4 mt-1 mr-0">
            <NodeList initContents={relationTypes} />
           
        </div>
        </div>
        </div>
        
        </>
      )};
      

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
                    id
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

