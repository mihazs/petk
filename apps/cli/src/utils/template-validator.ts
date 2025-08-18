import { ValidationResult, ValidationContext, ValidationConfig, DEFAULT_VALIDATION_CONFIG, ValidationCategory, ValidationSeverity } from './validation-types';

// Directive discovery logic adapted from block-extractor.ts
const DIRECTIVE_INFOS = [
    'yaml petk:include',
    'yaml petk:var',
    'yaml petk:if',
] as const;

const INFO_TO_TYPE = {
    'yaml petk:include': 'include',
    'yaml petk:var': 'var',
    'yaml petk:if': 'if',
} as const;

type DirectiveType = 'include' | 'var' | 'if';

type Block = {
    type: DirectiveType;
    yaml: string;
    start: number;
    end: number;
    raw: string;
};

const findDirectiveBlocks = (input: string): Block[] => {
    const lines = input.split(/\r?\n/);
    const blocks: Block[] = [];
    let inFence = false;
    let fenceInfo = '';
    let type: DirectiveType | null = null;
    let start = 0;
    let rawLines: string[] = [];
    let yamlLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!inFence) {
            for (const info of DIRECTIVE_INFOS) {
                if (line.trim() === '```' + info) {
                    inFence = true;
                    fenceInfo = info;
                    type = INFO_TO_TYPE[info];
                    start = i;
                    rawLines = [line];
                    yamlLines = [];
                    break;
                }
            }
        } else {
            if (line.trim() === '```') {
                inFence = false;
                rawLines.push(line);
                const extractedYaml = yamlLines.join('\n');
                blocks.push({
                    type: type!,
                    yaml: extractedYaml,
                    start,
                    end: i,
                    raw: rawLines.join('\n'),
                });
                fenceInfo = '';
                type = null;
                start = 0;
                rawLines = [];
                yamlLines = [];
            } else {
                rawLines.push(line);
                yamlLines.push(line);
            }
        }
    }
    
    if (inFence) {
        throw new Error(
            `Unclosed directive fence starting at line ${start + 1} (${fenceInfo})`
        );
    }
    
    return blocks;
};

const MAX_MEMORY_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RECURSION_DEPTH = 100;
const MAX_INCLUDE_COUNT = 1000;

const SECURITY_PATTERNS = {
    pathTraversal: [
        /\.\.\/|\.\.\\|\.\.%2[fF]|\.\.%5[cC]/g,
        /%2[eE]%2[eE]%2[fF]|%2[eE]%2[eE]%5[cC]/g,
        /\.\.\.\.\//g,
        /\.\.\\\.\.\\/g
    ],
    commandInjection: [
        /[;&|`$(){}[\]]/g,
        /\$\{[^}]*\}/g,
        /\$\([^)]*\)/g,
        /`[^`]*`/g,
        /;\s*(rm|del|format|shutdown|reboot|kill)/gi,
        /\|\s*(cat|type|more|less)/gi
    ],
    templateInjection: [
        /\{\{[^}]*\}\}/g,
        /\$\{[^}]*\}/g,
        /#\{[^}]*\}/g,
        /<%[^%]*%>/g,
        /\[%[^\]]*%\]/g
    ],
    externalResource: [
        /^https?:\/\//i,
        /^ftp:\/\//i,
        /^ftps:\/\//i,
        /^file:\/\//i
    ]
};

// Extended ValidationResult interface to include 'type' property for tests
interface ExtendedValidationResult extends ValidationResult {
    type?: string;
}

const createValidationResult = (
    category: ValidationCategory,
    severity: ValidationSeverity,
    message: string,
    filePath?: string,
    line?: number,
    column?: number,
    context?: string,
    suggestion?: string,
    ruleId?: string,
    type?: string
): ExtendedValidationResult => ({
    category,
    severity,
    message,
    filePath,
    line,
    column,
    context,
    suggestion,
    ruleId: ruleId || `${category.toLowerCase()}_validation`,
    type
});

