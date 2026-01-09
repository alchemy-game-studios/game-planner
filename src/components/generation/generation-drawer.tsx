import { useState, useEffect, useRef } from 'react';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { RelationshipCard } from './relationship-card';
import { RelationshipDefinition, getRelationshipTypesForEntity } from '@/lib/relationship-config';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  ChevronDown,
  Sparkles,
  Coins,
  Globe,
  MapPin,
  User,
  Package,
  Calendar,
  BookOpen,
  Wand2,
  Tag,
  Heart,
  Plus,
  Eye,
  Search,
  X,
  Link2,
} from 'lucide-react';

// Tag type configuration - matches tag-pills.tsx colors
const TAG_TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  descriptor: {
    label: 'Descriptors',
    icon: Tag,
    color: 'text-blue-200',
    bgColor: 'bg-blue-900/50',
    borderColor: 'border-blue-700',
  },
  feeling: {
    label: 'Feelings',
    icon: Heart,
    color: 'text-purple-200',
    bgColor: 'bg-purple-900/50',
    borderColor: 'border-purple-700',
  },
};

// Entity type configuration with colors and icons
const ENTITY_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  gradient: string;
}> = {
  universe: {
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  place: {
    icon: MapPin,
    color: 'text-ck-teal',
    bgColor: 'bg-ck-teal/20',
    gradient: 'from-ck-teal/20 to-cyan-500/20',
  },
  character: {
    icon: User,
    color: 'text-ck-rare',
    bgColor: 'bg-ck-rare/20',
    gradient: 'from-ck-rare/20 to-blue-500/20',
  },
  item: {
    icon: Package,
    color: 'text-ck-gold',
    bgColor: 'bg-ck-gold/20',
    gradient: 'from-ck-gold/20 to-amber-500/20',
  },
  event: {
    icon: Calendar,
    color: 'text-ck-ember',
    bgColor: 'bg-ck-ember/20',
    gradient: 'from-ck-ember/20 to-orange-500/20',
  },
  narrative: {
    icon: BookOpen,
    color: 'text-ck-ember',
    bgColor: 'bg-ck-ember/20',
    gradient: 'from-ck-ember/20 to-red-500/20',
  },
};

// GraphQL queries
const GET_GENERATION_CONTEXT = gql`
  query GetGenerationContext($input: GenerationContextInput!) {
    generationContext(input: $input) {
      sourceEntity {
        id
        name
        description
        type
        _nodeType
      }
      parentChain {
        id
        name
        _nodeType
      }
      universe {
        id
        name
      }
      siblingEntities {
        id
        name
        description
        _nodeType
      }
      childEntities {
        id
        name
        description
        _nodeType
      }
      suggestedContext {
        id
        name
        description
        _nodeType
      }
      availableTags {
        id
        name
        description
        type
        entityCount
      }
      sourceTagIds
      summary {
        entityCount
        tagCount
      }
    }
  }
`;

const ESTIMATE_COST = gql`
  query EstimateGenerationCost(
    $targetType: String!
    $entityCount: Int
    $creativity: Float
  ) {
    estimateGenerationCost(
      targetType: $targetType
      entityCount: $entityCount
      creativity: $creativity
    ) {
      credits
    }
  }
`;

const GET_CONTEXT_PREVIEW = gql`
  query GetContextPreview($input: GenerationContextPreviewInput!) {
    generationContextPreview(input: $input) {
      markdown
      entityCount
      providerSummaries {
        provider
        count
        summary
      }
    }
  }
`;

const GET_USER_CREDITS = gql`
  query GetUserCredits {
    me {
      credits
    }
  }
`;

const SEARCH_ENTITIES = gql`
  query SearchEntities($query: String!, $universeId: String) {
    searchEntities(query: $query, universeId: $universeId) {
      id
      _nodeType
      properties {
        id
        name
        description
        type
      }
    }
  }
`;

const GENERATE_ENTITY = gql`
  mutation GenerateEntity($input: GenerateEntityInput!) {
    generateEntity(input: $input) {
      entities {
        id
        name
        description
        type
        _nodeType
        tags {
          id
          name
        }
      }
      creditsUsed
      message
    }
  }
`;

interface GenerationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceEntity: {
    id: string;
    name: string;
    type?: string;
    _nodeType?: string;
  };
  universeId: string;
  defaultTargetType?: string;
  onGenerated?: (entity: any) => void;
}

