module.exports = {
    env: {
        es2022: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "prettier"
    ],
    rules: {
        "prefer-const": "error",
        "no-var": "error",
        "no-console": "warn"
    },
    ignorePatterns: ["dist", "node_modules", "build"],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            },
            plugins: ["@typescript-eslint"],
            extends: [
                "eslint:recommended",
                "prettier"
            ],
            rules: {
                // TypeScript-specific rules (without preset)
                "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
                "@typescript-eslint/explicit-function-return-type": "off",
                "@typescript-eslint/explicit-module-boundary-types": "off",
                "@typescript-eslint/no-explicit-any": "warn",
                "@typescript-eslint/no-var-requires": "error",
                "@typescript-eslint/no-inferrable-types": "error",
                "@typescript-eslint/ban-ts-comment": "warn",
                
                // General rules
                "prefer-const": "error",
                "no-var": "error",
                "no-console": "warn",
                "no-unused-vars": "off" // Turn off base rule as it conflicts with @typescript-eslint/no-unused-vars
            }
        },
        {
            files: ["*.test.ts", "*.test.tsx", "**/__tests__/**/*"],
            rules: {
                "@typescript-eslint/no-explicit-any": "off"
            }
        }
    ]
};