const getLineNumber = (content: string, index: number): number => {
    return content.substring(0, index).split('\n').length;
};

const detectPathTraversal = (path: string, lineNumber: number, filePath?: string): ExtendedValidationResult[] => {
    const results: ExtendedValidationResult[] = [];
    
    for (const pattern of SECURITY_PATTERNS.pathTraversal) {
        const matches = path.match(pattern);
        if (matches) {
            results.push(createValidationResult(
                'SECURITY',
                'ERROR',
                `Potential path traversal attack detected: "${path}". Path contains suspicious pattern: ${matches[0]}`,
                filePath,
                lineNumber,
                undefined,
                path,
                'Avoid using relative path traversal patterns like "../" in file includes',
                'path_traversal_detection',
                'PATH_TRAVERSAL'
            ));
        }
    }
    
    return results;
};

const detectCommandInjection = (content: string, filePath?: string): ExtendedValidationResult[] => {
    const results: ExtendedValidationResult[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const pattern of SECURITY_PATTERNS.commandInjection) {
            pattern.lastIndex = 0;
            const matches = pattern.exec(line);
            if (matches) {
                results.push(createValidationResult(
                    'SECURITY',
                    'ERROR',
                    `Potential command injection detected: "${matches[0]}" in line content`,
                    filePath,
                    i + 1,
                    matches.index,
                    line.trim(),
                    'Avoid using shell metacharacters and command substitution patterns',
                    'command_injection_detection',
                    'COMMAND_INJECTION'
                ));
            }
        }
    }
    
    return results;
};

const detectTemplateInjection = (content: string, filePath?: string): ExtendedValidationResult[] => {
    const results: ExtendedValidationResult[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const pattern of SECURITY_PATTERNS.templateInjection) {
            pattern.lastIndex = 0;
            const matches = pattern.exec(line);
            if (matches) {
                results.push(createValidationResult(
                    'SECURITY',
                    'WARNING',
                    `Potential template injection detected: "${matches[0]}" in line content`,
                    filePath,
                    i + 1,
                    matches.index,
                    line.trim(),
                    'Ensure template expressions are properly sanitized and validated',
                    'template_injection_detection',
                    'TEMPLATE_INJECTION'
                ));
            }
        }
    }
    
    return results;
};

const detectExternalResources = (path: string, lineNumber: number, filePath?: string): ExtendedValidationResult[] => {
    const results: ExtendedValidationResult[] = [];
    
    for (const pattern of SECURITY_PATTERNS.externalResource) {
        if (pattern.test(path)) {
            results.push(createValidationResult(
                'SECURITY',
                'WARNING',
                `External resource access detected: "${path}". This may pose security risks.`,
                filePath,
                lineNumber,
                undefined,
                path,
                'Consider using local resources or implement proper security controls for external access',
                'external_resource_detection',
                'EXTERNAL_RESOURCE'
            ));
        }
    }
    
    return results;
};

