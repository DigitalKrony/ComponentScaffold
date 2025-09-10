/**
 *
 */
export default class ComponentScaffold<ComponentScaffoldProps> {
    private config;
    private queue;
    private options;
    private action;
    constructor(args: ComponentScaffoldProps);
    listGroup: () => string[];
    listFeatures: () => string[] | undefined;
    listExtensions: () => string[] | undefined;
    private _acquireTheConfig;
    private _setAction;
    private _askQuestions;
    private _buildQueue;
    private _parseStructure;
    private _replaceTokens;
    private _startCreateTask;
    private _startExtendTask;
}
//# sourceMappingURL=scaffold.d.ts.map