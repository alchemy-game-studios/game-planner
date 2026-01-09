import { Button } from '@/components/ui/button';
import { Sparkles, Coins, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  onClick: () => void;
  cost?: number;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

/**
 * Styled AI generation button with credit cost display.
 * Uses a purple/pink gradient style to indicate AI functionality.
 */
export function GenerateButton({
  onClick,
  cost,
  disabled = false,
  loading = false,
  label = 'Generate',
  size = 'default',
  variant = 'default',
  className,
}: GenerateButtonProps) {
  const isDisabled = disabled || loading;

  // Gradient button styling matching existing pattern
  const gradientStyles = cn(
    'relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-0',
    // Gradient border effect
    'before:absolute before:inset-0 before:rounded-md before:p-[1px]',
    'before:bg-gradient-to-r before:from-purple-500 before:to-pink-500',
    'before:-z-10 before:content-[\'\']',
    // Dark background inside
    'after:absolute after:inset-[1px] after:rounded-[5px]',
    'after:bg-zinc-900 after:-z-10 after:content-[\'\']',
    // Text and hover
    'text-purple-300 hover:text-purple-200',
    'hover:from-purple-500/20 hover:to-pink-500/20',
    // Disabled state
    isDisabled && 'opacity-50 cursor-not-allowed hover:text-purple-300',
    className
  );

  if (variant === 'icon-only') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        disabled={isDisabled}
        className={gradientStyles}
        title={`${label}${cost ? ` (${cost} credits)` : ''}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={isDisabled}
      className={gradientStyles}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-1" />
      )}

      {variant !== 'compact' && <span>{label}</span>}

      {cost !== undefined && cost > 0 && (
        <span className="ml-1 flex items-center gap-0.5 text-[10px] opacity-60">
          <Coins className="h-2.5 w-2.5" />
          {cost}
        </span>
      )}
    </Button>
  );
}

/**
 * Inline generation button for use in lists and compact spaces.
 * Shows just the icon with cost on hover.
 */
export function GenerateButtonInline({
  onClick,
  cost,
  disabled = false,
  loading = false,
  className,
}: Omit<GenerateButtonProps, 'label' | 'size' | 'variant'>) {
  return (
    <GenerateButton
      onClick={onClick}
      cost={cost}
      disabled={disabled}
      loading={loading}
      variant="compact"
      size="sm"
      className={className}
    />
  );
}
