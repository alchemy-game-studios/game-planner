import { useState, useEffect } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

const GET_USER_CREDITS = gql`
  query GetUserCredits {
    me {
      credits
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const targetType = defaultTargetType;
  const targetLabel = targetType.charAt(0).toUpperCase() + targetType.slice(1);
  const targetConfig = ENTITY_CONFIG[targetType] || ENTITY_CONFIG.character;
  const TargetIcon = targetConfig.icon;

  // Fetch context data
  const [fetchContext, { data: contextData, loading: contextLoading }] =
    useLazyQuery(GET_GENERATION_CONTEXT);

  // Fetch cost estimate
  const [fetchCost, { data: costData }] = useLazyQuery(ESTIMATE_COST);

  // Fetch user credits
  const { data: userData } = useQuery(GET_USER_CREDITS, { skip: !open });

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
      setQuantity(1);
      setShowAdvanced(false);
    }
  }, [open]);

  const context = contextData?.generationContext;
  const cost = costData?.estimateGenerationCost?.credits ?? 0;
  const userCredits = userData?.me?.credits ?? 0;
  const hasEnoughCredits = userCredits >= cost;

  const handleGenerate = () => {
    console.log('Generation request:', {
      sourceEntityId: sourceEntity.id,
      targetType,
      quantity,
      prompt,
      tagIds: selectedTagIds,
      contextEntityIds: selectedContextIds,
    });
    onOpenChange(false);
  };

  const toggleContext = (entityId: string) => {
    setSelectedContextIds((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  // Combine all available context entities
  const availableContextEntities = [
    ...(context?.siblingEntities || []),
    ...(context?.childEntities || []),
    ...(context?.suggestedContext || []),
  ].filter((entity, index, self) =>
    self.findIndex(e => e.id === entity.id) === index
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
          {/* Prompt */}
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

          {/* Quantity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Quantity</label>
              <span className="text-xs text-muted-foreground">{quantity} {targetType}{quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex gap-2">
              {[1, 3, 5].map((n) => (
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

          {/* Advanced Section - Context Selection */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground -mx-2">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Context entities
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                    {(context?.parentChain?.length || 1) + selectedContextIds.length}
                  </span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              {/* Auto-included context */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Included automatically
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

              {/* Optional additional context */}
              {availableContextEntities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Add more context
                  </p>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                    {availableContextEntities.map((entity: any) => {
                      const entityConfig = ENTITY_CONFIG[entity._nodeType] || ENTITY_CONFIG.character;
                      const EntityIcon = entityConfig.icon;
                      const isSelected = selectedContextIds.includes(entity.id);
                      return (
                        <label
                          key={entity.id}
                          className={`flex items-start gap-3 px-2 py-1.5 rounded-md border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-500/10 border-purple-500/50'
                              : 'border-transparent hover:bg-muted/30'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleContext(entity.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <EntityIcon className={`h-3.5 w-3.5 ${entityConfig.color}`} />
                              <span className="text-sm truncate">{entity.name}</span>
                            </div>
                            {entity.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {entity.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Context summary */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  AI will use {(context?.parentChain?.length || 1) + selectedContextIds.length} entities for context when generating.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-card/50">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              <span>{cost} credits</span>
              {!hasEnoughCredits && (
                <span className="text-amber-500 ml-2">(need {cost - userCredits} more)</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!hasEnoughCredits || contextLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                {contextLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
