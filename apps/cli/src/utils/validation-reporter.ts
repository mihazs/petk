import {
    ValidationReport,
    ValidationResult,
    ValidationSeverity,
    ValidationCategory,
    FormatOptions,
    RiskLevel,
    SecurityAssessment,
    PerformanceMetrics,
    DetailedSummary
} from './validation-types.js';

interface SummaryStats {
    totalResults: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    fileCount: number;
    categoryCounts: Record<string, number>;
}

const SEVERITY_COLORS = {
    ERROR: '\x1b[31m',
    WARNING: '\x1b[33m',
    INFO: '\x1b[36m'
};

const SEVERITY_ICONS = {
    ERROR: '✗',
    WARNING: '⚠',
    INFO: 'ℹ'
};

const RESET_COLOR = '\x1b[0m';
const BOLD = '\x1b[1m';

const applyColor = (text: string, color: string, useColors = true): string =>
    useColors ? `${color}${text}${RESET_COLOR}` : text;

const applySeverityColor = (text: string, severity: ValidationSeverity, useColors = true): string => {
    const color = SEVERITY_COLORS[severity] || '';
    return applyColor(text, color, useColors);
};

const formatSeverityLevel = (severity: ValidationSeverity, useColors = true): string => {
    const icon = SEVERITY_ICONS[severity] || '';
    const coloredIcon = applySeverityColor(icon, severity, useColors);
    const coloredSeverity = applySeverityColor(severity, severity, useColors);
    return `${coloredIcon} ${coloredSeverity}`;
};

const formatFilePath = (filePath: string, useColors = true): string => {
    const maxLength = 60;
    const truncated = filePath.length > maxLength 
        ? `...${filePath.slice(-(maxLength - 3))}` 
        : filePath;
    return applyColor(truncated, BOLD, useColors);
};

const formatLineReference = (line?: number): string =>
    line ? `:${line}` : '';

const formatValidationResult = (result: ValidationResult, options: FormatOptions): string => {
    const { format, colors = true } = options;
    const verbose = format === 'verbose';
    const severityFormatted = formatSeverityLevel(result.severity, colors);
    const fileFormatted = formatFilePath(result.filePath || 'unknown', colors);
    const lineRef = formatLineReference(result.line);
    const location = `(${fileFormatted}${lineRef})`;
    
    if (verbose && result.context) {
        return `${severityFormatted} ${result.ruleId}: ${result.message} ${location}\n    Context: ${result.context}`;
    }
    
    return `${severityFormatted} ${result.ruleId}: ${result.message} ${location}`;
};

const groupResultsByFile = (results: ValidationResult[]): Record<string, ValidationResult[]> =>
    results.reduce((groups, result) => {
        const filePath = result.filePath || 'unknown';
        return {
            ...groups,
            [filePath]: [...(groups[filePath] || []), result]
        };
    }, {} as Record<string, ValidationResult[]>);

const createSummary = (results: ValidationResult[]): SummaryStats => {
    const fileSet = new Set(results.map(r => r.filePath || 'unknown'));
    
    const categoryCounts = results.reduce((counts, result) => ({
        ...counts,
        [result.category]: (counts[result.category] || 0) + 1
    }), {} as Record<string, number>);
    
    return {
        totalResults: results.length,
        errorCount: results.filter(r => r.severity === 'ERROR').length,
        warningCount: results.filter(r => r.severity === 'WARNING').length,
        infoCount: results.filter(r => r.severity === 'INFO').length,
        fileCount: fileSet.size,
        categoryCounts
    };
};

const formatSummary = (stats: SummaryStats, options: FormatOptions): string => {
    const { colors = true } = options;
    const { totalResults, errorCount, warningCount, infoCount, fileCount } = stats;
    
    if (totalResults === 0) {
        const successMessage = '✓ No security issues found';
        return applyColor(successMessage, '\x1b[32m', colors);
    }
    
    const errorText = errorCount > 0 
        ? applySeverityColor(`${errorCount} errors`, 'ERROR', colors)
        : '';
    
    const warningText = warningCount > 0
        ? applySeverityColor(`${warningCount} warnings`, 'WARNING', colors)
        : '';
    
    const infoText = infoCount > 0
        ? applySeverityColor(`${infoCount} info`, 'INFO', colors)
        : '';
    
    const parts = [errorText, warningText, infoText].filter(Boolean);
    const summary = parts.join(', ');
    
    return `Found ${summary} across ${fileCount} file${fileCount !== 1 ? 's' : ''}`;
};

