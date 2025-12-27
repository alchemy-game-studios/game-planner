import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect, useRef} from 'react';
//import './edit-entity.css'
import { EditContainsComponent } from './edit-contains'
import { capitalizeFirst, grouped } from '../util.js'
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { NodeList } from './node-list.jsx';
import { EditableNodeList } from './editable-node-list.tsx';
import { Textarea } from "@/components/ui/textarea"
import { removeTypeName } from '../util.js'
import { HoverEditableText } from './hover-editable-text.jsx';
import { getEntityImage, getPlaceholderImage } from "@/media/util"
import { TagPills } from "@/components/tag-pills"
import { ImageGallery } from "@/components/image-gallery"
import { useBreadcrumbs } from "@/context/breadcrumb-context"
import { Link } from 'react-router-dom';




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
    const { push: pushBreadcrumb } = useBreadcrumbs();

    const hasHydrated = useRef(false);
    const initialEntity = useRef(null);

    const initEntity = {
        properties: {
            id: '',
            name: '',
            description: '',
            type: ''
        },
        contents: [],
        allContents: [],
        tags: [],
        images: [],
        allImages: [],
        locations: [],
        participants: [],
        parentNarrative: null,
        events: []
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
    const [allRelationGroups, setAllRelationGroups] = useState([]);
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
                console.log('Fetched entity:', result.data[type]);
                console.log('Contents:', result.data[type].contents);
                console.log('AllContents:', result.data[type].allContents);
                const groupedResult = grouped(result.data[type].contents)
                const allGroupedResult = grouped(result.data[type].allContents || [])
                console.log('Grouped result:', groupedResult);
                console.log('All grouped result:', allGroupedResult);
                setEntity(result.data[type])
                setDescription(result.data[type].properties.description || '');
                setName(result.data[type].properties.name)
                setRelationGroups(groupedResult)
                setAllRelationGroups(allGroupedResult)

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

                // Push to breadcrumb trail
                pushBreadcrumb({
                    id: id,
                    name: result.data[type].properties.name,
                    type: type,
                    path: `/edit/${type}/${id}`
                });
            }
        }

        fetchData()

    }, [id, Get, type, pushBreadcrumb]);

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

    // Get the best background image - use placeholder if no images exist
    const hasImages = entity.images && entity.images.length > 0;
    const backgroundImageUrl = hasImages
        ? getEntityImage(id, "hero")
        : getPlaceholderImage("hero");
    const avatarImageUrl = hasImages
        ? getEntityImage(id, "avatar")
        : getPlaceholderImage("avatar");

    return (
        <>
        <div
            className="fixed scale-150 inset-0 pointer-events-none -z-10 bg-cover bg-center opacity-5"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
        <div className="relative z-10">
            <div className="fixed top-10 left-0 w-full bg-gray-900 z-50">
                <div className="flex">
                    <Avatar className="size-15 ml-9 mb-3.5 mt-6.5">
                        <AvatarImage src={avatarImageUrl} />
                        <AvatarFallback>{entity.properties.name}</AvatarFallback>
                    </Avatar>
                    
                    <div className="w-full">
                            <HoverEditableText
                                value={name}
                                onChange={setName}
                                className="font-heading text-color-secondary !md:text-5xl !text-5xl"
                            />
                            
                    </div>
                    <Badge className=" bg-yellow-700 font-heading text-2xl size-14 pl-20 pr-20 pt-3 pb-3 justify-center text-center m-auto mb-7.5 mr-8">{capitalizeFirst(type)}</Badge>
                </div>
                <Separator />
            </div>
            <div className="flex mt-30 gap-6">
            <div className="flex-1 pr-4">
                <div className="rounded mt-5 relative w-full">
                        <ImageGallery
                            images={entity.images || []}
                            allImages={entity.allImages || []}
                            entityId={id}
                            entityType={type}
                            entityName={entity.properties.name}
                            onUpdate={() => {
                                console.log('Images updated - refetching');
                                Get({ variables: { obj: { id } } });
                            }}
                            fallbackImage={backgroundImageUrl}
                        />
                </div>

                {/* Tag Pills */}
                <div className="mt-4">
                    <TagPills
                        tags={entity.tags || []}
                        parentId={id}
                        parentType={type}
                        onUpdate={() => {
                            console.log('Tags updated');
                        }}
                    />
                </div>

                {/* Parent Narrative link for Events */}
                {type === 'event' && entity.parentNarrative && (
                    <div className="mt-4 mb-2">
                        <span className="text-gray-400 text-sm">Part of: </span>
                        <Link
                            to={`/edit/narrative/${entity.parentNarrative.id}`}
                            className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                        >
                            {entity.parentNarrative.name}
                        </Link>
                    </div>
                )}

                {editMode && (
                    <>
                       <HoverEditableText
                            value={description}
                            onChange={setDescription}
                            multiline
                        />
                    </>
                    )}


        {!editMode && type === 'narrative' && (
            <>
              {/* Story-styled description for Narratives */}
              <div className="flex w-full mt-9 pr-15">
                    <div className="bg-gray-800/50 rounded-lg p-6 border-l-4 border-amber-600">
                        <p className="text-2xl font-serif text-gray-100 leading-relaxed whitespace-pre-line italic">
                            {entity.properties.description}
                        </p>
                    </div>
                </div>
            </>
          )}

        {!editMode && type !== 'narrative' && (
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
          
        <div id="related-contains" className="w-72 flex-shrink-0 flex flex-col gap-4 mt-5 relative z-10">
            {/* Show narratives (for universes) */}
            {allRelationGroups['narrative'] && allRelationGroups['narrative'].length > 0 && (
                <EditableNodeList
                    initContents={allRelationGroups['narrative']}
                    parentId={id}
                    parentType={type}
                    entityType="narrative"
                    maxItems={5}
                    onUpdate={() => {
                      Get({ variables: { obj: { id } } });
                    }}
                />
            )}

            {/* Show events (for narratives, and for places/characters/items) */}
            {allRelationGroups['event'] && allRelationGroups['event'].length > 0 && (
                <EditableNodeList
                    initContents={allRelationGroups['event']}
                    parentId={id}
                    parentType={type}
                    entityType="event"
                    maxItems={5}
                    onUpdate={() => {
                      Get({ variables: { obj: { id } } });
                    }}
                />
            )}

            {/* Show events for places, characters, items (from 'events' field) */}
            {entity.events && entity.events.length > 0 && !allRelationGroups['event'] && (
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Events</h3>
                    <ol className="space-y-1">
                        {entity.events.map((event) => (
                            <li key={event.id}>
                                <Link
                                    to={`/edit/event/${event.id}`}
                                    className="block p-2 rounded hover:bg-gray-800 transition-colors"
                                >
                                    <span className="text-sm text-gray-200">{event.name}</span>
                                    {event.type && (
                                        <span className="text-xs text-gray-500 ml-2">({event.type})</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Show all descendant entity types with max 5 items each */}
            {allRelationGroups['place'] && allRelationGroups['place'].length > 0 && (
                <EditableNodeList
                    initContents={allRelationGroups['place']}
                    parentId={id}
                    parentType={type}
                    entityType="place"
                    maxItems={5}
                    onUpdate={() => {
                      Get({ variables: { obj: { id } } });
                    }}
                />
            )}

            {allRelationGroups['character'] && allRelationGroups['character'].length > 0 && (
                <EditableNodeList
                    initContents={allRelationGroups['character']}
                    parentId={id}
                    parentType={type}
                    entityType="character"
                    maxItems={5}
                    onUpdate={() => {
                      Get({ variables: { obj: { id } } });
                    }}
                />
            )}

            {allRelationGroups['item'] && allRelationGroups['item'].length > 0 && (
                <EditableNodeList
                    initContents={allRelationGroups['item']}
                    parentId={id}
                    parentType={type}
                    entityType="item"
                    maxItems={5}
                    onUpdate={() => {
                      Get({ variables: { obj: { id } } });
                    }}
                />
            )}

            {/* Show empty state if no descendants at all */}
            {(!allRelationGroups['narrative'] || allRelationGroups['narrative'].length === 0) &&
             (!allRelationGroups['event'] || allRelationGroups['event'].length === 0) &&
             (!entity.events || entity.events.length === 0) &&
             (!allRelationGroups['place'] || allRelationGroups['place'].length === 0) &&
             (!allRelationGroups['character'] || allRelationGroups['character'].length === 0) &&
             (!allRelationGroups['item'] || allRelationGroups['item'].length === 0) && (
                <div className="text-gray-500 text-sm text-center py-4">
                    No related entities
                </div>
            )}
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
                allContents {
                    _nodeType
                    properties {
                        id
                        name
                        description
                        type
                    }
                    parentId
                    parentName
                    depth
                }
                properties {
                    id
                    name
                    description
                    type
                    startDate
                    endDate
                }
                tags {
                    id
                    name
                    description
                    type
                }
                images {
                    id
                    filename
                    url
                    mimeType
                    size
                    rank
                }
                allImages {
                    id
                    filename
                    url
                    mimeType
                    size
                    rank
                    entityId
                    entityName
                    entityType
                }
                locations {
                    id
                    name
                    description
                    type
                }
                participants {
                    id
                    name
                    description
                    type
                }
                parentNarrative {
                    id
                    name
                    description
                    type
                }
                events {
                    id
                    name
                    description
                    type
                    startDate
                    endDate
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

