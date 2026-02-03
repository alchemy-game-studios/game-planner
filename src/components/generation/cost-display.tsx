import { Coins, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface CostBreakdownItem {
  label: string;
  credits: number;
  isBase?: boolean;
  isModifier?: boolean;
  phase?: string;
}

interface CostDisplayProps {
  credits: number;
  userCredits?: number;
  breakdown?: CostBreakdownItem[];
  summary?: string;
  compact?: boolean;
  showBreakdown?: boolean;
  className?: string;
}

/**
 * Displays generation cost with optional breakdown.
 * Shows warning if user has insufficient credits.
 */
export function CostDisplay({
  credits,
  userCredits,
  breakdown,
  summary,
  compact = false,
  showBreakdown = true,
  className,
}: CostDisplayProps) {
  const hasEnoughCredits = userCredits === undefined || userCredits >= credits;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm',
                hasEnoughCredits ? 'text-ck-stone' : 'text-amber-400',
                className
              )}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>{credits}</span>
              {!hasEnoughCredits && (
                <AlertTriangle className="h-3 w-3 ml-0.5" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p>{summary || `${credits} credit${credits !== 1 ? 's' : ''}`}</p>
              {userCredits !== undefined && (
                <p className={cn('mt-1', !hasEnoughCredits && 'text-amber-400')}>
                  You have {userCredits} credits
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Main cost display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-ck-stone">Estimated Cost</span>
        <div
          className={cn(
            'flex items-center gap-1.5',
            hasEnoughCredits ? 'text-ck-bone' : 'text-amber-400'
          )}
        >
          <Coins className="h-4 w-4" />
          <span className="font-medium">{credits}</span>
          <span className="text-ck-stone text-sm">
            credit{credits !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* User credits */}
      {userCredits !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ck-stone">Your Balance</span>
          <span className={cn(!hasEnoughCredits && 'text-amber-400')}>
            {userCredits} credits
          </span>
        </div>
      )}

      {/* Insufficient credits warning */}
      {!hasEnoughCredits && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300">
            Need {credits - (userCredits || 0)} more credits
          </span>
        </div>
      )}

      {/* Breakdown (collapsible) */}
      {showBreakdown && breakdown && breakdown.length > 0 && (
        <CostBreakdown items={breakdown} />
      )}
    </div>
  );
}

interface CostBreakdownProps {
  items: CostBreakdownItem[];
}

function CostBreakdown({ items }: CostBreakdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-ck-stone hover:text-ck-bone transition-colors">
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            open && 'transform rotate-180'
          )}
        />
        <span>View breakdown</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-1 pl-4 border-l border-ck-stone/20">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-ck-stone">{item.label}</span>
              <span
                className={cn(
                  item.credits >= 0 ? 'text-ck-bone' : 'text-green-400'
                )}
              >
                {item.credits >= 0 ? '+' : ''}
                {item.credits}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Subgraph cost display with outline/detail phases.
 */
interface SubgraphCostDisplayProps {
  outlineCost: number;
  detailCost: number;
  totalCost: number;
  userCredits?: number;
  breakdown?: CostBreakdownItem[];
  className?: string;
}

export function SubgraphCostDisplay({
  outlineCost,
  detailCost,
  totalCost,
  userCredits,
  breakdown,
  className,
}: SubgraphCostDisplayProps) {
  const hasEnoughCredits = userCredits === undefined || userCredits >= totalCost;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Phase costs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ck-stone">Outline preview</span>
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3 text-ck-stone" />
            <span>{outlineCost}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ck-stone">Detail generation</span>
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3 text-ck-stone" />
            <span>{detailCost}</span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-2 border-t border-ck-stone/20">
        <span className="text-sm font-medium">Total</span>
        <div
          className={cn(
            'flex items-center gap-1.5',
            hasEnoughCredits ? 'text-ck-bone' : 'text-amber-400'
          )}
        >
          <Coins className="h-4 w-4" />
          <span className="font-medium">{totalCost}</span>
        </div>
      </div>

      {/* User credits and warning */}
      {userCredits !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ck-stone">Your Balance</span>
          <span className={cn(!hasEnoughCredits && 'text-amber-400')}>
            {userCredits} credits
          </span>
        </div>
      )}

      {!hasEnoughCredits && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300">
            Need {totalCost - (userCredits || 0)} more credits
          </span>
        </div>
      )}

      {/* Detailed breakdown */}
      {breakdown && breakdown.length > 0 && <CostBreakdown items={breakdown} />}
    </div>
  );
}
