# Self-Referencing Template

This template creates a circular dependency by including itself.

```yaml petk:include
path: circular-dependency-self.md
```

This should trigger a circular dependency error.