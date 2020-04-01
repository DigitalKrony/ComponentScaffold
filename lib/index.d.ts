export interface ComponentScaffoldProps {
}
export default class ComponentScaffold<ComponentScaffoldProps> {
    private config;
    private queue;
    private options;
    constructor(args: ComponentScaffoldProps);
    listGroup: () => string[];
    private _acquireTheConfig;
    private _askQuestions;
    private _buildQueue;
    private _parseStructure;
    private _replaceTokens;
    private _startTask;
}
//# sourceMappingURL=index.d.ts.map