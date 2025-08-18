export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type ValidationCategory = 
    | 'SYNTAX' 
    | 'SECURITY' 
    | 'DEPENDENCY' 
    | 'PERFORMANCE' 
    | 'WARNING';

export interface ValidationResult {
    category: ValidationCategory;
    severity: ValidationSeverity;
    message: string;
    filePath?: string;
    line?: number;
    column?: number;
    context?: string;
    suggestion?: string;
    ruleId: string;
}

export interface ValidationContext {
    filePath: string;
    content: string;
    variables?: Record<string, unknown>;
    baseDir?: string;
}

export interface ValidationRule {
    id: string;
    name: string;
    category: ValidationCategory;
    enabled: boolean;
    validate: (context: ValidationContext) => ValidationResult[];
}

export interface ValidationConfig {
    enabledRules?: string[];
    disabledRules?: string[];
    enabledCategories?: ValidationCategory[];
    disabledCategories?: ValidationCategory[];
    strictMode?: boolean;
    maxFileSize?: number;
    maxIncludeDepth?: number;
}

export interface ValidationReport {
    results: ValidationResult[];
    totalFiles: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    executionTime: number;
    filePaths?: string[];
}

export interface SecurityValidationPattern {
    pattern: RegExp;
    description: string;
    severity: ValidationSeverity;
    examples: string[];
}

export interface PathTraversalPattern extends SecurityValidationPattern {
    encoded?: boolean;
    variants: string[];
}

export interface InjectionPattern extends SecurityValidationPattern {
    type: 'command' | 'template' | 'sql' | 'script';
    context: string[];
}

export interface PerformanceThreshold {
    name: string;
    maxValue: number;
    unit: string;
    severity: ValidationSeverity;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
    strictMode: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxIncludeDepth: 10,
};

export const VALIDATION_EXIT_CODES = {
    CLEAN: 0,
    WARNINGS: 1,
    ERRORS: 2,
} as const;

export type ValidationExitCode = typeof VALIDATION_EXIT_CODES[keyof typeof VALIDATION_EXIT_CODES];

export interface FormatOptions {
    format: 'text' | 'json' | 'verbose';
    colors?: boolean;
    detailed?: boolean;
    verbose?: boolean;
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN';

export interface SecurityAssessment {
    riskLevel: RiskLevel;
    riskScore: number;
    complianceStatus: string;
}

export interface PerformanceMetrics {
    processingTime: number;
    filesPerSecond: number;
    totalFiles: number;
    totalIssues: number;
}

export interface FileRiskData {
    filePath: string;
    riskScore: number;
    riskLevel: RiskLevel;
    issueCount: number;
}

export interface DetailedSummary {
    securityAssessment: SecurityAssessment;
    topIssues: ValidationResult[];
    recommendations: string[];
    performanceMetrics: PerformanceMetrics;
    fileRiskAnalysis?: FileRiskData[];
}