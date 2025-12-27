# Contributing to AI Insight Engine

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git
- Docker (optional, for local development)

### Setup Development Environment

1. Fork and clone the repository
```bash
git clone https://github.com/your-username/ai-insight-engine.git
cd ai-insight-engine
```

2. Install dependencies
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

3. Setup environment variables
```bash
# Copy example env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Start development servers
```bash
# Frontend (terminal 1)
cd frontend && npm run dev

# Backend (terminal 2)
cd backend && npm run dev
```

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add new dashboard widget`
- `fix: resolve memory leak in consumer`
- `docs: update API documentation`
- `refactor: simplify event processing logic`
- `test: add unit tests for alert service`

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Update documentation
6. Create a pull request

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] TypeScript types are correct
- [ ] No linter errors

## Code Style

### TypeScript/JavaScript
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over promises
- Use meaningful variable names
- Add JSDoc comments for public APIs

### React/Next.js
- Use functional components
- Prefer hooks over class components
- Use TypeScript for props
- Keep components small and focused
- Use proper error boundaries

### Backend
- Follow RESTful API conventions
- Use proper error handling
- Add logging for important operations
- Validate all inputs
- Use TypeScript types

## Testing

### Running Tests
```bash
# Frontend
cd frontend
npm run test          # Unit tests
npm run test:component # Component tests
npm run test:e2e      # E2E tests

# Backend
cd backend
npm run test          # Unit tests
npm run test:integration # Integration tests
```

### Writing Tests
- Write tests before or alongside code
- Aim for >80% code coverage
- Test edge cases and error scenarios
- Use descriptive test names
- Keep tests independent and isolated

## Documentation

### Code Documentation
- Add JSDoc comments for public functions
- Document complex algorithms
- Include usage examples
- Update README when adding features

### API Documentation
- Update OpenAPI spec for API changes
- Include request/response examples
- Document error codes and messages

## Review Process

1. Automated checks must pass (CI)
2. At least one approval required
3. Address review comments
4. Maintainer will merge when ready

## Questions?

- Open an issue for bugs or questions
- Check existing documentation
- Ask in team chat or discussions

Thank you for contributing! 🎉