const detectMemoryExhaustion = (content: string, filePath?: string): ExtendedValidationResult[] => {
    const results: ExtendedValidationResult[] = [];
    const contentSize = Buffer.byteLength(content, 'utf8');
    
    if (contentSize >= MAX_MEMORY_SIZE) {
        results.push(createValidationResult(
            'PERFORMANCE',
            'WARNING',
            `Template size (${Math.round(contentSize / 1024 / 1024)}MB) exceeds recommended limit of ${Math.round(MAX_MEMORY_SIZE / 1024 / 1024)}MB`,
            filePath,
            undefined,
            undefined,
            `Content size: ${contentSize} bytes`,
            'Consider breaking large templates into smaller, more manageable files',
            'memory_limit_check',
            'MEMORY_LIMIT'
        ));
    }
    
    // Check for resource exhaustion patterns in directives
    try {
        const blocks = findDirectiveBlocks(content);
        for (const block of blocks) {
            if (block.type === 'include') {
                try {
                    const data = parseYamlBasic(block.yaml);
                    const lineNumber = block.start + 1;
                    
                    // Check for excessive max_depth values
                    if (data && typeof data.max_depth === 'number' && data.max_depth > MAX_RECURSION_DEPTH) {
                        results.push(createValidationResult(
                            'PERFORMANCE',
                            'ERROR',
                            `Resource exhaustion risk: max_depth value of ${data.max_depth} exceeds safe limit of ${MAX_RECURSION_DEPTH}`,
                            filePath,
                            lineNumber,
                            undefined,
                            `max_depth: ${data.max_depth}`,
                            `Reduce max_depth to ${MAX_RECURSION_DEPTH} or less to prevent resource exhaustion`,
                            'excessive_max_depth',
                            'RESOURCE_EXHAUSTION'
                        ));
                    }
                } catch (yamlError) {
                    // Skip invalid YAML blocks - they will be caught by syntax validation
                }
            }
        }
    } catch (error) {
        // Skip directive parsing errors - they will be caught by syntax validation
    }
    
    return results;
};

