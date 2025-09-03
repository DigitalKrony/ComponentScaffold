export declare enum Case {
    Snake = "snake",
    Hyphen = "hyphen",
    Camel = "camel",
    Pascal = "pascal",
    Uppercase = "uppercase",
    Lowercase = "lowercase"
}
export interface ScaffoldConfig {
    dest: string;
    nameCase: Case;
}
export interface ComponentScaffoldProps {
    complete?: boolean;
    config?: ScaffoldConfig;
}
//# sourceMappingURL=scaffold.types.d.ts.map