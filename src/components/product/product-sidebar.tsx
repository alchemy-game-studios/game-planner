import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Settings, Sparkles, Coins, LayoutGrid, Cog, Puzzle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProductSidebarProps {
  product: any;
  onRefetch: () => void;
}

// Credit costs for generating product entities
const GENERATION_CREDITS: Record<string, number> = {
  attribute: 5,
  mechanic: 10,
  section: 15,
  adaptation: 30,
};

interface CollapsibleSectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  generateLabel?: string;
  generateCredits?: number;
  onGenerate?: () => void;
  onAdd?: () => void;
}

function CollapsibleSection({
  title,
  count,
  icon,
  color,
  children,
  generateLabel,
  generateCredits,
  onGenerate,
  onAdd
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="py-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${color}`}>
            {icon}
          </div>
          <span className="text-base font-medium text-ck-bone">{title}</span>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            {generateLabel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerate}
                className="flex-1 relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-0 before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-gradient-to-r before:from-purple-500 before:to-pink-500 before:-z-10 before:content-[''] after:absolute after:inset-[1px] after:rounded-[5px] after:bg-zinc-900 after:-z-10 after:content-[''] text-purple-300 hover:text-purple-200 hover:from-purple-500/20 hover:to-pink-500/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {generateLabel}
                <span className="ml-1 flex items-center gap-0.5 text-[10px] opacity-60">
                  <Coins className="h-2.5 w-2.5" />
                  {generateCredits}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          {/* Content */}
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductSidebar({ product, onRefetch }: ProductSidebarProps) {
  const isGame = product.type === 'game';
  const isPassiveMedia = ['book', 'movie', 'comic', 'tv series'].includes(product.type);

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-5 w-5 text-ck-forge" />
        <h3 className="text-base font-semibold text-ck-bone">Product Setup</h3>
      </div>
      <Separator className="mb-2" />

      {/* Config Section - Always visible */}
      <div className="py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded bg-ck-forge/20">
            <Cog className="h-4 w-4 text-ck-forge" />
          </div>
          <span className="text-base font-medium text-ck-bone">Configuration</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline">{product.type}</Badge>
          </div>
          {product.gameType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Game Type</span>
              <Badge variant="outline">{product.gameType}</Badge>
            </div>
          )}
          {product.universe && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Universe</span>
              <Link
                to={`/edit/universe/${product.universe.id}`}
                className="text-secondary hover:text-ck-gold text-sm"
              >
                {product.universe.name}
              </Link>
            </div>
          )}
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Attributes Section - Games only */}
      {isGame && (
        <>
          <CollapsibleSection
            title="Attributes"
            count={product.attributes?.length || 0}
            icon={<LayoutGrid className="h-4 w-4 text-ck-teal" />}
            color="bg-ck-teal/20"
            generateLabel="Generate"
            generateCredits={GENERATION_CREDITS.attribute}
            onGenerate={() => {/* TODO */}}
            onAdd={() => {/* TODO */}}
          >
            {product.attributes?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {product.attributes.map((attr: any) => (
                  <div
                    key={attr.id}
                    className="p-2 rounded bg-card/50 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ck-bone">{attr.name}</span>
                      <Badge variant="secondary" className="text-xs">{attr.valueType}</Badge>
                    </div>
                    {attr.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {attr.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attributes defined
              </p>
            )}
          </CollapsibleSection>
          <Separator className="opacity-50" />
        </>
      )}

      {/* Mechanics Section - Games only */}
      {isGame && (
        <>
          <CollapsibleSection
            title="Mechanics"
            count={product.mechanics?.length || 0}
            icon={<Cog className="h-4 w-4 text-ck-rare" />}
            color="bg-ck-rare/20"
            generateLabel="Generate"
            generateCredits={GENERATION_CREDITS.mechanic}
            onGenerate={() => {/* TODO */}}
            onAdd={() => {/* TODO */}}
          >
            {product.mechanics?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {product.mechanics.map((mech: any) => (
                  <div
                    key={mech.id}
                    className="p-2 rounded bg-card/50 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ck-bone">{mech.name}</span>
                      {mech.category && (
                        <Badge variant="secondary" className="text-xs">{mech.category}</Badge>
                      )}
                    </div>
                    {mech.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {mech.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No mechanics defined
              </p>
            )}
          </CollapsibleSection>
          <Separator className="opacity-50" />
        </>
      )}

      {/* Components Section - All products */}
      <CollapsibleSection
        title="Components"
        count={product.adaptations?.length || 0}
        icon={<Puzzle className="h-4 w-4 text-ck-gold" />}
        color="bg-ck-gold/20"
        generateLabel="Generate"
        generateCredits={GENERATION_CREDITS.adaptation}
        onGenerate={() => {/* TODO */}}
        onAdd={() => {/* TODO */}}
      >
        {product.adaptations?.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {product.adaptations.map((adapt: any) => (
              <div
                key={adapt.id}
                className="p-2 rounded bg-card/50 border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ck-bone">
                    {adapt.displayName || adapt.sourceEntity?.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">{adapt.sourceType}</Badge>
                </div>
                {adapt.flavorText && (
                  <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                    "{adapt.flavorText}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No components yet
          </p>
        )}
      </CollapsibleSection>

      {/* Sections - Passive media only */}
      {isPassiveMedia && (
        <>
          <Separator className="opacity-50" />
          <CollapsibleSection
            title="Sections"
            count={product.sections?.length || 0}
            icon={<BookOpen className="h-4 w-4 text-ck-ember" />}
            color="bg-ck-ember/20"
            generateLabel="Generate"
            generateCredits={GENERATION_CREDITS.section}
            onGenerate={() => {/* TODO */}}
            onAdd={() => {/* TODO */}}
          >
            {product.sections?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...product.sections]
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any) => (
                    <div
                      key={section.id}
                      className="p-2 rounded bg-card/50 border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-ck-ember">{section.order}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-ck-bone block truncate">
                            {section.name}
                          </span>
                          {section.sectionType && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {section.sectionType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sections defined
              </p>
            )}
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