const formatAsText = (report: ValidationReport, options: FormatOptions): string => {
    const verbose = options.format === 'verbose';
    const { results } = report;
    
    if (results.length === 0) {
        const summary = formatSummary(createSummary(results), options);
        if (verbose) {
            // For clean files in verbose mode, show the file information
            if (report.filePaths && report.filePaths.length === 1) {
                const filePath = report.filePaths[0];
                const fileHeader = `File: ${formatFilePath(filePath, options.colors)}`;
                return `Validation Summary\n${fileHeader}\n${summary}`;
            }
            return `Validation Summary\n${summary}`;
        }
        return summary;
    }
    
    const grouped = groupResultsByFile(results);
    const sections: string[] = [];
    
    if (verbose) {
        sections.push('Validation Summary');
    }
    
    Object.entries(grouped).forEach(([filePath, fileResults]) => {
        const fileHeader = verbose ? `File: ${formatFilePath(filePath, options.colors)}` : formatFilePath(filePath, options.colors);
        const resultLines = fileResults.map(result =>
            `  ${formatValidationResult(result, options)}`
        );
        sections.push(`${fileHeader}\n${resultLines.join('\n')}`);
    });
    
    const summary = formatSummary(createSummary(results), options);
    const separator = '\n' + '─'.repeat(60) + '\n';
    
    return sections.join('\n\n') + separator + summary;
};

const formatAsJson = (report: ValidationReport, options: FormatOptions): string => {
    const verbose = options.format === 'verbose';
    const stats = createSummary(report.results);
    
    // For single file validation, include filePath at top level for backward compatibility
    const filePaths = [...new Set(report.results.map(r => r.filePath).filter(Boolean))];
    
    // For clean files with no issues, use the original file paths from the report
    const singleFilePath = filePaths.length === 1
        ? filePaths[0]
        : (report.filePaths && report.filePaths.length === 1 ? report.filePaths[0] : undefined);
    
    const output = {
        ...(singleFilePath && { filePath: singleFilePath }),
        issues: report.results.map(result => {
            const base = {
                ruleId: result.ruleId,
                severity: result.severity,
                category: result.category,
                message: result.message,
                filePath: result.filePath,
                ...(result.line && { line: result.line })
            };
            
            return verbose && result.context
                ? { ...base, context: result.context }
                : base;
        }),
        summary: {
            totalResults: stats.totalResults,
            errorCount: stats.errorCount,
            warningCount: stats.warningCount,
            infoCount: stats.infoCount,
            fileCount: stats.fileCount,
            categoryCounts: stats.categoryCounts
        },
        ...(verbose && {
            metadata: {
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || 'unknown'
            }
        })
    };
    
    return JSON.stringify(output, null, 2);
};

export const formatValidationReport = (
    report: ValidationReport,
    format: 'json' | 'text' = 'text',
    options: FormatOptions = { format: 'text', colors: true }
): string => {
    const defaultOptions = { colors: true, verbose: false, ...options };
    
    return format === 'json'
        ? formatAsJson(report, defaultOptions)
        : formatAsText(report, defaultOptions);
};

export const createValidationSummary = (results: ValidationResult[]): SummaryStats =>
    createSummary(results);

export const shouldUseColors = (format: string): boolean =>
    format === 'text' && process.stdout.isTTY && process.env.NO_COLOR !== '1';

const calculateRiskScore = (results: ValidationResult[]): number => {
    if (results.length === 0) return 0;
    
    const severityWeights = { ERROR: 10, WARNING: 5, INFO: 1 };
    const categoryMultipliers: Record<ValidationCategory, number> = { SECURITY: 2, DEPENDENCY: 1.5, SYNTAX: 1, PERFORMANCE: 1.2, WARNING: 0.5 };
    
    return results.reduce((score, result) => {
        const severityWeight = severityWeights[result.severity] || 1;
        const categoryMultiplier = categoryMultipliers[result.category] || 1;
        return score + (severityWeight * categoryMultiplier);
    }, 0);
};

const determineRiskLevel = (score: number): RiskLevel => {
    if (score === 0) return 'CLEAN';
    if (score <= 10) return 'LOW';
    if (score <= 25) return 'MEDIUM';
    if (score <= 50) return 'HIGH';
    return 'CRITICAL';
};

const createSecurityAssessment = (results: ValidationResult[]): SecurityAssessment => {
    const riskScore = calculateRiskScore(results);
    const riskLevel = determineRiskLevel(riskScore);
    
    const securityIssues = results.filter(r => r.category === 'SECURITY');
    const criticalIssues = results.filter(r => r.severity === 'ERROR');
    
    let complianceStatus = 'COMPLIANT';
    if (criticalIssues.length > 0) {
        complianceStatus = 'NON_COMPLIANT';
    } else if (securityIssues.length > 0) {
        complianceStatus = 'REVIEW_REQUIRED';
    }
    
    return { riskLevel, riskScore, complianceStatus };
};

