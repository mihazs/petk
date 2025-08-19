import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <header className={clsx('hero', styles.heroBanner)}>
            <div className="container">
                <div className={styles.heroContent}>
                    <Heading as="h1" className={styles.heroTitle}>
                        Transform Markdown Templates into Dynamic Content
                    </Heading>
                    <p className={styles.heroSubtitle}>
                        A powerful toolkit for processing templates with advanced file inclusion capabilities, 
                        perfect for prompt engineering, documentation automation, and content generation workflows.
                    </p>
                    <div className={styles.heroButtons}>
                        <Link
                            className="button button--primary button--lg"
                            to="/docs/learning/getting-started">
                            Get Started
                        </Link>
                        <Link
                            className="button button--secondary button--lg"
                            to="/docs/intro">
                            View Documentation
                        </Link>
                    </div>
                </div>
                <div className={styles.heroCode}>
                    <div className={styles.codeBlock}>
                        <div className={styles.codeHeader}>
                            <span>template.md</span>
                        </div>
                        <pre className={styles.codeContent}>
{`# Project Documentation

{petk:include src="README.md" start="## Installation"}

{petk:include src="docs/*.md" exclude="drafts"}

Generated on: {petk:var date}`}
                        </pre>
                    </div>
                    <div className={styles.arrow}>→</div>
                    <div className={styles.codeBlock}>
                        <div className={styles.codeHeader}>
                            <span>output.md</span>
                        </div>
                        <pre className={styles.codeContent}>
{`# Project Documentation

## Installation

Install using npm, pnpm, or yarn:

\`\`\`bash
npm install -g petk
\`\`\`

## API Reference
...

Generated on: 2024-01-15`}
                        </pre>
                    </div>
                </div>
            </div>
        </header>
    );
}

function WhyPetk() {
    return (
        <section className={styles.whySection}>
            <div className="container">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <Heading as="h2" className={styles.sectionTitle}>
                            Why use Petk?
                        </Heading>
                        <div className={styles.whyContent}>
                            <p>
                                Modern development workflows require efficient content generation and template processing. 
                                Petk bridges the gap between static templates and dynamic content by providing powerful 
                                inclusion directives, variable substitution, and file processing capabilities. Whether 
                                you're building documentation systems, generating prompts for LLMs, or automating content 
                                workflows, Petk streamlines the process.
                            </p>
                            <p>
                                Built with TypeScript and functional programming principles, Petk offers reliable 
                                performance with comprehensive validation, watch mode for development, and seamless 
                                integration into existing build pipelines. The toolkit supports glob patterns, 
                                conditional includes, and advanced file ordering to give you precise control over 
                                content generation.
                            </p>
                            <p>
                                From simple file inclusion to complex template orchestration, Petk provides the tools 
                                you need to build maintainable, scalable content generation systems that grow with 
                                your project requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureList() {
    const features = [
        {
            title: 'Template Processing',
            icon: '📝',
            description: 'Advanced Markdown template processing with powerful inclusion directives, variable substitution, and conditional logic for dynamic content generation.'
        },
        {
            title: 'Watch Mode',
            icon: '👀',
            description: 'Real-time file watching with intelligent rebuilds. Automatically regenerate content when source files change during development.'
        },
        {
            title: 'YAML Conversion',
            icon: '🔄',
            description: 'Convert Markdown documents to structured YAML format with configurable schemas and validation for data-driven workflows.'
        },
        {
            title: 'Validation & Safety',
            icon: '🛡️',
            description: 'Comprehensive validation with circular dependency detection, path traversal protection, and resource limits for safe template processing.'
        }
    ];

    return (
        <section className={styles.featuresSection}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    Key Features
                </Heading>
                <div className="row">
                    {features.map((feature, idx) => (
                        <div key={idx} className="col col--6">
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <div className={styles.featureContent}>
                                    <Heading as="h3" className={styles.featureTitle}>
                                        {feature.title}
                                    </Heading>
                                    <p className={styles.featureDescription}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function InstallationSection() {
    return (
        <section className={styles.installSection}>
            <div className="container">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <Heading as="h2" className={styles.sectionTitle}>
                            Installation
                        </Heading>
                        <div className={styles.installOptions}>
                            <div className={styles.installOption}>
                                <h4>Global Installation</h4>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>npm install -g petk</code>
                                    </pre>
                                </div>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>pnpm add -g petk</code>
                                    </pre>
                                </div>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>yarn global add petk</code>
                                    </pre>
                                </div>
                            </div>
                            <div className={styles.installOption}>
                                <h4>Project Installation</h4>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>npm install petk</code>
                                    </pre>
                                </div>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>pnpm add petk</code>
                                    </pre>
                                </div>
                                <div className={styles.codeBlock}>
                                    <pre className={styles.codeContent}>
                                        <code>yarn add petk</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className={styles.quickStart}>
                            <h4>Quick Start</h4>
                            <div className={styles.codeBlock}>
                                <pre className={styles.codeContent}>
{`# Process a template file
petk build template.md -o output.md

# Watch for changes
petk build template.md -w

# Convert to YAML
petk convert document.md -o data.yaml`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title="Transform Markdown Templates into Dynamic Content"
            description="A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.">
            <HomepageHeader />
            <main>
                <WhyPetk />
                <FeatureList />
                <InstallationSection />
            </main>
        </Layout>
    );
}
