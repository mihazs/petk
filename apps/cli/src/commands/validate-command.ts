import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import { loadConfiguration } from '../config/config-loader.js';
import {
    ValidationConfig,
    ValidationReport,
    ValidationResult,
    ValidationSeverity,
    ValidationCategory,
    DEFAULT_VALIDATION_CONFIG
} from '../utils/validation-types.js';
import { formatValidationReport } from '../utils/validation-reporter.js';
import { validateTemplate } from '../utils/template-validator.js';

interface ValidateCommandOptions {
    config?: string;
    strict?: boolean;
    verbose?: boolean;
    format?: 'text' | 'json';
    rules?: string[];
    enableCategories?: string[];
    disableCategories?: string[];
    enableRules?: string[];
    disableRules?: string[];
}

interface ValidationSummary {
    totalFiles: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    passed: boolean;
}

interface ExtendedValidationReport extends ValidationReport {
    summary: ValidationSummary;
    config: ValidationConfig;
}

const parseValidateOptions = (options: any): ValidateCommandOptions => ({
    config: options.config,
    strict: options.strict || false,
    verbose: options.verbose || false,
    format: options.format || 'text',
    rules: options.rules ? options.rules.split(',') : undefined,
    enableCategories: options.enableCategories ? options.enableCategories.split(',') : undefined,
    disableCategories: options.disableCategories ? options.disableCategories.split(',') : undefined,
    enableRules: options.enableRules ? options.enableRules.split(',') : undefined,
    disableRules: options.disableRules ? options.disableRules.split(',') : undefined
});

