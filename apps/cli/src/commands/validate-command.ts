import { ValidateOptions, CommandContext } from '../types.js';

export interface ValidateResult {
    success: boolean;
    validationCount: number;
    errorCount: number;
    warningCount: number;
    duration: number;
    message: string;
    issues: Array<{
        type: 'error' | 'warning';
        message: string;
        line?: number;
    }>;
}

const validateValidateInput = (input: string): boolean => {
    return Boolean(input && input.length > 0);
};

const createValidateContext = (input: string, options: ValidateOptions): CommandContext => ({
    options,
    args: [input]
});

const processValidateOptions = (input: string, options: ValidateOptions): ValidateOptions => ({
    ...options,
    redteam: options.redteam || false
});

const executeValidateProcess = async (input: string, processedOptions: ValidateOptions): Promise<ValidateResult> => {
    const startTime = Date.now();
    
    try {
        const validationCount = 1;
        const errorCount = 0;
        const warningCount = 0;
        const issues: ValidateResult['issues'] = [];
        
        if (processedOptions.redteam) {
            issues.push({
                type: 'warning',
                message: 'Red-team validation mode is not yet implemented',
                line: 1
            });
        }
        
        const duration = Date.now() - startTime;
        const hasErrors = errorCount > 0;
        
        return {
            success: !hasErrors,
            validationCount,
            errorCount,
            warningCount: warningCount + (processedOptions.redteam ? 1 : 0),
            duration,
            issues,
            message: hasErrors 
                ? `Validation failed: ${errorCount} error(s), ${warningCount} warning(s)`
                : `Validation completed: ${validationCount} check(s), ${warningCount} warning(s)`
        };
    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            validationCount: 0,
            errorCount: 1,
            warningCount: 0,
            duration,
            issues: [{
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown validation error'
            }],
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

const handleValidateError = (input: string, error: string): ValidateResult => ({
    success: false,
    validationCount: 0,
    errorCount: 1,
    warningCount: 0,
    duration: 0,
    issues: [{
        type: 'error',
        message: error
    }],
    message: `Validation failed for ${input}: ${error}`
});

export const validateCommand = async (input: string, options: ValidateOptions): Promise<ValidateResult> => {
    if (!validateValidateInput(input)) {
        return handleValidateError(input, 'Input file path is required');
    }
    
    const context = createValidateContext(input, options);
    const processedOptions = processValidateOptions(input, options);
    
    return executeValidateProcess(input, processedOptions);
};

export const displayValidateResult = (result: ValidateResult): void => {
    if (result.success) {
        console.log(`✅ ${result.message}`);
        console.log(`📊 Validated: ${result.validationCount} check(s)`);
    } else {
        console.error(`❌ ${result.message}`);
    }
    
    if (result.issues.length > 0) {
        console.log('\n📋 Issues found:');
        result.issues.forEach((issue, index) => {
            const icon = issue.type === 'error' ? '🔴' : '🟡';
            const line = issue.line ? ` (line ${issue.line})` : '';
            console.log(`  ${index + 1}. ${icon} ${issue.type.toUpperCase()}${line}: ${issue.message}`);
        });
    }
    
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log(`📈 Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s)`);
    console.log('📋 Note: Full validation functionality will be implemented in Phase 4');
};