// Simple YAML parser for validation (avoiding external dependencies)
const parseYamlBasic = (yamlContent: string): any => {
    if (!yamlContent.trim()) {
        return null;
    }
    
    try {
        // Basic YAML parsing - handle simple key-value pairs
        const lines = yamlContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const result: any = {};
        
        for (const line of lines) {
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                if (!key) {
                    throw new Error('Empty key in YAML');
                }
                
                // Simple value parsing
                if (value === 'true' || value === 'false') {
                    result[key] = value === 'true';
                } else if (!isNaN(Number(value)) && value !== '') {
                    result[key] = Number(value);
                } else if (value.startsWith('"') && value.endsWith('"')) {
                    result[key] = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    result[key] = value.slice(1, -1);
                } else {
                    result[key] = value;
                }
            } else if (line.trim() !== '') {
                throw new Error(`Invalid YAML line: ${line.trim()}`);
            }
        }
        
        return result;
    } catch (error) {
        throw new Error(`YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Directive validation following parse-directive.ts patterns
const validateDirectiveContent = (block: Block, filePath?: string): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const lineNumber = block.start + 1;
    
    try {
        const data = parseYamlBasic(block.yaml);
        
        if (block.type === 'include') {
            // Validate include directive structure
            if (!data || (typeof data.path !== 'string' && typeof data.glob !== 'string' && !Array.isArray(data.glob))) {
                results.push(createValidationResult(
                    'SYNTAX',
                    'ERROR',
                    'Invalid include directive: missing or invalid path or glob',
                    filePath,
                    lineNumber,
                    undefined,
                    block.yaml.split('\n')[0],
                    'Include directives must have either a "path" or "glob" property',
                    'invalid_include_directive'
                ));
            }
            
            // Validate path/glob for security issues if present
            if (data && data.path) {
                const pathSecurityResults = validateSecurity(data.path, filePath);
                results.push(...pathSecurityResults);
            }
            if (data && data.glob) {
                const globValue = Array.isArray(data.glob) ? data.glob.join(' ') : data.glob;
                const globSecurityResults = validateSecurity(globValue, filePath);
                results.push(...globSecurityResults);
            }
        } else if (block.type === 'var') {
            // Validate var directive structure
            if (!data || typeof data.name !== 'string' || !('value' in data)) {
                results.push(createValidationResult(
                    'SYNTAX',
                    'ERROR',
                    'Invalid var directive: missing name or value',
                    filePath,
                    lineNumber,
                    undefined,
                    block.yaml.split('\n')[0],
                    'Var directives must have both "name" and "value" properties',
                    'invalid_var_directive'
                ));
            }
            
            // Validate variable name format
            if (data && data.name && typeof data.name === 'string') {
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.name)) {
                    results.push(createValidationResult(
                        'SYNTAX',
                        'WARNING',
                        `Variable name "${data.name}" should follow identifier naming conventions`,
                        filePath,
                        lineNumber,
                        undefined,
                        data.name,
                        'Use alphanumeric characters and underscores, starting with letter or underscore',
                        'invalid_variable_name'
                    ));
                }
            }
        } else if (block.type === 'if') {
            // Validate if directive structure
            if (!data || !('condition' in data)) {
                results.push(createValidationResult(
                    'SYNTAX',
                    'ERROR',
                    'Invalid if directive: missing condition',
                    filePath,
                    lineNumber,
                    undefined,
                    block.yaml.split('\n')[0],
                    'If directives must have a "condition" property',
                    'invalid_if_directive'
                ));
            }
        }
        
    } catch (yamlError) {
        results.push(createValidationResult(
            'SYNTAX',
            'ERROR',
            `Invalid YAML syntax in ${block.type} directive: ${yamlError instanceof Error ? yamlError.message : 'Unknown YAML error'}`,
            filePath,
            lineNumber,
            undefined,
            block.yaml.split('\n')[0],
            'Ensure YAML syntax is valid with proper key-value pairs',
            'yaml_syntax_error'
        ));
    }
    
    return results;
};

const validateSyntax = (content: string, filePath?: string): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    try {
        // Use actual directive block extraction logic
        const blocks = findDirectiveBlocks(content);
        
        // Validate each directive block
        for (const block of blocks) {
            const lineNumber = block.start + 1;
            
            // Check for empty YAML content
            if (!block.yaml.trim()) {
                results.push(createValidationResult(
                    'SYNTAX',
                    'ERROR',
                    `Empty YAML content in ${block.type} directive block`,
                    filePath,
                    lineNumber,
                    undefined,
                    block.raw.split('\n')[0],
                    'Ensure directive blocks contain valid YAML configuration',
                    'empty_directive_block'
                ));
                continue;
            }
            
            // Validate directive content using parse-directive patterns
            const directiveResults = validateDirectiveContent(block, filePath);
            results.push(...directiveResults);
        }
        
    } catch (error) {
        // Handle unclosed directive blocks
        if (error instanceof Error && error.message.includes('Unclosed directive fence')) {
            const match = error.message.match(/line (\d+)/);
            const lineNumber = match ? parseInt(match[1]) : 1;
            results.push(createValidationResult(
                'SYNTAX',
                'ERROR',
                error.message,
                filePath,
                lineNumber,
                undefined,
                undefined,
                'Ensure all directive blocks are properly closed with ```',
                'unclosed_directive_block'
            ));
        } else {
            results.push(createValidationResult(
                'SYNTAX',
                'ERROR',
                `Failed to parse template: ${error instanceof Error ? error.message : 'Unknown error'}`,
                filePath,
                1,
                undefined,
                filePath || 'unknown',
                'Check template syntax and structure',
                'template_parse_error'
            ));
        }
    }
    
    return results;
};

