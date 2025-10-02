# Content Management Guide

This document explains how to manage and update the text content in the Big Five assessment application.

## 📁 Content Files Structure

All content is stored in JSON files in the `lib/data/` directory:

```
lib/data/
├── domain_descriptions.json    # Domain info (O, C, E, A, N)
├── facet_descriptions.json     # What each facet measures
├── facet_interpretations.json  # High/Medium/Low personality descriptions
├── assessment_prompts.json     # Phase 1 questions (q1, q2, q3)
├── facet_hints.json           # Behavioral hints for UI
├── anchor_statements.json     # Phase 2 rating statements
├── confirmation_questions.json # Phase 3 Yes/No/Maybe questions
├── contentLoader.ts           # Data loader utility
└── contentValidation.ts       # Validation schemas
```

## 🔧 How to Update Content

### 1. **Domain Descriptions** (`domain_descriptions.json`)
Update domain information for O, C, E, A, N:

```json
{
  "O": {
    "label": "Openness (O)",
    "shortDescription": "Brief description...",
    "fullDescription": "Detailed description...",
    "results": {
      "low": "Low score description...",
      "neutral": "Neutral score description...",
      "high": "High score description..."
    }
  }
}
```

### 2. **Facet Descriptions** (`facet_descriptions.json`)
Update what each facet measures:

```json
{
  "O": {
    "Imagination": "This measures how much you use fantasy...",
    "Artistic Interests": "This measures your appreciation..."
  }
}
```

### 3. **Facet Interpretations** (`facet_interpretations.json`)
Update personality descriptions for each facet level:

```json
{
  "O": {
    "Imagination": {
      "high": "You have an exceptionally rich inner world...",
      "medium": "You balance imaginative thinking...",
      "low": "You strongly prefer to focus on facts..."
    }
  }
}
```

### 4. **Assessment Prompts** (`assessment_prompts.json`)
Update the 3-question flow for each domain:

```json
{
  "O": {
    "q1": "You join a new project today. Which three Openness moves do you do first? Pick 3.",
    "q2": "From your Q1 picks, which two do you drop? Pick 2.",
    "q3": "Resolver. From these few that are still unclear for you, pick two that feel more you when you're not under deadline. Pick 2."
  }
}
```

### 5. **Facet Hints** (`facet_hints.json`)
Update behavioral hints shown in the UI:

```json
{
  "O": {
    "Imagination": "Sketch a vivid \"how this could go\" in your head.",
    "Artistic Interests": "Tune look, sound, and feel for resonance."
  }
}
```

### 6. **Anchor Statements** (`anchor_statements.json`)
Update the 2 rating statements per facet for Phase 2:

```json
{
  "O": {
    "Imagination": [
      "I vividly imagine new possibilities during everyday tasks.",
      "I often picture detailed scenes in my mind."
    ]
  }
}
```

### 7. **Confirmation Questions** (`confirmation_questions.json`)
Update Yes/No/Maybe questions for Phase 3:

```json
{
  "O": {
    "Imagination": "In the last 2 weeks, I deliberately imagined alternative ways to do a routine task.",
    "Artistic Interests": "In the last month, I sought out art, music, or design for its own sake."
  }
}
```

## ✅ Validation

After updating content, run validation to ensure data integrity:

```typescript
import { validateAllContent } from './contentValidation';

const validation = validateAllContent();
console.log(validation);
```

## 🚀 Testing Changes

1. **Start the development server**: `pnpm dev`
2. **Navigate to the assessment**: Go to the assessment page
3. **Test each phase**: Verify all text displays correctly
4. **Check all domains**: Test O, C, E, A, N domains
5. **Verify results**: Check that results display properly

## 📝 Content Guidelines

### **Writing Style**
- Use second person ("You...")
- Keep language clear and accessible
- Avoid jargon or technical terms
- Maintain consistent tone across all content

### **Length Requirements**
- **Short descriptions**: 10+ characters
- **Full descriptions**: 50+ characters
- **Facet interpretations**: 20+ characters each
- **Assessment prompts**: 10+ characters each
- **Facet hints**: 5+ characters each
- **Anchor statements**: 10+ characters each
- **Confirmation questions**: 10+ characters each

### **Content Structure**
- All domains must have complete content
- All 30 facets must be covered
- Maintain consistent formatting
- Use proper JSON syntax

## 🔍 Troubleshooting

### **Common Issues**
1. **JSON syntax errors**: Use a JSON validator
2. **Missing content**: Ensure all required fields are present
3. **Validation failures**: Check length requirements
4. **Type errors**: Verify data structure matches schemas

### **Validation Errors**
If validation fails, check:
- All required fields are present
- String lengths meet minimum requirements
- JSON syntax is correct
- Domain keys match expected values (O, C, E, A, N)

## 🎯 Best Practices

1. **Backup before changes**: Always backup content files
2. **Test incrementally**: Test changes one file at a time
3. **Validate frequently**: Run validation after each change
4. **Use version control**: Commit changes with descriptive messages
5. **Document changes**: Note what was changed and why

## 📞 Support

If you encounter issues:
1. Check the validation output for specific errors
2. Verify JSON syntax with an online validator
3. Compare with working content files
4. Test with minimal changes first