const getTopIssues = (results: ValidationResult[], limit = 5): ValidationResult[] =>
    results
        .sort((a, b) => {
            const severityOrder = { ERROR: 3, WARNING: 2, INFO: 1 };
            const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
            if (severityDiff !== 0) return severityDiff;
            
            const categoryOrder: Record<ValidationCategory, number> = { SECURITY: 4, DEPENDENCY: 3, PERFORMANCE: 2, SYNTAX: 1, WARNING: 0 };
            return (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0);
        })
        .slice(0, limit);

const generateRecommendations = (results: ValidationResult[]): string[] => {
    const recommendations: string[] = [];
    const categories = new Set(results.map(r => r.category));
    const severities = new Set(results.map(r => r.severity));
    
    if (severities.has('ERROR')) {
        recommendations.push('Address all ERROR-level issues immediately as they pose security risks');
    }
    
    if (categories.has('SECURITY')) {
        recommendations.push('Review security issues thoroughly and implement appropriate safeguards');
    }
    
    if (categories.has('DEPENDENCY')) {
        recommendations.push('Validate all include paths and check for circular dependencies');
    }
    
    if (categories.has('PERFORMANCE')) {
        recommendations.push('Optimize template structure to prevent resource exhaustion');
    }
    
    if (results.length > 10) {
        recommendations.push('Consider implementing validation rules to prevent similar issues');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('No issues detected. Maintain current security practices');
    }
    
    return recommendations;
};

const createDetailedSummary = (
    results: ValidationResult[],
    processingTime?: number
): DetailedSummary => {
    const securityAssessment = createSecurityAssessment(results);
    const topIssues = getTopIssues(results);
    const recommendations = generateRecommendations(results);
    
    const performanceMetrics: PerformanceMetrics = {
        processingTime: processingTime || 0,
        filesPerSecond: processingTime ? Math.round(1 / (processingTime / 1000)) : 0,
        totalFiles: new Set(results.map(r => r.filePath)).size,
        totalIssues: results.length
    };
    
    return {
        securityAssessment,
        topIssues,
        recommendations,
        performanceMetrics
    };
};

const formatDetailedSummaryAsText = (summary: DetailedSummary, options: FormatOptions): string => {
    const { colors = true } = options;
    const sections: string[] = [];
    
    sections.push('SECURITY ASSESSMENT');
    sections.push(`Risk Level: ${applyColor(summary.securityAssessment.riskLevel, BOLD, colors)}`);
    sections.push(`Risk Score: ${summary.securityAssessment.riskScore}`);
    sections.push(`Compliance: ${summary.securityAssessment.complianceStatus}`);
    sections.push('');
    
    if (summary.topIssues.length > 0) {
        sections.push('TOP ISSUES');
        summary.topIssues.forEach((issue, index) => {
            const severity = formatSeverityLevel(issue.severity, colors);
            sections.push(`${index + 1}. ${severity} ${issue.message} (${issue.filePath || 'unknown'})`);
        });
        sections.push('');
    }
    
    sections.push('RECOMMENDATIONS');
    summary.recommendations.forEach((rec, index) => {
        sections.push(`${index + 1}. ${rec}`);
    });
    sections.push('');
    
    sections.push('PERFORMANCE METRICS');
    sections.push(`Processing Time: ${summary.performanceMetrics.processingTime}ms`);
    sections.push(`Files Processed: ${summary.performanceMetrics.totalFiles}`);
    sections.push(`Total Issues: ${summary.performanceMetrics.totalIssues}`);
    
    return sections.join('\n');
};

const formatDetailedSummaryAsJson = (summary: DetailedSummary): object => ({
    securityAssessment: summary.securityAssessment,
    topIssues: summary.topIssues.map(issue => ({
        ruleId: issue.ruleId,
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
        filePath: issue.filePath,
        line: issue.line
    })),
    recommendations: summary.recommendations,
    performanceMetrics: summary.performanceMetrics
});

export const createDetailedValidationSummary = createDetailedSummary;

export const formatDetailedValidationReport = (
    report: ValidationReport,
    format: 'json' | 'text' = 'text',
    options: FormatOptions
): string => {
    const detailedSummary = createDetailedSummary(report.results, report.executionTime);
    
    if (format === 'json') {
        const baseReport = JSON.parse(formatValidationReport(report, format, options));
        return JSON.stringify({
            ...baseReport,
            detailedSummary: formatDetailedSummaryAsJson(detailedSummary)
        }, null, 2);
    } else {
        const baseReport = formatValidationReport(report, format, options);
        const detailedText = formatDetailedSummaryAsText(detailedSummary, options);
        const separator = '\n' + '='.repeat(60) + '\n';
        return baseReport + separator + detailedText;
    }
};