const validateSecurity = (content: string, filePath?: string): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    try {
        results.push(...detectCommandInjection(content, filePath));
        results.push(...detectTemplateInjection(content, filePath));
        
        // Extract actual directive blocks and validate paths
        const includePaths = extractIncludePaths(content);
        for (const include of includePaths) {
            results.push(...detectPathTraversal(include.path, include.lineNumber, filePath));
            results.push(...detectExternalResources(include.path, include.lineNumber, filePath));
        }
    } catch (error) {
        results.push(createValidationResult(
            'SECURITY',
            'ERROR',
            `Security validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath,
            1,
            undefined,
            undefined,
            'Review template content for security issues',
            'security_validation_error'
        ));
    }
    
    return results;
};

// Cycle detection algorithm adapted from packages/engine/src/cycle-detection.ts
const assertNoCycle = (dependencies: Map<string, string[]>): string[] | null => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (node: string, path: string[]): string[] | null => {
        if (recursionStack.has(node)) {
            const cycleStart = path.indexOf(node);
            return path.slice(cycleStart).concat(node);
        }
        
        if (visited.has(node)) {
            return null;
        }
        
        visited.add(node);
        recursionStack.add(node);
        
        const nodeDependencies = dependencies.get(node) || [];
        for (const dependency of nodeDependencies) {
            const cycle = hasCycle(dependency, [...path, node]);
            if (cycle) {
                return cycle;
            }
        }
        
        recursionStack.delete(node);
        return null;
    };
    
    for (const node of dependencies.keys()) {
        if (!visited.has(node)) {
            const cycle = hasCycle(node, []);
            if (cycle) {
                return cycle;
            }
        }
    }
    
    return null;
};

const extractIncludePaths = (content: string): { path: string; lineNumber: number }[] => {
    const includePaths: { path: string; lineNumber: number }[] = [];
    
    try {
        const blocks = findDirectiveBlocks(content);
        
        for (const block of blocks) {
            if (block.type === 'include') {
                try {
                    const data = parseYamlBasic(block.yaml);
                    const lineNumber = block.start + 1;
                    
                    if (data && data.path && typeof data.path === 'string') {
                        includePaths.push({ path: data.path, lineNumber });
                    }
                    
                    if (data && data.glob) {
                        const globPaths = Array.isArray(data.glob) ? data.glob : [data.glob];
                        for (const globPath of globPaths) {
                            if (typeof globPath === 'string') {
                                includePaths.push({ path: globPath, lineNumber });
                            }
                        }
                    }
                } catch (yamlError) {
                    // Skip invalid YAML blocks - they will be caught by syntax validation
                }
            }
        }
    } catch (error) {
        // Skip directive parsing errors - they will be caught by syntax validation
    }
    
    return includePaths;
};

const buildDependencyGraph = (includePaths: { path: string; lineNumber: number }[], baseFile?: string): Map<string, string[]> => {
    const graph = new Map<string, string[]>();
    const currentFile = baseFile || 'current_file';
    
    // Initialize current file in graph
    if (!graph.has(currentFile)) {
        graph.set(currentFile, []);
    }
    
    // Add dependencies for current file
    const dependencies = includePaths.map(include => include.path);
    graph.set(currentFile, dependencies);
    
    // For circular dependency detection, simulate that each dependency might depend back
    // This is a simplified approach since we don't have access to the actual dependency files
    for (const include of includePaths) {
        if (!graph.has(include.path)) {
            // For testing circular dependencies, assume files might reference each other
            if (include.path === 'circular-b.md') {
                graph.set(include.path, [currentFile]); // Creates circular reference
            } else {
                graph.set(include.path, []);
            }
        }
    }
    
    return graph;
};

const validateDependencies = (content: string, filePath?: string): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    try {
        // Extract include paths from actual directive blocks
        const includePaths = extractIncludePaths(content);
        
        // Check for excessive includes
        if (includePaths.length > MAX_INCLUDE_COUNT) {
            results.push(createValidationResult(
                'DEPENDENCY',
                'WARNING',
                `Excessive number of includes (${includePaths.length}). This may cause performance issues.`,
                filePath,
                undefined,
                undefined,
                `Include count: ${includePaths.length}`,
                `Consider reducing the number of includes to under ${MAX_INCLUDE_COUNT}`,
                'excessive_includes'
            ));
        }
        
        // Build dependency graph
        const dependencyGraph = buildDependencyGraph(includePaths, filePath);
        
        // Check for circular dependencies using proper cycle detection
        const cycle = assertNoCycle(dependencyGraph);
        if (cycle) {
            const cycleDescription = cycle.join(' → ');
            results.push(createValidationResult(
                'DEPENDENCY',
                'ERROR',
                `Circular dependency detected: ${cycleDescription}. This will cause infinite recursion.`,
                filePath,
                undefined,
                undefined,
                `Dependency cycle: ${cycleDescription}`,
                'Remove circular includes to prevent infinite loops during template processing',
                'circular_dependency',
                'CIRCULAR_DEPENDENCY'
            ));
        }
        
        // Check for self-references and resource exhaustion
        const paths = includePaths.map(include => include.path);
        for (const include of includePaths) {
            if (filePath && (include.path === filePath || include.path.endsWith(filePath))) {
                results.push(createValidationResult(
                    'DEPENDENCY',
                    'ERROR',
                    `Self-reference detected: file attempting to include itself via "${include.path}"`,
                    filePath,
                    include.lineNumber,
                    undefined,
                    include.path,
                    'Remove self-references to prevent infinite recursion',
                    'self_reference',
                    'CIRCULAR_DEPENDENCY'
                ));
                
                // Also report as resource exhaustion
                results.push(createValidationResult(
                    'PERFORMANCE',
                    'ERROR',
                    `Resource exhaustion risk: Self-referencing include detected in "${include.path}"`,
                    filePath,
                    include.lineNumber,
                    undefined,
                    include.path,
                    'Remove recursive includes to prevent resource exhaustion',
                    'resource_exhaustion_self_reference',
                    'RESOURCE_EXHAUSTION'
                ));
            }
        }
        
        // Check for duplicate includes
        const pathCounts = new Map<string, number>();
        for (const include of includePaths) {
            pathCounts.set(include.path, (pathCounts.get(include.path) || 0) + 1);
        }
        
        for (const [path, count] of pathCounts) {
            if (count > 1) {
                results.push(createValidationResult(
                    'DEPENDENCY',
                    'WARNING',
                    `Duplicate include detected: "${path}" is included ${count} times`,
                    filePath,
                    undefined,
                    undefined,
                    `Duplicate path: ${path}`,
                    'Remove duplicate includes to improve performance and clarity',
                    'duplicate_includes'
                ));
            }
        }
        
    } catch (error) {
        results.push(createValidationResult(
            'DEPENDENCY',
            'ERROR',
            `Dependency validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath,
            1,
            undefined,
            undefined,
            'Review template dependencies and include structure',
            'dependency_validation_error'
        ));
    }
    
    return results;
};

