---
sidebar_position: 1
---

# Real-World Use Cases

This guide demonstrates practical applications of Petk in prompt engineering workflows. Each use case includes problem context, implementation approach, and working examples you can adapt to your needs.

## 1. AI Chatbot Development

### Problem
You need to create consistent, maintainable prompts for multiple AI chatbots across different domains while ensuring brand consistency and compliance.

### Solution with Petk

**Project Structure:**
```
chatbot-prompts/
├── petk.config.yaml
├── templates/
│   ├── base/
│   │   ├── brand-voice.md
│   │   ├── compliance.md
│   │   └── safety-guidelines.md
│   ├── personalities/
│   │   ├── customer-support.md
│   │   ├── technical-assistant.md
│   │   └── sales-advisor.md
│   └── contexts/
│       ├── ecommerce.md
│       ├── saas-platform.md
│       └── healthcare.md
```

**Configuration (`petk.config.yaml`):**
```yaml
variables:
  company_name: "TechCorp"
  brand_tone: "professional yet approachable"
  compliance_level: "enterprise"
  support_hours: "24/7"
  escalation_contact: "human-support@techcorp.com"
```

**Base Brand Voice (`templates/base/brand-voice.md`):**
```markdown
## Brand Communication Guidelines

Communicate as {{company_name}} with a {{brand_tone}} tone:

- Use clear, jargon-free language
- Show empathy and understanding
- Maintain professionalism while being conversational
- Always prioritize user needs and satisfaction
```