export function GenerationDrawer({
  open,
  onOpenChange,
  sourceEntity,
  universeId,
  defaultTargetType = 'character',
  onGenerated,
}: GenerationDrawerProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipDefinition[]>([]);
  const [showRelationshipSearch, setShowRelationshipSearch] = useState(false);
  const [relationshipSearchTerm, setRelationshipSearchTerm] = useState('');
  const relationshipSearchRef = useRef<HTMLDivElement>(null);

  const targetType = defaultTargetType;
  const targetLabel = targetType.charAt(0).toUpperCase() + targetType.slice(1);
  const targetConfig = ENTITY_CONFIG[targetType] || ENTITY_CONFIG.character;
  const TargetIcon = targetConfig.icon;

  // Fetch context data
  const [fetchContext, { data: contextData, loading: contextLoading, error: contextError }] =
    useLazyQuery(GET_GENERATION_CONTEXT);

  // Fetch cost estimate
  const [fetchCost, { data: costData }] = useLazyQuery(ESTIMATE_COST);

  // Fetch context preview (markdown)
  const [fetchPreview, { data: previewData, loading: previewLoading }] =
    useLazyQuery(GET_CONTEXT_PREVIEW);

  // Fetch user credits
  const { data: userData } = useQuery(GET_USER_CREDITS, { skip: !open });

  // Search entities for context
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_ENTITIES, {
    variables: { query: searchTerm, universeId },
    skip: !searchTerm || searchTerm.length < 2,
  });

  // Search entities for relationships
  const { data: relationshipSearchData, loading: relationshipSearchLoading } = useQuery(SEARCH_ENTITIES, {
    variables: { query: relationshipSearchTerm, universeId },
    skip: !relationshipSearchTerm || relationshipSearchTerm.length < 2,
  });

  // Generate entity mutation
  const [generateEntity, { loading: generating }] = useMutation(GENERATE_ENTITY, {
    onCompleted: (data) => {
      const generated = data.generateEntity;
      console.log('Generation complete:', generated);

      // Show special AI generation success toast
      const entity = generated.entities[0];
      const entityUrl = `/edit/${entity._nodeType}/${entity.id}`;

      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 border border-purple-500/50 rounded-lg p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Sparkles className="h-5 w-5 text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white flex items-center gap-2">
                  AI Generated
                  <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full text-purple-200">
                    {targetType}
                  </span>
                </p>
                <p className="text-purple-100 mt-1">{entity.name}</p>
                <a
                  href={entityUrl}
                  className="inline-flex items-center gap-1 mt-2 text-sm text-purple-300 hover:text-white transition-colors"
                  onClick={() => toast.dismiss(t)}
                >
                  View {targetType} →
                </a>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-purple-300 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000, // Keep visible for 10 seconds
          id: 'generation-success',
        }
      );

      if (onGenerated && generated.entities.length > 0) {
        // Notify parent to trigger refetch
        onGenerated(generated.entities[0]);
      }
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast.error('Generation failed', {
        description: error.message,
      });
    },
    refetchQueries: ['GetUserCredits'], // Refresh credits after generation
  });

  useEffect(() => {
    if (open && sourceEntity.id) {
      fetchContext({
        variables: {
          input: {
            sourceEntityId: sourceEntity.id,
            targetType,
          },
        },
      });
      fetchCost({
        variables: { targetType, entityCount: quantity },
      });
    }
  }, [open, sourceEntity.id, targetType, quantity, fetchContext, fetchCost]);

  useEffect(() => {
    if (!open) {
      setPrompt('');
      setSelectedTagIds([]);
      setSelectedContextIds([]);
      setSelectedEntities([]);
      setQuantity(1);
      setShowAdvanced(false);
      setShowPreview(false);
      setSearchTerm('');
      setShowSearchResults(false);
      setRelationships([]);
      setShowRelationshipSearch(false);
      setRelationshipSearchTerm('');
    }
  }, [open]);

  const context = contextData?.generationContext;

  // Auto-select source entity's tags when context loads
  useEffect(() => {
    if (context?.sourceTagIds?.length > 0 && selectedTagIds.length === 0) {
      setSelectedTagIds(context.sourceTagIds);
    }
  }, [context?.sourceTagIds]);

  const preview = previewData?.generationContextPreview;

  const handlePreviewContext = () => {
    fetchPreview({
      variables: {
        input: {
          sourceEntityId: sourceEntity.id,
          targetType,
          tagIds: selectedTagIds,
          contextEntityIds: selectedContextIds,
        },
      },
    });
    setShowPreview(true);
  };
  const cost = costData?.estimateGenerationCost?.credits ?? 0;
  const userCredits = userData?.me?.credits ?? 0;
  // Allow generation without auth (fake generation) or with sufficient credits
  const isAuthenticated = !!userData?.me;
  const hasEnoughCredits = !isAuthenticated || userCredits >= cost;

  const handleGenerate = () => {
    // Show loading toast
    toast.loading(`Generating ${quantity} ${targetType}(s)...`, {
      id: 'generation',
    });

    // Transform relationships for GraphQL input
    const relationshipInputs = relationships.map((rel) => ({
      entityId: rel.entityId,
      relationshipType: rel.relationshipType,
      customLabel: rel.customLabel || undefined,
    }));

    generateEntity({
      variables: {
        input: {
          parentEntityId: sourceEntity.id,
          targetType,
          prompt: prompt || undefined,
          quantity,
          tagIds: selectedTagIds,
          contextEntityIds: selectedContextIds,
          relationships: relationshipInputs.length > 0 ? relationshipInputs : undefined,
        },
      },
    }).finally(() => {
      // Dismiss loading toast
      toast.dismiss('generation');
    });
  };

  const toggleContext = (entityId: string) => {
    setSelectedContextIds((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  // Get IDs of entities already included automatically (parent chain + source)
  const autoIncludedIds = new Set([
    sourceEntity.id,
    ...(context?.parentChain?.map((e: any) => e.id) || []),
  ]);

  // Show siblings and suggested context as selectable options
  // These are related entities the user can optionally include
  const availableContextEntities = [
    ...(context?.siblingEntities || []),
    ...(context?.childEntities || []),
    ...(context?.suggestedContext || []),
  ].filter((entity, index, self) =>
    // Dedupe by ID
    self.findIndex(e => e.id === entity.id) === index &&
    // Exclude entities already in the auto-included set
    !autoIncludedIds.has(entity.id)
  );

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Build context breadcrumb
  const breadcrumb = context?.parentChain
    ?.map((p: any) => p.name)
    .join(' → ') || sourceEntity.name;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] flex flex-col p-0 top-14 h-[calc(100vh-3.5rem)]">
        {/* Header */}
        <div className="shrink-0">
          <SheetHeader className={`px-6 pt-6 pb-5 bg-gradient-to-r ${targetConfig.gradient}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${targetConfig.bgColor} border border-white/10`}>
                <TargetIcon className={`h-6 w-6 ${targetConfig.color}`} />
              </div>
              <div className="flex-1">
                <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                  <span className={targetConfig.color}>Generate {targetLabel}</span>
                  <Wand2 className="h-4 w-4 text-purple-400 animate-pulse" />
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Creating in <span className="text-foreground font-medium">{sourceEntity.name}</span>
                </p>
              </div>
            </div>
          </SheetHeader>
          {/* Gradient underline */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Prompt - Always visible */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe what you want
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </label>
            <Textarea
              placeholder={`Describe the ${targetType} you want to create...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Summary counts - Always visible */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground">{quantity}</span>
              {targetType}{quantity > 1 ? 's' : ''} to generate
            </div>
            {selectedTagIds.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{selectedTagIds.length}</span>
                tag{selectedTagIds.length !== 1 ? 's' : ''}
              </div>
            )}
            {relationships.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{relationships.length}</span>
                relationship{relationships.length !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground">{(context?.parentChain?.length || 1) + selectedContextIds.length}</span>
              context entities
            </div>
          </div>

          {/* Advanced Section - Everything else */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground -mx-2">
                <span className="flex items-center gap-2">
                  Advanced options
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              {/* Quantity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Quantity</label>
                  <span className="text-xs text-muted-foreground">{quantity} {targetType}{quantity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuantity(n)}
                      className={`flex-1 py-1.5 text-sm rounded border transition-colors ${
                        quantity === n
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-card border-border text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags - Grouped by Type */}
              {context?.availableTags?.length > 0 && (
                <TooltipProvider delayDuration={200}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style Tags</label>
                    {Object.entries(
                      context.availableTags.reduce((acc: Record<string, any[]>, tag: any) => {
                        const type = tag.type || 'descriptor';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(tag);
                        return acc;
                      }, {})
                    ).map(([type, tags]) => {
                      const config = TAG_TYPE_CONFIG[type] || TAG_TYPE_CONFIG.descriptor;
                      const TypeIcon = config.icon;
                      return (
                        <div key={type} className="space-y-3 py-2">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${config.color}`} />
                            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(tags as any[]).map((tag: any) => (
                              <Tooltip key={tag.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                      selectedTagIds.includes(tag.id)
                                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                                        : 'bg-card border-border text-muted-foreground hover:border-muted-foreground'
                                    }`}
                                  >
                                    {tag.name}
                                  </button>
                                </TooltipTrigger>
                                {tag.description && (
                                  <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                                    {tag.description}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
              )}

              {/* Relationship Definitions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-400" />
                    <label className="text-sm font-medium">Define Relationships</label>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowRelationshipSearch(true)}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Define relationships to existing entities. The AI will weave these into the description.
                </p>

                {/* Relationship Search Input */}
                {showRelationshipSearch && (
                  <div className="relative" ref={relationshipSearchRef}>
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search for an entity to relate to..."
                      value={relationshipSearchTerm}
                      onChange={(e) => setRelationshipSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                      autoFocus
                    />
                    {relationshipSearchTerm && (
                      <button
                        onClick={() => {
                          setRelationshipSearchTerm('');
                          setShowRelationshipSearch(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Relationship search results */}
                    {relationshipSearchTerm.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {relationshipSearchLoading ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
                        ) : !relationshipSearchData?.searchEntities?.length ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">No results found</div>
                        ) : (
                          relationshipSearchData.searchEntities
                            .filter((e: any) =>
                              !relationships.some((r) => r.entityId === e.id) &&
                              e.id !== sourceEntity.id
                            )
                            .slice(0, 8)
                            .map((entity: any) => {
                              const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.character;
                              const EntityIcon = entityConfig.icon;
                              const name = entity.properties?.name || entity.name;
                              const entityType = entity._nodeType;
                              const defaultRelType = getRelationshipTypesForEntity(entityType)[0]?.value || 'custom';
                              return (
                                <button
                                  key={entity.id}
                                  onClick={() => {
                                    setRelationships((prev) => [
                                      ...prev,
                                      {
                                        entityId: entity.id,
                                        entityName: name,
                                        entityType,
                                        relationshipType: defaultRelType,
                                      },
                                    ]);
                                    setRelationshipSearchTerm('');
                                    setShowRelationshipSearch(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 text-left"
                                >
                                  <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                                  <span className="text-sm truncate">{name}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">{entityType}</span>
                                </button>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Defined relationships */}
                {relationships.length > 0 && (
                  <div className="space-y-2">
                    {relationships.map((rel, idx) => (
                      <RelationshipCard
                        key={`${rel.entityId}-${idx}`}
                        relationship={rel}
                        onUpdate={(updated) => {
                          setRelationships((prev) =>
                            prev.map((r, i) => (i === idx ? updated : r))
                          );
                        }}
                        onRemove={() => {
                          setRelationships((prev) => prev.filter((_, i) => i !== idx));
                        }}
                      />
                    ))}
                  </div>
                )}

                {relationships.length === 0 && !showRelationshipSearch && (
                  <div className="text-xs text-muted-foreground italic py-2">
                    No relationships defined. Click "Add" to define relationships to existing entities.
                  </div>
                )}
              </div>

              {/* Context Selection */}
              <div className="space-y-4">
                {/* Auto-included context */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Context entities (included automatically)
                  </p>
                  <div className="space-y-1.5">
                    {context?.parentChain?.map((entity: any) => {
                      const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.universe;
                      const EntityIcon = entityConfig.icon;
                      return (
                        <div
                          key={entity.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30"
                        >
                          <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                          <span className="text-sm truncate">{entity.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">auto</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add more context with search */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Add more context
                  </p>

                  {/* Search input */}
                  <div className="relative" ref={searchRef}>
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search entities..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      className="pl-8 h-8 text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setShowSearchResults(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Search results dropdown */}
                    {showSearchResults && searchTerm.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                        {searchLoading ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
                        ) : !searchData?.searchEntities?.length ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">No results found</div>
                        ) : (
                          searchData.searchEntities
                            .filter((e: any) => !selectedContextIds.includes(e.id) && e.id !== sourceEntity.id)
                            .slice(0, 8)
                            .map((entity: any) => {
                              const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.character;
                              const EntityIcon = entityConfig.icon;
                              const name = entity.properties?.name || entity.name;
                              return (
                                <button
                                  key={entity.id}
                                  onClick={() => {
                                    setSelectedContextIds(prev => [...prev, entity.id]);
                                    setSelectedEntities(prev => [...prev, {
                                      id: entity.id,
                                      name,
                                      description: entity.properties?.description || '',
                                      _nodeType: entity._nodeType
                                    }]);
                                    setSearchTerm('');
                                    setShowSearchResults(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 text-left"
                                >
                                  <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                                  <span className="text-sm truncate">{name}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">{entity._nodeType}</span>
                                </button>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected entities from search */}
                  {selectedEntities.length > 0 && (
                    <div className="space-y-1.5">
                      {selectedEntities.map((entity: any) => {
                        const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.character;
                        const EntityIcon = entityConfig.icon;
                        return (
                          <div
                            key={entity.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/50"
                          >
                            <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                            <span className="text-sm truncate flex-1">{entity.name}</span>
                            <button
                              onClick={() => {
                                setSelectedContextIds(prev => prev.filter(id => id !== entity.id));
                                setSelectedEntities(prev => prev.filter(e => e.id !== entity.id));
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested siblings */}
                  {availableContextEntities.length > 0 && (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                      <p className="text-xs text-muted-foreground">Suggestions:</p>
                      {availableContextEntities.slice(0, 5).map((entity: any) => {
                        const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.character;
                        const EntityIcon = entityConfig.icon;
                        const isSelected = selectedContextIds.includes(entity.id);
                        if (isSelected) return null;
                        return (
                          <button
                            key={entity.id}
                            onClick={() => {
                              setSelectedContextIds(prev => [...prev, entity.id]);
                              setSelectedEntities(prev => [...prev, entity]);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-transparent hover:bg-muted/30 text-left"
                          >
                            <Plus className="h-3 w-3 text-muted-foreground" />
                            <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                            <span className="text-sm truncate">{entity.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-card/50">
          <div className="w-full flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewContext}
              disabled={contextLoading}
              title="Preview context that will be sent to AI"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!hasEnoughCredits || contextLoading || generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
            >
              {contextLoading || generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {generating ? 'Generating...' : 'Generate'}
              <span className="ml-1.5 flex items-center gap-1 text-white/80">
                <Coins className="h-3.5 w-3.5" />
                {cost}
              </span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>

      {/* Context Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Context Preview
              {preview && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({preview.entityCount} entities)
                </span>
              )}
            </DialogTitle>
            {/* Selection summary */}
            {(selectedTagIds.length > 0 || selectedContextIds.length > 0) && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedTagIds.length} tags, {selectedContextIds.length} context entities
              </p>
            )}
          </DialogHeader>

          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : preview ? (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              {/* Provider summaries */}
              {preview.providerSummaries.length > 0 && (
                <div className="flex flex-wrap gap-2 shrink-0">
                  {preview.providerSummaries.map((p: any) => (
                    <div
                      key={p.provider}
                      className="text-xs bg-muted px-2 py-1 rounded"
                      title={p.summary}
                    >
                      <span className="font-medium">{p.provider}</span>
                      <span className="text-muted-foreground ml-1">({p.count})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Markdown content - scrollable */}
              <div className="flex-1 min-h-0 border rounded-md bg-zinc-950 overflow-auto">
                <pre className="p-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono">
                  {preview.markdown || 'No context assembled.'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No preview available.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
