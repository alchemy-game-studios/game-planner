import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { RichTextEditor } from "@/components/rich-text-editor";
import { ConnectionSignalBar, MentionToastContainer } from "@/components/connections";
import { useMentionRelationship } from "@/hooks/use-mention-relationship";
import { ProductsSection } from "@/components/products-section";
import { EntityAdaptationsSection } from "@/components/entity-adaptations-section";




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
        events: [],
        products: [],
        adaptations: []
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
    const [Get] = useLazyQuery(queries.one, { fetchPolicy: 'network-only' });

    const HandleEdit = async () => {
        // Filter properties to only include fields valid for this entity type
        const baseFields = ['id', 'name', 'description', 'type'];
        const eventFields = [...baseFields, 'day', 'startDate', 'endDate'];
        const validFields = type === 'event' ? eventFields : baseFields;

        const filteredProps = {};
        for (const field of validFields) {
            if (entity.properties[field] !== undefined) {
                filteredProps[field] = entity.properties[field];
            }
        }

        const networkObj = {
          variables: {}
        };
        networkObj.variables[type] = removeTypeName(filteredProps);

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

    // Toast state for mention confirmations
    const [mentionToasts, setMentionToasts] = useState([]);

    const handleMentionToast = useCallback((toast) => {
        setMentionToasts(prev => [...prev, toast]);
    }, []);

    const handleDismissToast = useCallback((toastId) => {
        setMentionToasts(prev => prev.filter(t => t.id !== toastId));
    }, []);

    // Mention relationship hook
    const { createRelationship } = useMentionRelationship({
        currentEntityType: type,
        currentEntityId: id,
        onRelationshipCreated: async () => {
            // Refetch entity data when a relationship is created
            console.log('Relationship created, refetching entity data...');
            const result = await Get({ variables: { obj: { id } } });
            console.log('Refetched entity:', result.data?.[type]);
            if (result.data && result.data[type]) {
                const newEntity = result.data[type];
                setEntity(newEntity);
                const groupedResult = grouped(newEntity.contents || []);
                const allGroupedResult = grouped(newEntity.allContents || []);
                setRelationGroups(groupedResult);
                setAllRelationGroups(allGroupedResult);
                console.log('Updated entity state with new data');
            }
        },
        onToast: handleMentionToast
    });


    useEffect(() => {
        const fetchData = async() => {
            if (id) {
                const result = await Get({ variables: { obj: { id } } });
                if (!result.data || !result.data[type]) {
                    console.error('Failed to fetch entity:', result);
                    return;
                }
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
            <div className="fixed top-10 left-0 w-full bg-background z-50">
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
                    <Badge className="bg-ck-forge text-foreground font-heading text-2xl size-14 pl-20 pr-20 pt-3 pb-3 justify-center text-center m-auto mb-7.5 mr-8">{capitalizeFirst(type)}</Badge>
                </div>
                <Separator />
            </div>
            <div className="flex mt-30 gap-6 h-[calc(100vh-10rem)]">
            <div className="flex-1 pr-4 overflow-y-auto">
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

                {/* Description - Rich Text Editor (editable or read-only) */}
                <RichTextEditor
                    key={entity.universeId || 'loading'}
                    value={description}
                    onChange={setDescription}
                    entityType={type}
                    entityId={id}
                    universeId={entity.universeId}
                    onMentionInsert={createRelationship}
                    placeholder="Start writing... Use @ to mention entities"
                    readOnly={!editMode}
                />



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

        <div id="related-contains" className="w-72 flex-shrink-0 mt-5 overflow-y-auto">
            {/* Products section - only for universes */}
            {type === 'universe' && (
                <ProductsSection
                    products={entity.products || []}
                    universeId={id}
                    onRefetch={() => Get({ variables: { obj: { id } } }).then(result => {
                        if (result.data?.[type]) {
                            setEntity(result.data[type]);
                        }
                    })}
                />
            )}

            {/* Entity adaptations section - for non-universes */}
            {type !== 'universe' && (
                <EntityAdaptationsSection
                    adaptations={entity.adaptations || []}
                    entityName={entity.properties?.name || 'Entity'}
                />
            )}

            <ConnectionSignalBar
                entity={entity}
                entityType={type}
                entityId={id}
                universeId={entity.universeId}
                onRefetch={() => Get({ variables: { obj: { id } } })}
            />
        </div>
        </div>
        </div>

        {/* Mention toast notifications */}
        <MentionToastContainer
            toasts={mentionToasts}
            onDismiss={handleDismissToast}
        />

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

// Base entity fields shared by all entity types
const ENTITY_FIELDS = `
    id
    universeId
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
        day
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
        _nodeType
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
    adaptations {
        id
        cardName
        flavorText
        product {
            id
            name
            type
            gameType
        }
    }
`;

// Universe-specific query includes products
const UNIVERSE_QUERY = gql`
    query Universe($obj: IdInput!) {
        universe(obj: $obj) {
            ${ENTITY_FIELDS}
            products {
                id
                name
                description
                type
                gameType
                universe {
                    id
                    name
                }
            }
        }
    }
`;

function oneQuery(type) {
    // Use pre-built universe query for universe type
    if (type === 'universe') {
        return UNIVERSE_QUERY;
    }

    let nodeType = capitalizeFirst(type)

    let queryStr = `
    query ${nodeType}($obj: IdInput!) {
            ${type}(obj: $obj) {
                ${ENTITY_FIELDS}
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

