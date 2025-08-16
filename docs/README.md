# Documentation Registry for Petk

This file is the living source of truth for the documentation architecture of the Petk monorepo. It follows a dynamic, purpose-driven structure based on the Diátaxis framework. All documentation categories and their organization are defined here and must evolve as the project grows.

## Current Documentation Architecture

```
/docs
  /README.md         # This registry and architecture guide
  /learning/         # Guides and tutorials for newcomers
  /problems/         # Solutions to common or specific problems
  /reference/        # Technical reference and API documentation
  /explanation/      # Architectural decisions, concepts, and rationale
```

### Category Definitions

- **learning/**  
  *Purpose:* Step-by-step guides and tutorials for onboarding and learning core workflows.  
  *Examples:* "Getting Started", "First CLI Usage", "How to Add a Utility Function".

- **problems/**  
  *Purpose:* Problem-solving guides for specific user goals or issues.  
  *Examples:* "How to fix TypeScript errors", "Troubleshooting CLI installation".

- **reference/**  
  *Purpose:* Information-oriented technical reference for APIs, configuration, and commands.  
  *Examples:* "CLI Command Reference", "Configuration Options", "Utility Function Index".

- **explanation/**  
  *Purpose:* Understanding-oriented documentation for concepts, architecture, and decisions.  
  *Examples:* "Why Functional Programming?", "Monorepo Structure Rationale".

### Evolution Guidelines

- Always update this file before adding or reorganizing documentation.
- Create a new subcategory if a new user goal or documentation type emerges.
- Reorganize categories if the current structure no longer fits project needs.
- Document all changes and rationale in this file and in the root CHANGELOG.md.

### Navigation Patterns

- Newcomers should start in `/docs/learning/`.
- Users troubleshooting should look in `/docs/problems/`.
- Developers needing technical details should use `/docs/reference/`.
- Contributors or advanced users seeking architectural context should use `/docs/explanation/`.

---