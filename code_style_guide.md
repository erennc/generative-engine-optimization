You are an expert software architect tasked with creating comprehensive code style guidelines for generative-engine-optimization. 

# Code Style Guidelines for generative-engine-optimization

## Project Overview
1. **Metrik Analiz:** \(Imp_{wc}\) (kelime oranı) ve \(Imp'_{wc}\) (konum ağırlıklı skor) formülleriyle mevcut görünürlük ölçülür.  
2. **İçerik Optimizasyonu:** İstatistik ekleme, alıntı belirtme, otoriter dil kullanımı gibi GEO stratejileriyle içerik yeniden düzenlenir.  
3. **Test ve Seçim:** Optimize edilen ve orijinal içerik, GEO-bench üzerinde A/B testine tabi tutulur. **Subjective Impression** (öznel etki) metrikleriyle karşılaştırılan içeriklerden en yüksek skorlu olan seçilir. 

This document defines the coding standards and style guidelines for generative-engine-optimization, ensuring consistency and maintainability across the codebase.

### Technical Stack
- Platform: web
- Framework: fastapi
- Key Dependencies:


## Style Guide Sections

### 1. File Organization
Define standards for:
- Directory structure
- File naming conventions
- Module organization
- Import/export patterns
- Code grouping within files

### 2. Code Formatting
Specify:
- Indentation (spaces/tabs)
- Line length limits
- Line breaks and spacing
- Bracket placement
- Quotes (single/double)
- Semicolon usage
- Trailing commas
- Comments formatting

### 3. Naming Conventions
Detail rules for:
- Variables (camelCase, PascalCase, etc.)
- Functions and methods
- Classes and interfaces
- Constants and enums
- File names
- Component naming
- Test file naming

### 4. TypeScript/JavaScript Guidelines
Establish:
- Type annotations usage
- Interface vs Type aliases
- Generics conventions
- Null/undefined handling
- Error handling patterns
- Async/await patterns
- Default values
- Optional chaining usage

### 5. Component Guidelines
Define:
- Component composition
- Props interface definitions
- State management
- Event handling
- Lifecycle methods usage
- Custom hooks patterns
- Render optimization
- Error boundaries

### 6. Documentation Standards
Specify:
- JSDoc requirements
- README structure
- Code comments style
- API documentation
- Type documentation
- Example usage
- Changelog format

### 7. Testing Standards
Detail:
- Test file organization
- Naming conventions
- Test structure (Arrange-Act-Assert)
- Mock data handling
- Test coverage requirements
- Integration test patterns
- E2E test guidelines

### 8. Performance Guidelines
Cover:
- Bundle optimization
- Code splitting
- Lazy loading
- Memory management
- State management
- Rendering optimization
- Asset optimization

### 9. Security Guidelines
Address:
- Authentication handling
- Data validation
- API security
- Dependency management
- Environment variables
- Sensitive data handling
- Security best practices

### 10. Development Workflow
Define:
- Git workflow
- Branch naming
- Commit message format
- PR requirements
- Code review process
- CI/CD practices
- Version control guidelines

## Enforcement and Tools

### Linting and Formatting
- ESLint configuration
- Prettier setup
- TypeScript compiler options
- Git hooks
- CI checks

### IDE Configuration
- VS Code settings
- Extensions
- Snippets
- Debugging setup

## Best Practices

### 1. Code Quality
- Keep functions small and focused
- Follow DRY principles
- Maintain separation of concerns
- Use meaningful names
- Write self-documenting code
- Handle errors appropriately

### 2. Performance
- Optimize bundle size
- Implement code splitting
- Use proper caching
- Optimize rendering
- Follow lazy loading patterns

### 3. Maintainability
- Write clear documentation
- Use consistent patterns
- Implement proper error handling
- Follow SOLID principles
- Keep dependencies updated

### 4. Collaboration
- Write clear commit messages
- Document breaking changes
- Maintain changelog
- Review code thoroughly
- Share knowledge

After generating the content, save it to the CODE_STYLE.md file using the appropriate file writing command or editor.

Please generate comprehensive code style guidelines following this structure, ensuring all sections are thoroughly detailed and technically accurate. The final document should be saved as 'CODE_STYLE.md' in the project root directory.

Note: 
- Customize the guidelines based on your project's specific needs and tech stack
- Remove any sections that don't apply to your project
- Add project-specific conventions and requirements
- Include examples for complex patterns or rules