export type DirectiveType = 'include' | 'var' | 'if';

export type IncludeDirective = {
    type: 'include';
    path: string;
};

export type VarDirective = {
    type: 'var';
    name: string;
    value: unknown;
};

export type IfDirective = {
    type: 'if';
    condition: unknown;
};

export type Directive = IncludeDirective | VarDirective | IfDirective;