**Customer Support Bot (`templates/personalities/customer-support.md`):**
```markdown
# Customer Support Assistant

You are {{company_name}}'s AI customer support representative.

```{petk:include}
path: ../base/brand-voice.md
```

## Your Role
- Resolve customer inquiries efficiently
- Provide accurate product information
- Guide users through troubleshooting steps
- Know when to escalate to human agents

```{petk:include}
path: ../base/compliance.md
```

## Support Context
- Available: {{support_hours}}
- Escalation: {{escalation_contact}}

```{petk:include}
path: ../contexts/*.md
filter_by: {{context_type}}
limit: 1
```
```

**Generation Commands:**
```bash
# Generate customer support bot for e-commerce
petk process --var context_type=ecommerce --output customer-support-ecommerce.md

# Generate technical assistant for SaaS platform
petk process templates/personalities/technical-assistant.md --var context_type=saas-platform --output technical-assistant-saas.md
```

## 2. Content Marketing Automation

### Problem
Marketing teams need to generate consistent content across multiple channels while maintaining SEO optimization and brand guidelines.

### Solution with Petk

**Templates for Content Generation:**

**SEO Article Template (`templates/content/seo-article.md`):**
```markdown
---
title: "{{article_title}}"
description: "{{meta_description}}"
keywords: {{target_keywords}}
author: "{{author_name}}"
---

# {{article_title}}

{{article_intro}}

## Key Points

```{petk:include}
path: research/{{topic}}/*.md
order_by: relevance_desc
limit: 5
```

## Detailed Analysis

```{petk:include}
path: analysis/{{industry}}/*.md
sample_size: 3
sampling_method: deterministic
```

## Actionable Insights

```{petk:include}
path: insights/{{content_type}}-insights.md
```

---

*This content was generated using {{company_name}}'s content framework. Last updated: {{timestamp}}*
```

**Social Media Post Generator:**
```bash
# Generate LinkedIn post about AI trends
petk process social-media/linkedin.md --var topic="ai-trends" --var tone="professional" --var cta="learn-more"

# Generate Twitter thread about product updates
petk process social-media/twitter-thread.md --var product="api-v2" --var announcement_type="feature-launch"
```

## 3. API Documentation Generation

### Problem
Development teams need to maintain consistent API documentation across multiple services while keeping examples current and comprehensive.

### Solution with Petk

**API Documentation Template System:**

**Main API Doc Template (`templates/api/service-docs.md`):**
```markdown
# {{service_name}} API Documentation

## Overview
{{service_description}}

**Base URL:** `{{api_base_url}}`
**Version:** `{{api_version}}`
**Authentication:** {{auth_method}}

```{petk:include}
path: common/authentication.md
```

## Endpoints

```{petk:include}
path: endpoints/{{service_name}}/*.md
order_by: endpoint_priority_asc
```

## Error Handling

```{petk:include}
path: common/error-responses.md
```

## Rate Limiting

```{petk:include}
path: common/rate-limiting.md
```

## Code Examples

```{petk:include}
path: examples/{{service_name}}/*.md
order_by: language_priority
```
```

**Individual Endpoint Template (`templates/endpoints/users/create-user.md`):**
```markdown
### Create User

`POST /users`

Creates a new user account.

**Parameters:**
```json
{
  "email": "string (required)",
  "name": "string (required)",
  "role": "string (optional, default: 'user')"
}
```

**Example Request:**
```bash
curl -X POST {{api_base_url}}/users \
  -H "Authorization: Bearer {{api_token}}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin"
  }'
```

**Example Response:**
```json
{
  "id": "user_123",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin",
  "created_at": "2024-01-15T10:30:00Z"
}
```
```

**Generation Workflow:**
```bash
# Generate complete API documentation
petk process api/service-docs.md --var service_name="users" --var api_version="v2"

# Watch mode for development
petk watch --input api/ --output docs/api/
```

## 4. Training Material Development

### Problem
Educational content creators need to generate consistent training materials while adapting content for different skill levels and learning paths.

### Solution with Petk

**Training Course Template System:**

**Course Module Template (`templates/training/module.md`):**
```markdown
# Module {{module_number}}: {{module_title}}

**Duration:** {{estimated_duration}}
**Skill Level:** {{skill_level}}
**Prerequisites:** {{prerequisites}}

## Learning Objectives

By the end of this module, you will be able to:

```{petk:include}
path: objectives/{{course_type}}/module-{{module_number}}.md
```

## Content Overview

```{petk:include}
path: content/{{skill_level}}/{{module_topic}}/*.md
order_by: sequence_asc
limit: 10
```

## Practical Exercises

```{petk:include}
path: exercises/{{module_topic}}/*.md
filter_skill_level: {{skill_level}}
sample_size: 3
```

## Assessment

```{petk:include}
path: assessments/{{module_topic}}-{{skill_level}}.md
```

## Additional Resources

```{petk:include}
path: resources/{{module_topic}}/*.md
order_by: relevance_desc
limit: 5
```
```

**Adaptive Content Generation:**
```bash
# Generate beginner-level web development course
petk process training/module.md --var skill_level="beginner" --var course_type="web-dev" --var module_number="1"

# Generate advanced machine learning module
petk process training/module.md --var skill_level="advanced" --var course_type="ml" --var module_number="5"
```

## 5. Multi-language Documentation

### Problem
International teams need to maintain documentation in multiple languages while ensuring consistency and accuracy across translations.

### Solution with Petk

**Multi-language Template System:**

**Base Documentation Template (`templates/docs/user-guide.md`):**
```markdown
---
language: "{{language_code}}"
region: "{{region_code}}"
rtl: {{is_rtl}}
---

# {{product_name}} {{guide_type}}

```{petk:include}
path: common/{{language_code}}/header.md
```

## {{getting_started_title}}

```{petk:include}
path: sections/{{language_code}}/getting-started/*.md
order_by: step_order_asc
```

## {{features_title}}

```{petk:include}
path: features/{{language_code}}/*.md
order_by: priority_desc
limit: 10
```

```{petk:include}
path: common/{{language_code}}/footer.md
```
```

**Language Configuration:**
```yaml
# English
language_code: "en"
region_code: "US"
is_rtl: false
getting_started_title: "Getting Started"
features_title: "Features"

# Spanish
language_code: "es"
region_code: "ES"
is_rtl: false
getting_started_title: "Primeros Pasos"
features_title: "Características"
```

**Generation Commands:**
```bash
# Generate English documentation
petk process docs/user-guide.md --config configs/en-US.yaml

# Generate Spanish documentation
petk process docs/user-guide.md --config configs/es-ES.yaml

# Batch generate all languages
for lang in en es fr de ja; do
  petk process docs/user-guide.md --config configs/$lang.yaml --output docs/$lang/user-guide.md
done
```

## 6. A/B Testing Content Generation

### Problem
Marketing teams need to generate multiple content variations for A/B testing while maintaining brand consistency and tracking performance.

### Solution with Petk

**A/B Testing Template System:**

**Landing Page Variations (`templates/landing/hero-section.md`):**
```markdown
# {{page_title}}

```{petk:include}
path: variations/{{test_group}}/headline.md
fallback: variations/control/headline.md
```

```{petk:include}
path: variations/{{test_group}}/cta-button.md
fallback: variations/control/cta-button.md
```

```{petk:include}
path: common/features-list.md
```

<!-- 
Tracking Information:
- Test ID: {{test_id}}
- Variation: {{test_group}}
- Generated: {{timestamp}}
-->
```

**Variation Generation:**
```bash
# Generate control group
petk process landing/hero-section.md --var test_group="control" --var test_id="homepage_v1"

# Generate variation A
petk process landing/hero-section.md --var test_group="variation_a" --var test_id="homepage_v1"

# Generate variation B  
petk process landing/hero-section.md --var test_group="variation_b" --var test_id="homepage_v1"
```

## 7. Configuration Management

### Problem
DevOps teams need to generate configuration files for multiple environments while ensuring consistency and preventing configuration drift.

### Solution with Petk

**Environment Configuration Templates:**

**Docker Compose Template (`templates/docker/docker-compose.md`):**
```yaml
version: '3.8'

services:
  web:
    image: {{app_image}}:{{app_version}}
    ports:
      - "{{web_port}}:3000"
    environment:
      - NODE_ENV={{environment}}
      - DATABASE_URL={{database_url}}
      - REDIS_URL={{redis_url}}
    
```{petk:include}
path: services/{{environment}}/*.yaml
order_by: service_priority
```

  database:
    image: postgres:{{postgres_version}}
    environment:
      - POSTGRES_DB={{database_name}}
      - POSTGRES_PASSWORD={{database_password}}
    
```{petk:include}
path: config/{{environment}}/database-config.yaml
```

networks:
  default:
    name: {{project_name}}-{{environment}}
```

**Environment-Specific Generation:**
```bash
# Generate development environment
petk process docker/docker-compose.md --config envs/development.yaml

# Generate production environment  
petk process docker/docker-compose.md --config envs/production.yaml

# Generate staging environment
petk process docker/docker-compose.md --config envs/staging.yaml
```

## Implementation Best Practices

### 1. Template Organization

```
project/
├── templates/
│   ├── base/           # Shared components
│   ├── features/       # Feature-specific content
│   ├── variations/     # A/B test variations
│   └── contexts/       # Domain-specific content
├── configs/
│   ├── environments/   # Environment configs
│   ├── languages/      # Language configs
│   └── brands/         # Brand configs
└── output/
    ├── dev/           # Development outputs
    ├── staging/       # Staging outputs
    └── production/    # Production outputs
```

### 2. Version Control Integration

```bash
# Git hooks for automatic generation
echo "petk process --all" > .git/hooks/pre-commit

# CI/CD pipeline integration
petk process --config production.yaml --output dist/
```

### 3. Quality Assurance

```bash
# Validate templates before deployment
petk validate templates/

# Check for broken includes
petk process --dry-run --verbose

# Compare outputs between versions
diff -r old_output/ new_output/
```

### 4. Performance Optimization

```yaml
# Optimize for large template sets
enable_caching: true
parallel_processing: true
max_depth: 5
batch_size: 100
```

## Integration Examples

### With AI Platforms

```bash
# Generate OpenAI system prompts
petk process ai-prompts/openai-system.md --output prompts/openai/

# Create Anthropic Claude prompts
petk process ai-prompts/claude-assistant.md --output prompts/claude/

# Generate LangChain templates
petk process langchain/chain-template.md --output langchain/chains/
```

### With Documentation Platforms

```bash
# Generate GitBook documentation
petk process gitbook/user-guide.md --output gitbook/

# Create Docusaurus content
petk process docusaurus/api-docs.md --output docs/

# Generate Confluence pages
petk convert confluence-template.md confluence-page.yaml
```

### With Content Management Systems

```bash
# Generate WordPress content
petk process wordpress/blog-post.md --output wp-content/

# Create Strapi content types
petk convert strapi/content-model.md content-type.json

# Generate Contentful entries
petk process contentful/article.md --output contentful-import.json
```

## Measuring Success

### Template Reusability Metrics
- Template usage frequency
- Include block reuse rates
- Variable substitution patterns
- Content consistency scores

### Development Efficiency Gains
- Time to generate content variations
- Reduction in manual content updates
- Error rates in generated content
- Team adoption and usage patterns

### Content Quality Improvements
- Consistency across generated content
- Compliance with brand guidelines
- Accuracy of technical documentation
- User engagement with generated content

These use cases demonstrate Petk's versatility in solving real-world prompt engineering and content generation challenges across different industries and use cases.