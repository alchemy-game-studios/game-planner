/**
 * LangChain Integration
 *
 * Exports for LangChain-compatible components.
 */

// Document converters
export {
  toDocuments,
  entityToDocument,
  toCombinedDocument,
  toDocumentsByType,
  toDocumentsByRole
} from './documents.js';

// Retrievers
export {
  WorldbuildingRetriever,
  EntityContextRetriever,
  ProductContextRetriever,
  createWorldbuildingRetriever,
  createEntityRetriever
} from './retrievers.js';

// Tools
export {
  QueryWorldTool,
  GetEntityContextTool,
  GetUniverseOverviewTool,
  GetRelatedEntitiesTool,
  createWorldbuildingTools
} from './tools.js';

// Prompts
export {
  WORLDBUILDING_SYSTEM_PROMPT,
  entityGenerationPrompt,
  productAdaptationPrompt,
  descriptionExpansionPrompt,
  relationshipSuggestionPrompt,
  tagBasedGenerationPrompt,
  createGenerationPrompt,
  createAdaptationPrompt,
  formatTagsForPrompt,
  formatEntitiesForPrompt
} from './prompts.js';

// Entity Generator
export {
  EntityGenerator,
  getEntityGenerator
} from './entity-generator.js';
