import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TagFormData {
  name: string;
  description: string;
  type: string;
}

interface TagFormProps {
  initialData?: TagFormData;
  onChange: (data: TagFormData) => void;
  disabled?: boolean;
}

const TAG_TYPES = [
  { value: 'descriptor', label: 'Descriptor', description: 'Physical or visual attributes' },
  { value: 'feeling', label: 'Feeling', description: 'Emotional or mood-related' },
  { value: 'theme', label: 'Theme', description: 'Thematic elements or motifs' },
  { value: 'mechanic', label: 'Mechanic', description: 'Game mechanics or rules' },
  { value: 'other', label: 'Other', description: 'General purpose tags' },
];

export function TagForm({ initialData, onChange, disabled = false }: TagFormProps) {
  const [formData, setFormData] = useState<TagFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'other',
  });

  // Sync with initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        type: initialData.type || 'other',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof TagFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name" className="text-ck-stone">
          Name
        </Label>
        <Input
          id="tag-name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter tag name"
          disabled={disabled}
          className="bg-ck-charcoal border-ck-indigo text-ck-bone"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag-type" className="text-ck-stone">
          Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange('type', value)}
          disabled={disabled}
        >
          <SelectTrigger className="bg-ck-charcoal border-ck-indigo text-ck-bone">
            <SelectValue placeholder="Select tag type" />
          </SelectTrigger>
          <SelectContent className="bg-ck-charcoal border-ck-indigo">
            {TAG_TYPES.map((type) => (
              <SelectItem
                key={type.value}
                value={type.value}
                className="text-ck-bone hover:bg-ck-indigo focus:bg-ck-indigo"
              >
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-ck-stone">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag-description" className="text-ck-stone">
          Description
        </Label>
        <Textarea
          id="tag-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what this tag represents..."
          disabled={disabled}
          className="bg-ck-charcoal border-ck-indigo text-ck-bone min-h-[80px]"
        />
      </div>
    </div>
  );
}
