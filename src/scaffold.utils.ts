import { Case } from './scaffold.types.js';

export const getNode = function (data: any[], value: any, node: any) {
  for (let x in data) {
    if (data[x][node] === value) {
      return data[x];
    }
  }

  return;
};

export const uncase = (string: string) => {
  let toReturn = string.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[\-\_](\w)/g, ` $1`);
  // toReturn = toReturn;
  return toReturn.toLowerCase().trim();
}
// TODO: Create pre function that "uncases" the string to a standard format before applying case
export const createCase = (string: string, type: Case) => {
  switch (type) {
    case Case.Snake:
      return string.toLowerCase().replace(/[\s\.\-]/g, '_');
    case Case.Kebab:
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

export const caseGroup = (string: string) => {
  return {
    snake: createCase(string, Case.Snake),
    kebab: createCase(string, Case.Kebab),
    camel: createCase(string, Case.Camel),
    pascal: createCase(string, Case.Pascal),
    original: string
  };
};
