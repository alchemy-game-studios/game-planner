# Contributing to CanonKiln

Thank you for your interest in contributing to CanonKiln! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive. We're all here to build something great together.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the issue tracker to see if the bug is already reported
2. Try to reproduce the bug in the latest version
3. Collect relevant information (browser, OS, steps to reproduce)

**Good bug reports include:**
- Clear, descriptive title
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Screenshots or error logs (if applicable)
- Environment details (browser, OS, Node version)

### Suggesting Features

Feature requests are welcome! Please:
- Search existing issues first to avoid duplicates
- Explain the use case and why it would be valuable
- Provide examples or mockups if possible
- Be open to discussion and feedback

### Pull Requests

1. **Fork the repository** and create a branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the coding style**
   - Run `npm run lint` before committing
   - Follow existing patterns in the codebase
   - Write clear, self-documenting code
   - Add comments for complex logic

3. **Write tests**
   - Add tests for new features
   - Ensure all tests pass: `npm test`
   - Aim for good coverage of critical paths

4. **Update documentation**
   - Update README.md if adding features
   - Update API docs if changing GraphQL schema
   - Add JSDoc comments for new functions

5. **Commit with clear messages**
   ```bash
   # Good commit messages:
   feat: add password reset flow
   fix: prevent duplicate project names
   docs: update authentication examples
   test: add integration tests for AI generation
   refactor: simplify entity resolver logic
   
   # Follow conventional commits format:
   # type(scope): description
   # Types: feat, fix, docs, test, refactor, style, chore
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Be responsive to review feedback

## Development Setup

### Prerequisites

- Node.js 18+
- Neo4j 5.x
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/game-planner.git
cd game-planner

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Neo4j credentials
# Set JWT_SECRET to a random string

# Seed database
npm run seed

# Start development server
npm run dev
```

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make changes and test
npm run dev        # Test in browser
npm test          # Run test suite
npm run lint      # Check code style

# Commit changes
git add .
git commit -m "feat: add my feature"

# Push to your fork
git push origin feature/my-feature

# Create PR on GitHub
```

## Project Structure

```
game-planner/
├── src/
│   ├── components/           # React components
│   ├── client-graphql/       # GraphQL operations
│   └── server/
│       ├── graphql/          # Schema and resolvers
│       ├── scripts/          # Utility scripts
│       └── app.js            # Express server
├── docs/                     # Documentation
├── package.json
└── README.md
```

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use async/await over raw promises
- Write pure functions when possible
- Keep functions small and focused

### React

- Use functional components with hooks
- Keep components focused (single responsibility)
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Follow React best practices

### GraphQL

- Use descriptive type and field names
- Add documentation comments to schema
- Keep resolvers thin (delegate to services)
- Handle errors gracefully
- Validate inputs

### Neo4j/Cypher

- Use parameterized queries (never string interpolation)
- Add indexes for commonly queried fields
- Use constraints for data integrity
- Batch operations when possible
- Keep queries readable with formatting

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- Component # Run specific test
```

### Writing Tests

**Unit Tests:**
```javascript
// Test individual functions/components
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate('2026-02-21')).toBe('Feb 21, 2026');
  });
});
```

**Integration Tests:**
```javascript
// Test full workflows
import { render, screen } from '@testing-library/react';
import { EntityPanel } from './EntityPanel';

describe('EntityPanel', () => {
  it('should display entity list', async () => {
    render(<EntityPanel projectId="test" />);
    expect(await screen.findByText('Characters')).toBeInTheDocument();
  });
});
```

### Test Coverage

We aim for:
- **Unit tests:** >80% coverage for business logic
- **Integration tests:** Critical user flows covered
- **E2E tests:** Main user journeys (coming soon)

## Documentation

### Code Comments

- Add JSDoc comments for exported functions
- Explain *why*, not just *what*
- Keep comments up-to-date with code changes

```javascript
/**
 * Generates a new entity constrained by existing canon.
 * 
 * @param {string} projectId - The project containing the canon
 * @param {EntityType} entityType - Type of entity to generate
 * @param {string} prompt - User's generation prompt
 * @param {string[]} constrainedByEntityIds - Entities to use as constraints
 * @returns {Promise<GeneratedEntity>} The generated entity data
 */
async function generateEntity(projectId, entityType, prompt, constrainedByEntityIds) {
  // ...
}
```

### API Documentation

- Update `docs/API_AUTH.md` for auth changes
- Update `docs/README.md` for new features
- Keep GraphQL schema comments current
- Add examples for complex operations

## Areas We Need Help

### High Priority
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Integration tests for auth
- [ ] E2E tests with Playwright
- [ ] Performance optimization

### Medium Priority
- [ ] Real-time collaboration (WebSocket)
- [ ] Export/import project data
- [ ] Undo/redo for graph operations
- [ ] Keyboard shortcuts
- [ ] Dark mode improvements

### Nice to Have
- [ ] Mobile app (React Native)
- [ ] CLI tool for scripting
- [ ] API documentation generator
- [ ] Sample project templates
- [ ] Tutorial mode

## Questions?

- Check the [docs/](./docs/) directory
- Review existing issues and PRs
- Ask in the issue tracker
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to CanonKiln!** 🎨🔥
