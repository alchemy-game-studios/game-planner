/**
 * Generation Services
 *
 * Public API for the context synthesis and generation system.
 */

// Main assembler
export { ContextAssembler, createContextAssembler } from './context-assembler.js';

// Configuration
export {
  RELEVANCE_MATRIX,
  PROVIDER_LIMITS,
  PROVIDER_PRIORITIES,
  RELATIONSHIP_PRIORITIES,
  DEFAULT_CONFIG,
  requiresProductContext,
  getRelevanceScore,
  getProviderLimit
} from './context-config.js';

// Serializers
export {
  SerializerRegistry,
  createSerializerRegistry,
  BaseSerializer,
  UniverseSerializer,
  PlaceSerializer,
  CharacterSerializer,
  ItemSerializer,
  EventSerializer,
  NarrativeSerializer,
  TagSerializer,
  ProductSerializer
} from './serializers/index.js';

// Resolvers
export {
  ResolverRegistry,
  createResolverRegistry,
  BaseResolver,
  HierarchyResolver,
  TagResolver,
  InvolvementResolver,
  SiblingResolver,
  RelevanceResolver
} from './resolvers/index.js';

// Providers
export {
  ProviderRegistry,
  createProviderRegistry,
  BaseProvider,
  SourceProvider,
  HierarchyProvider,
  SiblingProvider,
  TagProvider,
  InvolvementProvider,
  ProductProvider,
  CustomProvider
} from './providers/index.js';

// LangChain integration (lazy loaded - requires @langchain/core to be installed)
// Use: const langchain = await import('./langchain/index.js')
// export * from './langchain/index.js';
