import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import type {
    PetkConfig,
    LoadedConfig,
    ConfigLoadOptions,
    ConfigLoadResult,
    ConfigValidationError
} from './config-types.js';
import { DEFAULT_CONFIG } from './config-types.js';

const mergeConfigurations = (defaultConfig: PetkConfig, loadedConfig: Partial<PetkConfig>): PetkConfig => {
    const templateConfig = {
        ...defaultConfig.template,
        ...loadedConfig.template
    };

    const optimizationConfig = {
        ...defaultConfig.template?.optimization,
        ...loadedConfig.template?.optimization
    };

    const watchConfig = {
        ...defaultConfig.watch,
        ...loadedConfig.watch
    };

    const loggingConfig = {
        ...defaultConfig.logging,
        ...loadedConfig.logging
    };

    const cacheConfig = {
        ...defaultConfig.cache,
        ...loadedConfig.cache
    };

    return {
        ...defaultConfig,
        ...loadedConfig,
        variables: {
            ...defaultConfig.variables,
            ...loadedConfig.variables
        },
        template: {
            ...templateConfig,
            optimization: optimizationConfig
        },
        watch: watchConfig,
        logging: loggingConfig,
        cache: cacheConfig
    } as PetkConfig;
};

const mergeVariables = (configVars: Record<string, string>, overrideVars: Record<string, string>): Record<string, string> => {
    return {
        ...configVars,
        ...overrideVars
    };
};

const validateConfigStructure = (config: unknown): ConfigValidationError[] => {
    const errors: ConfigValidationError[] = [];
    
    if (typeof config !== 'object' || config === null) {
        errors.push({
            path: 'root',
            message: 'Configuration must be an object',
            value: config
        });
        return errors;
    }
    
    const configObj = config as Record<string, unknown>;
    
    if (configObj.variables && typeof configObj.variables !== 'object') {
        errors.push({
            path: 'variables',
            message: 'Variables must be an object with string key-value pairs',
            value: configObj.variables
        });
    }
    
    if (configObj.version && typeof configObj.version !== 'string') {
        errors.push({
            path: 'version',
            message: 'Version must be a string',
            value: configObj.version
        });
    }
    
    if (configObj.logging) {
        const logging = configObj.logging as Record<string, unknown>;
        if (logging.level && !['silent', 'error', 'warn', 'info', 'debug', 'verbose'].includes(logging.level as string)) {
            errors.push({
                path: 'logging.level',
                message: 'Invalid logging level. Must be one of: silent, error, warn, info, debug, verbose',
                value: logging.level
            });
        }
        if (logging.format && !['json', 'pretty'].includes(logging.format as string)) {
            errors.push({
                path: 'logging.format',
                message: 'Invalid logging format. Must be one of: json, pretty',
                value: logging.format
            });
        }
    }
    
    return errors;
};

const parseYamlFile = (filePath: string): unknown => {
    try {
        const fileContent = readFileSync(filePath, 'utf8');
        return yaml.load(fileContent);
    } catch (error) {
        throw new Error(`Failed to parse YAML file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const resolveConfigPath = (providedPath?: string): string => {
    if (providedPath) {
        return resolve(providedPath);
    }
    
    const defaultPaths = [
        'petk.config.yaml',
        'petk.config.yml',
        '.petk/config.yaml',
        '.petk/config.yml'
    ];
    
    for (const defaultPath of defaultPaths) {
        const fullPath = resolve(defaultPath);
        if (existsSync(fullPath)) {
            return fullPath;
        }
    }
    
    throw new Error('No configuration file found. Looked for: ' + defaultPaths.join(', '));
};

const loadConfigFromFile = (configPath: string): Partial<PetkConfig> => {
    if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    const parsedConfig = parseYamlFile(configPath);
    const validationErrors = validateConfigStructure(parsedConfig);
    
    if (validationErrors.length > 0) {
        const errorMessages = validationErrors.map(err => `${err.path}: ${err.message}`).join('; ');
        throw new Error(`Configuration validation failed: ${errorMessages}`);
    }
    
    return parsedConfig as Partial<PetkConfig>;
};

const createLoadedConfig = (
    config: PetkConfig, 
    configPath: string, 
    loaded: boolean, 
    source: LoadedConfig['source']
): LoadedConfig => ({
    config,
    configPath,
    loaded,
    source
});

export const loadConfiguration = (options: ConfigLoadOptions = {}): ConfigLoadResult => {
    try {
        let configPath: string;
        let loadedConfig: Partial<PetkConfig> = {};
        let loaded = false;
        let source: LoadedConfig['source'] = 'default';
        
        try {
            configPath = resolveConfigPath(options.configPath);
            loadedConfig = loadConfigFromFile(configPath);
            loaded = true;
            source = 'file';
        } catch (error) {
            if (options.configPath) {
                return {
                    success: false,
                    errors: [{
                        path: 'configPath',
                        message: error instanceof Error ? error.message : 'Unknown error loading config',
                        value: options.configPath
                    }]
                };
            }
            
            configPath = resolve('petk.config.yaml');
            loaded = false;
            source = 'default';
        }
        
        let mergedConfig = mergeConfigurations(DEFAULT_CONFIG, loadedConfig);
        
        if (options.overrideVars) {
            mergedConfig = {
                ...mergedConfig,
                variables: mergeVariables(mergedConfig.variables || {}, options.overrideVars)
            };
            source = 'merged';
        }
        
        const result = createLoadedConfig(mergedConfig, configPath, loaded, source);
        
        return {
            success: true,
            config: result
        };
        
    } catch (error) {
        return {
            success: false,
            errors: [{
                path: 'general',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                value: options
            }]
        };
    }
};

export const getDefaultConfig = (): PetkConfig => ({ ...DEFAULT_CONFIG });

export const validateConfig = (config: unknown): ConfigValidationError[] => {
    return validateConfigStructure(config);
};