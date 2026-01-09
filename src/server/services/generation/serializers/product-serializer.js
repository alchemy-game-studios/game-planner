/**
 * Product Serializer
 *
 * Serializes Product entities with attributes, mechanics, and adaptations.
 */

import { BaseSerializer } from './base-serializer.js';

export class ProductSerializer extends BaseSerializer {
  get supportedTypes() {
    return ['product'];
  }

  toMarkdown(entity, depth = 0, options = {}) {
    const lines = [];

    // Product heading
    lines.push(this.heading(`${entity.name}`, 3 + depth));

    // Type and game type
    if (entity.type) {
      lines.push(this.kvPair('Type', this.formatType(entity.type)));
    }
    if (entity.gameType) {
      lines.push(this.kvPair('Game Type', this.formatType(entity.gameType)));
    }

    // Description
    if (entity.description) {
      lines.push('');
      const desc = options.maxDescriptionLength
        ? this.truncate(entity.description, options.maxDescriptionLength)
        : entity.description;
      lines.push(desc);
    }

    // Attributes
    if (entity._attributes?.length > 0) {
      lines.push('');
      lines.push('**Attributes:**');
      const attrs = entity._attributes.map(attr => {
        let attrStr = `${attr.name} (${attr.valueType})`;
        if (attr.min !== undefined || attr.max !== undefined) {
          attrStr += ` [${attr.min || 0}-${attr.max || '∞'}]`;
        }
        if (attr.description) {
          attrStr += `: ${this.truncate(attr.description, 80)}`;
        }
        return attrStr;
      });
      lines.push(this.bulletList(attrs));
    }

    // Mechanics
    if (entity._mechanics?.length > 0) {
      lines.push('');
      lines.push('**Mechanics:**');
      const mechs = entity._mechanics.map(mech => {
        let mechStr = mech.name;
        if (mech.category) {
          mechStr += ` [${mech.category}]`;
        }
        if (mech.description) {
          mechStr += `: ${this.truncate(mech.description, 80)}`;
        }
        return mechStr;
      });
      lines.push(this.bulletList(mechs));
    }

    // Existing adaptations count
    if (entity._adaptations?.length > 0) {
      lines.push('');
      lines.push(this.kvPair('Existing Adaptations', entity._adaptations.length));

      // Show a few examples
      const examples = entity._adaptations
        .slice(0, 3)
        .map(a => a.displayName || a._sourceName);
      if (examples.length > 0) {
        lines.push('Examples: ' + examples.join(', '));
      }
    }

    return lines.join('\n');
  }

  toStructured(entity, options = {}) {
    return {
      id: entity.id,
      name: entity.name,
      nodeType: 'product',
      type: entity.type,
      gameType: entity.gameType,
      description: entity.description,
      attributes: entity._attributes?.map(attr => ({
        id: attr.id,
        name: attr.name,
        description: attr.description,
        valueType: attr.valueType,
        defaultValue: attr.defaultValue,
        min: attr.min,
        max: attr.max,
        options: attr.options
      })) || [],
      mechanics: entity._mechanics?.map(mech => ({
        id: mech.id,
        name: mech.name,
        description: mech.description,
        category: mech.category,
        hasValue: mech.hasValue,
        valueType: mech.valueType
      })) || [],
      adaptations: entity._adaptations?.map(a => ({
        id: a.id,
        displayName: a.displayName,
        sourceEntityId: a._sourceEntityId,
        sourceName: a._sourceName,
        sourceType: a.sourceType
      })) || []
    };
  }

  /**
   * Serialize an entity adaptation
   * @param {Object} adaptation
   * @param {Object} options
   * @returns {string}
   */
  serializeAdaptation(adaptation, options = {}) {
    const lines = [];

    lines.push(`**${adaptation.displayName || adaptation._sourceName}**`);

    if (adaptation.sourceType) {
      lines.push(`Source: ${this.formatType(adaptation.sourceType)}`);
    }

    if (adaptation.flavorText) {
      lines.push(`*${adaptation.flavorText}*`);
    }

    if (adaptation.role) {
      lines.push(`Role: ${this.formatType(adaptation.role)}`);
    }

    // Attribute values
    if (adaptation.attributeValues) {
      try {
        const attrs = JSON.parse(adaptation.attributeValues);
        const attrStrs = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`);
        if (attrStrs.length > 0) {
          lines.push('Attributes: ' + attrStrs.join(', '));
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    // Mechanic values
    if (adaptation.mechanicValues) {
      try {
        const mechs = JSON.parse(adaptation.mechanicValues);
        const mechStrs = Object.entries(mechs)
          .filter(([, v]) => v)
          .map(([k, v]) => typeof v === 'boolean' ? k : `${k}: ${v}`);
        if (mechStrs.length > 0) {
          lines.push('Mechanics: ' + mechStrs.join(', '));
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    return lines.join('\n');
  }
}
