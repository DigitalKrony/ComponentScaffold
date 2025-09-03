import { Case } from './scaffold.types.js';
export const getNode = function (data, value, node) {
    for (let x in data) {
        if (data[x][node] === value) {
            return data[x];
        }
    }
    return;
};
export const createCase = function (string, type) {
    switch (type) {
        case Case.Snake:
            return string.toLowerCase().replace(/[\s\.\-]/g, '_');
        case Case.Hyphen:
            return string.toLowerCase().replace(/[\s\.\_]/g, '-');
        case Case.Camel:
            let toReturn = string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function (data) {
                return data
                    .replace(/[(\-|\.|\_)]/g, '')
                    .trim()
                    .toUpperCase();
            });
            return toReturn.charAt(0).toLowerCase() + toReturn.slice(1);
        case Case.Pascal:
            return string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function (data) {
                return data
                    .replace(/[(\-|\.|\_)]/g, '')
                    .trim()
                    .toUpperCase();
            });
        case Case.Uppercase:
            return string.toUpperCase();
        case Case.Lowercase:
        default:
            return string.toLowerCase().replace(/[\_\.\-]/g, ' ');
    }
};
export const caseGroup = function (string) {
    return {
        snake: createCase(string, Case.Snake),
        hyphen: createCase(string, Case.Hyphen),
        camel: createCase(string, Case.Camel),
        pascal: createCase(string, Case.Pascal),
        original: string
    };
};
//# sourceMappingURL=scaffold.utils.js.map