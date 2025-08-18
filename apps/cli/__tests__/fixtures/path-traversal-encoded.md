# Path Traversal with URL Encoding

This template tests URL-encoded path traversal attacks.

```yaml petk:include
path: %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
```

```yaml petk:include
path: ..%252f..%252f..%252fetc%252fpasswd
```

```yaml petk:include
path: %2e%2e\%2e%2e\%2e%2e\windows\system32\config\sam
```

Additional content to make it realistic.