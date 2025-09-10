import { Case } from './scaffold.types.js';
export declare const getNode: (data: any[], value: any, node: any) => any;
export declare const uncase: (string: string) => string;
export declare const createCase: (string: string, type: Case) => string;
export declare const caseGroup: (string: string) => {
    snake: string;
    kebab: string;
    camel: string;
    pascal: string;
    original: string;
};
//# sourceMappingURL=scaffold.utils.d.ts.map