const resolveValidationConfig = async (
    configPath?: string
): Promise<ValidationConfig> => {
    try {
        if (configPath) {
            const configResult = await loadConfiguration({ configPath });
            if (!configResult.success) {
                throw new Error(`Failed to load config: ${configResult.errors?.[0]?.message}`);
            }
            return {
                ...DEFAULT_VALIDATION_CONFIG
            };
        }
        return { ...DEFAULT_VALIDATION_CONFIG };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Configuration error: ${message}`);
    }
};

interface ProgressReporter {
    shouldShow: boolean;
    startTime: number;
    totalFiles: number;
    showProgress: (current: number, filename: string) => void;
    showCompletion: () => void;
}

const createProgressReporter = (
    totalFiles: number,
    format: string
): ProgressReporter => {
    const shouldShow = totalFiles >= 2 &&
                     format === 'text' &&
                     process.stderr.isTTY;
    
    const startTime = Date.now();
    
    return {
        shouldShow,
        startTime,
        totalFiles,
        showProgress: (current: number, filename: string) => {
            if (!shouldShow) return;
            
            const elapsed = Date.now() - startTime;
            const percentage = Math.round((current / totalFiles) * 100);
            const elapsedSeconds = elapsed / 1000;
            const timeStr = elapsedSeconds < 1
                ? `${Math.round(elapsed)}ms`
                : `${elapsedSeconds.toFixed(1)}s`;
            
            const progressMsg = `\rValidating ${current}/${totalFiles}: ${path.basename(filename)} [${percentage}%] (${timeStr})`;
            process.stderr.write(progressMsg);
        },
        showCompletion: () => {
            if (!shouldShow) return;
            
            const elapsed = Date.now() - startTime;
            const elapsedSeconds = elapsed / 1000;
            const timeStr = elapsedSeconds < 1
                ? `${Math.round(elapsed)}ms`
                : `${elapsedSeconds.toFixed(1)}s`;
            
            process.stderr.write(`\rValidated ${totalFiles} files in ${timeStr}\n`);
        }
    };
};

const validateTemplateFiles = async (
    templates: string[],
    config: ValidationConfig,
    format: string = 'text'
): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];
    const progress = createProgressReporter(templates.length, format);
    
    for (let i = 0; i < templates.length; i++) {
        const templatePath = templates[i];
        
        progress.showProgress(i + 1, templatePath);
        
        try {
            await fs.access(templatePath);
            const stats = await fs.stat(templatePath);
            
            if (config.maxFileSize && stats.size > config.maxFileSize) {
                results.push({
                    category: 'PERFORMANCE',
                    severity: 'WARNING',
                    message: `File size (${stats.size} bytes) exceeds maximum (${config.maxFileSize} bytes)`,
                    filePath: templatePath,
                    line: undefined,
                    column: undefined,
                    context: undefined,
                    ruleId: 'file-size-limit'
                });
            }
            
            const content = await fs.readFile(templatePath, 'utf-8');
            const templateValidation = await validateTemplate(content, templatePath, config);
            results.push(...templateValidation.issues);
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            results.push({
                category: 'SYNTAX',
                severity: 'ERROR',
                message: `Cannot access template file: ${message}`,
                filePath: templatePath,
                line: undefined,
                column: undefined,
                context: undefined,
                ruleId: 'file-access'
            });
        }
    }
    
    progress.showCompletion();
    return results;
};

const generateValidationReport = (
    results: ValidationResult[],
    config: ValidationConfig,
    originalFilePaths: string[] = []
): ExtendedValidationReport => {
    const errorCount = results.filter(r => r.severity === 'ERROR').length;
    const warningCount = results.filter(r => r.severity === 'WARNING').length;
    const infoCount = results.filter(r => r.severity === 'INFO').length;
    
    const hasErrors = errorCount > 0;
    const hasWarnings = warningCount > 0;
    const treatWarningsAsErrors = config.strictMode && hasWarnings;
    
    const baseReport: ValidationReport = {
        results,
        totalFiles: Math.max(new Set(results.map(r => r.filePath)).size, originalFilePaths.length),
        errorCount,
        warningCount,
        infoCount,
        executionTime: 0,
        filePaths: originalFilePaths
    };
    
    return {
        ...baseReport,
        summary: {
            totalFiles: Math.max(new Set(results.map(r => r.filePath)).size, originalFilePaths.length),
            errorCount,
            warningCount,
            infoCount,
            passed: !hasErrors && !treatWarningsAsErrors
        },
        config
    };
};

const detectColorSupport = (): boolean => {
    if (process.env.NO_COLOR) {
        return false;
    }
    
    if (process.env.FORCE_COLOR) {
        return true;
    }
    
    return process.stdout.isTTY;
};

const determineExitCode = (report: ExtendedValidationReport): number => {
    const { summary, config } = report;
    
    if (summary.errorCount > 0) {
        return 2;
    }
    
    if (config.strictMode && summary.warningCount > 0) {
        return 2;
    }
    
    if (summary.warningCount > 0) {
        return 1;
    }
    
    return 0;
};

const executeValidation = async (
    templates: string[],
    options: ValidateCommandOptions
): Promise<void> => {
    try {
        if (templates.length === 0) {
            console.error('Error: No template files specified.');
            console.error('Usage: petk validate <template-files...> [options]');
            process.exit(2);
        }
        
        // Check if all templates exist and are files
        for (const template of templates) {
            try {
                const stats = await fs.stat(template);
                if (stats.isDirectory()) {
                    console.error('Expected a file');
                    process.exit(2);
                }
            } catch (error) {
                console.error('File not found');
                process.exit(2);
            }
        }
        
        const config = await resolveValidationConfig(options.config);
        
        // Apply CLI overrides to configuration
        if (options.strict) {
            config.strictMode = true;
        }
        
        if (options.enableCategories) {
            config.enabledCategories = options.enableCategories.map(cat =>
                cat.toUpperCase() as ValidationCategory
            );
        }
        
        if (options.disableCategories) {
            config.disabledCategories = options.disableCategories.map(cat =>
                cat.toUpperCase() as ValidationCategory
            );
        }
        
        if (options.enableRules) {
            config.enabledRules = options.enableRules;
        }
        
        if (options.disableRules) {
            config.disabledRules = options.disableRules;
        }
        
        const results = await validateTemplateFiles(templates, config, options.format || 'text');
        const report = generateValidationReport(results, config, templates);
        const useColors = detectColorSupport();
        
        // Add verbose information to the report for proper formatting
        const extendedReport = {
            ...report,
            verboseInfo: options.verbose ? {
                templateCount: templates.length,
                config: config
            } : undefined
        };
        
        const output = formatValidationReport(
            extendedReport,
            options.format || 'text',
            {
                format: options.verbose ? 'verbose' : (options.format || 'text'),
                verbose: options.verbose || false,
                colors: useColors
            }
        );
        
        console.log(output);
        
        const exitCode = determineExitCode(report);
        process.exit(exitCode);
        
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Validation failed: ${message}`);
        process.exit(2);
    }
};