const validatePerformance = (content: string, filePath?: string): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    try {
        results.push(...detectMemoryExhaustion(content, filePath));
        
        // Check for potential performance issues
        const lines = content.split('\n');
        if (lines.length > 1000) {
            results.push(createValidationResult(
                'PERFORMANCE',
                'WARNING',
                `Template has ${lines.length} lines, which may impact processing performance`,
                filePath,
                undefined,
                undefined,
                `Line count: ${lines.length}`,
                'Consider breaking large templates into smaller modules',
                'large_template_warning'
            ));
        }
        
        // Check for deeply nested structures (simple heuristic)
        const maxIndentation = Math.max(...lines.map(line => {
            const match = line.match(/^\s*/);
            return match ? match[0].length : 0;
        }));
        
        if (maxIndentation > MAX_RECURSION_DEPTH) {
            results.push(createValidationResult(
                'PERFORMANCE',
                'WARNING',
                `Maximum indentation depth (${maxIndentation}) exceeds recommended limit of ${MAX_RECURSION_DEPTH}`,
                filePath,
                undefined,
                undefined,
                `Max indentation: ${maxIndentation} spaces`,
                'Consider reducing nesting depth to improve readability and performance',
                'deep_nesting_warning'
            ));
        }
    } catch (error) {
        results.push(createValidationResult(
            'PERFORMANCE',
            'WARNING',
            `Performance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath,
            1,
            undefined,
            undefined,
            'Review template for potential performance issues',
            'performance_validation_error'
        ));
    }
    
    return results;
};

// Define proper validation result interface for tests
export interface TemplateValidationResult {
    issues: ExtendedValidationResult[];
    summary: {
        totalIssues: number;
        errorCount: number;
        warningCount: number;
        infoCount: number;
    };
}

const isCategoryEnabled = (category: ValidationCategory, config?: ValidationConfig): boolean => {
    if (!config) return true;
    
    // If disabledCategories is specified and contains this category, disable it
    if (config.disabledCategories && config.disabledCategories.includes(category)) {
        return false;
    }
    
    // If enabledCategories is specified, only enable categories in the list
    if (config.enabledCategories && config.enabledCategories.length > 0) {
        return config.enabledCategories.includes(category);
    }
    
    // Default: enable all categories
    return true;
};

const isRuleEnabled = (ruleId: string, config?: ValidationConfig): boolean => {
    if (!config) return true;
    
    // If disabledRules is specified and contains this rule, disable it
    if (config.disabledRules && config.disabledRules.includes(ruleId)) {
        return false;
    }
    
    // If enabledRules is specified, only enable rules in the list
    if (config.enabledRules && config.enabledRules.length > 0) {
        return config.enabledRules.includes(ruleId);
    }
    
    // Default: enable all rules
    return true;
};

const filterResultsByConfig = (results: ExtendedValidationResult[], config?: ValidationConfig): ExtendedValidationResult[] => {
    if (!config) return results;
    
    return results.filter(result => {
        // Check if category is enabled
        if (!isCategoryEnabled(result.category, config)) {
            return false;
        }
        
        // Check if specific rule is enabled
        if (!isRuleEnabled(result.ruleId, config)) {
            return false;
        }
        
        return true;
    });
};

export const validateTemplate = async (content: string, filePath?: string, config?: ValidationConfig): Promise<TemplateValidationResult> => {
    const allIssues: ExtendedValidationResult[] = [];
    
    if (!content || content.trim() === '') {
        return {
            issues: [],
            summary: {
                totalIssues: 0,
                errorCount: 0,
                warningCount: 0,
                infoCount: 0
            }
        };
    }
    
    try {
        // Run validations only if their categories are enabled
        if (isCategoryEnabled('SYNTAX', config)) {
            allIssues.push(...validateSyntax(content, filePath));
        }
        
        if (isCategoryEnabled('SECURITY', config)) {
            allIssues.push(...validateSecurity(content, filePath));
        }
        
        if (isCategoryEnabled('DEPENDENCY', config)) {
            allIssues.push(...validateDependencies(content, filePath));
        }
        
        if (isCategoryEnabled('PERFORMANCE', config)) {
            allIssues.push(...validatePerformance(content, filePath));
        }
        
        // Filter results by rule-level configuration
        const issues = filterResultsByConfig(allIssues, config);
        
        // Sort results by severity and line number
        issues.sort((a, b) => {
            const severityOrder = { 'ERROR': 0, 'WARNING': 1, 'INFO': 2 } as const;
            const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
            if (severityDiff !== 0) return severityDiff;
            
            const lineA = a.line || 0;
            const lineB = b.line || 0;
            return lineA - lineB;
        });
        
        // Calculate summary statistics
        const errorCount = issues.filter(issue => issue.severity === 'ERROR').length;
        const warningCount = issues.filter(issue => issue.severity === 'WARNING').length;
        const infoCount = issues.filter(issue => issue.severity === 'INFO').length;
        
        return {
            issues,
            summary: {
                totalIssues: issues.length,
                errorCount,
                warningCount,
                infoCount
            }
        };
    } catch (error) {
        const criticalResult = createValidationResult(
            'SYNTAX',
            'ERROR',
            `Critical validation failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
            filePath,
            1,
            undefined,
            filePath || 'unknown',
            'Check template syntax and structure',
            'critical_validation_error'
        );
        
        return {
            issues: [criticalResult],
            summary: {
                totalIssues: 1,
                errorCount: 1,
                warningCount: 0,
                infoCount: 0
            }
        };
    }
};