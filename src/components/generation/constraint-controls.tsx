import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TagInfo {
  id: string;
  name: string;
  description?: string;
  entityCount?: number;
}

interface ToneSettings {
  formality: number;
  mood: number;
}

interface ConstraintControlsProps {
  // Tag selection
  availableTags: TagInfo[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;

  // Tone settings
  tone: ToneSettings;
  onToneChange: (tone: ToneSettings) => void;

  // Creativity
  creativity: number;
  onCreativityChange: (value: number) => void;

  // Additional prompt
  additionalPrompt: string;
  onPromptChange: (prompt: string) => void;

  // Display options
  compact?: boolean;
  className?: string;
}

/**
 * Generation constraint controls panel.
 * Includes tag selection, tone sliders, creativity slider, and additional prompt.
 */
export function ConstraintControls({
  availableTags,
  selectedTagIds,
  onTagsChange,
  tone,
  onToneChange,
  creativity,
  onCreativityChange,
  additionalPrompt,
  onPromptChange,
  compact = false,
  className,
}: ConstraintControlsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Tag Selection */}
      <TagSelector
        tags={availableTags}
        selected={selectedTagIds}
        onChange={onTagsChange}
        compact={compact}
      />

      <Separator />

      {/* Tone Sliders */}
      <ToneSliders tone={tone} onChange={onToneChange} compact={compact} />

      <Separator />

      {/* Creativity Slider */}
      <CreativitySlider
        value={creativity}
        onChange={onCreativityChange}
        compact={compact}
      />

      <Separator />

      {/* Additional Prompt */}
      <PromptInput
        value={additionalPrompt}
        onChange={onPromptChange}
        compact={compact}
      />
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface TagSelectorProps {
  tags: TagInfo[];
  selected: string[];
  onChange: (ids: string[]) => void;
  compact?: boolean;
}

export function TagSelector({
  tags,
  selected,
  onChange,
  compact,
}: TagSelectorProps) {
  const toggleTag = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm">
        Style Tags
        {selected.length > 0 && (
          <span className="ml-2 text-ck-stone">({selected.length} selected)</span>
        )}
      </Label>
      <p className="text-xs text-ck-stone">
        Select tags to influence the generation style and themes
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {tags.length === 0 ? (
          <span className="text-xs text-ck-stone italic">
            No tags available in this universe
          </span>
        ) : (
          tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selected.includes(tag.id) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                selected.includes(tag.id)
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'hover:bg-zinc-800'
              )}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {tag.entityCount !== undefined && !compact && (
                <span className="ml-1 opacity-60">({tag.entityCount})</span>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

interface ToneSlidersProps {
  tone: ToneSettings;
  onChange: (tone: ToneSettings) => void;
  compact?: boolean;
}

export function ToneSliders({ tone, onChange, compact }: ToneSlidersProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm">Tone Settings</Label>

      {/* Formality slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-ck-stone">
          <span>Casual</span>
          <span>Formal</span>
        </div>
        <Slider
          value={[tone.formality]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) =>
            onChange({ ...tone, formality: value })
          }
          className="w-full"
        />
        {!compact && (
          <p className="text-xs text-ck-stone text-center">
            {tone.formality < 0.3
              ? 'Casual, conversational style'
              : tone.formality > 0.7
                ? 'Formal, literary style'
                : 'Balanced tone'}
          </p>
        )}
      </div>

      {/* Mood slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-ck-stone">
          <span>Light</span>
          <span>Dark</span>
        </div>
        <Slider
          value={[tone.mood]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={([value]) => onChange({ ...tone, mood: value })}
          className="w-full"
        />
        {!compact && (
          <p className="text-xs text-ck-stone text-center">
            {tone.mood < 0.3
              ? 'Light, optimistic mood'
              : tone.mood > 0.7
                ? 'Dark, serious mood'
                : 'Neutral mood'}
          </p>
        )}
      </div>
    </div>
  );
}

interface CreativitySliderProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

export function CreativitySlider({
  value,
  onChange,
  compact,
}: CreativitySliderProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">Creativity</Label>
      <div className="flex justify-between text-xs text-ck-stone">
        <span>Predictable</span>
        <span>Creative</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={1}
        step={0.1}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      {!compact && (
        <p className="text-xs text-ck-stone text-center">
          {value < 0.3
            ? 'More predictable, follows patterns closely'
            : value > 0.7
              ? 'More creative, may surprise you'
              : 'Balanced creativity'}
          {value > 0.8 && (
            <span className="text-amber-400 ml-1">
              (+20% cost)
            </span>
          )}
        </p>
      )}
    </div>
  );
}

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function PromptInput({ value, onChange, compact }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">Additional Direction (Optional)</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add specific instructions or requirements..."
        rows={compact ? 2 : 3}
        className="resize-none"
      />
      <p className="text-xs text-ck-stone">
        Provide extra context or specific requests for the generation
      </p>
    </div>
  );
}

// ============================================
// Preset constraints for common scenarios
// ============================================

export const CONSTRAINT_PRESETS = {
  fantasy: {
    name: 'Fantasy',
    tone: { formality: 0.6, mood: 0.4 },
    creativity: 0.6,
  },
  cyberpunk: {
    name: 'Cyberpunk',
    tone: { formality: 0.4, mood: 0.7 },
    creativity: 0.7,
  },
  horror: {
    name: 'Horror',
    tone: { formality: 0.5, mood: 0.9 },
    creativity: 0.5,
  },
  comedy: {
    name: 'Comedy',
    tone: { formality: 0.2, mood: 0.1 },
    creativity: 0.8,
  },
  historical: {
    name: 'Historical',
    tone: { formality: 0.8, mood: 0.5 },
    creativity: 0.4,
  },
} as const;
