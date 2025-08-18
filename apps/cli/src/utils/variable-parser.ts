export interface VariableParseOptions {
    allowEmpty?: boolean;
    strict?: boolean;
    maxVariables?: number;
    supportQuotes?: boolean;
}

export interface VariableParseResult {
    success: boolean;
    variables: Record<string, string>;
    errors?: string[];
    warnings?: string[];
}

const DEFAULT_PARSE_OPTIONS: Required<VariableParseOptions> = {
    allowEmpty: false,
    strict: false,
    maxVariables: 100,
    supportQuotes: true
};

const isValidVariableName = (name: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
};

const unquoteValue = (value: string): string => {
    if (value.length < 2) {
        return value;
    }
    
    const firstChar = value.charAt(0);
    const lastChar = value.charAt(value.length - 1);
    
    if ((firstChar === '"' && lastChar === '"') || (firstChar === "'" && lastChar === "'")) {
        return value.slice(1, -1).replace(/\\(.)/g, '$1');
    }
    
    return value;
};

const validateVariableCount = (count: number, maxVariables: number): string | null => {
    if (count > maxVariables) {
        return `Too many variables: ${count}. Maximum allowed: ${maxVariables}`;
    }
    return null;
};

const validateVariableName = (name: string, strict: boolean): string | null => {
    if (!name) {
        return 'Variable name cannot be empty';
    }
    
    if (strict && !isValidVariableName(name)) {
        return `Invalid variable name: ${name}. Must start with letter or underscore, followed by letters, numbers, or underscores`;
    }
    
    return null;
};

const validateVariableValue = (value: string, allowEmpty: boolean): string | null => {
    if (!allowEmpty && !value) {
        return 'Variable value cannot be empty';
    }
    
    return null;
};

const splitVariablePairs = (input: string): string[] => {
    const pairs: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escaped = false;
    
    for (let i = 0; i < input.length; i++) {
        const char = input.charAt(i);
        
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        
        if (char === '\\') {
            current += char;
            escaped = true;
            continue;
        }
        
        if (!inQuotes && (char === '"' || char === "'")) {
            inQuotes = true;
            quoteChar = char;
            current += char;
            continue;
        }
        
        if (inQuotes && char === quoteChar) {
            inQuotes = false;
            quoteChar = '';
            current += char;
            continue;
        }
        
        if (!inQuotes && char === ',') {
            if (current.trim()) {
                pairs.push(current.trim());
            }
            current = '';
            continue;
        }
        
        current += char;
    }
    
    if (current.trim()) {
        pairs.push(current.trim());
    }
    
    return pairs;
};

const parseSingleVariable = (
    pair: string, 
    options: Required<VariableParseOptions>
): { name?: string; value?: string; error?: string } => {
    const equalIndex = pair.indexOf('=');
    
    if (equalIndex === -1) {
        return { error: `Invalid variable format: ${pair}. Expected format: key=value` };
    }
    
    const rawName = pair.slice(0, equalIndex).trim();
    const rawValue = pair.slice(equalIndex + 1);
    
    const nameError = validateVariableName(rawName, options.strict);
    if (nameError) {
        return { error: `${nameError} in: ${pair}` };
    }
    
    const value = options.supportQuotes ? unquoteValue(rawValue) : rawValue;
    const valueError = validateVariableValue(value, options.allowEmpty);
    if (valueError) {
        return { error: `${valueError} in: ${pair}` };
    }
    
    return { name: rawName, value };
};

const createParseResult = (
    variables: Record<string, string>,
    errors: string[],
    warnings: string[]
): VariableParseResult => ({
    success: errors.length === 0,
    variables,
    ...(errors.length > 0 && { errors }),
    ...(warnings.length > 0 && { warnings })
});

export const parseVariables = (
    input: string | undefined,
    options: VariableParseOptions = {}
): VariableParseResult => {
    if (!input || input.trim() === '') {
        return createParseResult({}, [], []);
    }
    
    const mergedOptions = { ...DEFAULT_PARSE_OPTIONS, ...options };
    const pairs = splitVariablePairs(input.trim());
    const variables: Record<string, string> = {};
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const countError = validateVariableCount(pairs.length, mergedOptions.maxVariables);
    if (countError) {
        errors.push(countError);
        return createParseResult({}, errors, warnings);
    }
    
    pairs.forEach(pair => {
        const result = parseSingleVariable(pair, mergedOptions);
        
        if (result.error) {
            errors.push(result.error);
            return;
        }
        
        if (result.name && result.value !== undefined) {
            if (variables[result.name]) {
                warnings.push(`Variable '${result.name}' defined multiple times. Using last value.`);
            }
            variables[result.name] = result.value;
        }
    });
    
    return createParseResult(variables, errors, warnings);
};

export const parseVariablesSimple = (input: string | undefined): Record<string, string> => {
    const result = parseVariables(input, { allowEmpty: false, strict: false, supportQuotes: true });
    return result.variables;
};

export const mergeVariables = (
    configVars: Record<string, string>,
    cliVars: Record<string, string>
): Record<string, string> => {
    return {
        ...configVars,
        ...cliVars
    };
};

export const validateVariables = (variables: Record<string, string>): string[] => {
    const errors: string[] = [];
    
    Object.entries(variables).forEach(([name, value]) => {
        if (!isValidVariableName(name)) {
            errors.push(`Invalid variable name: ${name}`);
        }
        
        if (typeof value !== 'string') {
            errors.push(`Variable ${name} must have a string value`);
        }
    });
    
    return errors;
};

export const formatVariables = (variables: Record<string, string>): string => {
    return Object.entries(variables)
        .map(([key, value]) => {
            const needsQuotes = value.includes(',') || value.includes('=') || value.includes(' ');
            const quotedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
            return `${key}=${quotedValue}`;
        })
        .join(',');
};