export const validateCommand = (program: Command): void => {
    program
        .command('validate')
        .description('Validate template files for security vulnerabilities and syntax errors')
        .argument('<templates...>', 'Template files to validate')
        .option('-c, --config <path>', 'Path to configuration file')
        .option('-s, --strict', 'Treat warnings as errors (exit code 2 for warnings)')
        .option('-v, --verbose', 'Enable verbose output with detailed validation information')
        .option('-f, --format <format>', 'Output format: text (default), json', 'text')
        .option('-r, --rules <rules>', 'Comma-separated list of validation rules to enable')
        .option('--enable-categories <categories>', 'Comma-separated list of validation categories to enable (security, syntax, performance, dependencies)')
        .option('--disable-categories <categories>', 'Comma-separated list of validation categories to disable')
        .option('--enable-rules <rules>', 'Comma-separated list of specific validation rules to enable')
        .option('--disable-rules <rules>', 'Comma-separated list of specific validation rules to disable')
        .addHelpText('after', `
DESCRIPTION:
  The validate command performs comprehensive security and quality analysis of Petk template files.
  It detects common security vulnerabilities, syntax errors, and performance issues to help ensure
  template safety and reliability.

VALIDATION CATEGORIES:
  Security Validation:
    • Path traversal attacks (../../../etc/passwd, URL-encoded variants)
    • Command injection patterns (shell metacharacters, variable substitution)
    • Template injection vulnerabilities ({{code}}, \${expressions})
    • External resource access (HTTP/HTTPS/FTP URLs in includes)

  Syntax Validation:
    • YAML directive syntax validation
    • Template directive structure verification
    • Variable name and format validation
    • Directive block completeness checks

  Performance Validation:
    • Memory usage limits (10MB threshold)
    • Circular dependency detection
    • Recursive include prevention
    • Resource exhaustion patterns

  Dependency Validation:
    • Include path validation
    • Circular reference detection
    • Duplicate include identification
    • Self-reference prevention

EXIT CODES:
  0  Clean validation (no issues found)
  1  Warnings found (validation passed with minor issues)
  2  Errors found or warnings in strict mode

EXAMPLES:
  # Validate a single template file
  petk validate template.md

  # Validate multiple templates with verbose output
  petk validate template1.md template2.md --verbose

  # Strict mode - treat warnings as errors
  petk validate template.md --strict

  # Use custom configuration file
  petk validate template.md --config ./custom-config.yaml

  # JSON output format for integration with other tools
  petk validate template.md --format json

  # Validate all markdown files in current directory
  petk validate *.md

  # Validate with specific rules enabled
  petk validate template.md --rules security,syntax,performance

CONFIGURATION:
  You can customize validation behavior using a configuration file:
  
  # config.yaml
  validation:
    maxFileSize: 10485760  # 10MB limit
    strictMode: false
    rules:
      security: true
      syntax: true
      performance: true
      dependencies: true

SECURITY CONSIDERATIONS:
  The validate command is designed to identify potential security vulnerabilities before
  template processing. Always run validation on templates from untrusted sources.
  
  Common security issues detected:
  • Path traversal: Attempts to access files outside allowed directories
  • Command injection: Shell commands embedded in template content
  • Template injection: Code execution through template expressions
  • External resources: Unauthorized access to remote resources

PERFORMANCE NOTES:
  • Large files (>10MB) will trigger performance warnings
  • Validation is performed sequentially for accurate reporting
  • Use --verbose for detailed timing and analysis information
  • JSON format is recommended for automated processing
`)
        .action(async (templates: string[], options: any) => {
            const validateOptions = parseValidateOptions(options);
            await executeValidation(templates, validateOptions);
        });
};