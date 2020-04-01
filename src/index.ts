/**
 *
 */

import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import glob from 'glob';
import path from 'path';
import yaml from 'js-yaml';

declare var module: any;
declare var __dirname;

export interface ComponentScaffoldProps {}

export default class ComponentScaffold<ComponentScaffoldProps> {
  private config: { [key: string]: string }[];
  private queue: any;
  private options: any = {};

  constructor(args: ComponentScaffoldProps) {
    this.config = this._acquireTheConfig();
    this.queue = JSON.parse(fs.readFileSync(`${__dirname}/inquire.queue.json`, 'utf8'));

    this._buildQueue();
    this._askQuestions();
  }

  public listGroup = () => {
    const groupList: string[] = [];

    for (const i in this.config) {
      const fn = (this.config[i] as any).friendlyName;
      groupList.push(fn);
    }

    return groupList;
  };

  private _acquireTheConfig = () => {
    let currentConfig;
    const possibleConfigs = glob.sync(`./scaffold.config.*`);

    for (const config of possibleConfigs) {
      const src = path.resolve(config);
      const ext = path.extname(src);

      if (ext === '.yaml') {
        const yamlFile = yaml.safeLoad(fs.readFileSync(src).toString());
        return yamlFile;
      }

      const jsonFile = fs.readFileSync(`${__dirname}/scaffold.config.json`).toString();
      return (currentConfig = JSON.parse(jsonFile));
    }
  };

  private _askQuestions = () => {
    inquirer.prompt(this.queue).then(data => {
      const keys = Object.keys(data);

      for (var i = 0; i < keys.length; i++) {
        const thisResponse = data[keys[i]];
        this.options[keys[i]] = thisResponse;
      }

      this.options = {
        ...this.options,
        ...getNode(this.config, this.options.group, 'friendlyName')
      };

      this._startTask();
    });
  };

  private _buildQueue = () => {
    const newQueue = this.queue;

    for (const queue in this.queue) {
      const thisQ = this.queue[queue];

      if (thisQ.function) {
        thisQ.choices = eval(thisQ.function);
      }

      this.queue = newQueue;
    }
  };

  private _parseStructure = (json: any, root: any) => {
    for (var i = 0; i < json.length; i++) {
      const thisObj = json[i];

      switch (thisObj.type) {
        case 'file':
          var nameConcat = '';
          if (thisObj.prefix) {
            nameConcat = thisObj.prefix;
          }

          if (!thisObj.name) {
            nameConcat =
              nameConcat + this.options.name[this.options.nameCase ? this.options.nameCase : 'pascal'];
          } else {
            nameConcat = nameConcat + this._replaceTokens(thisObj.name);
          }

          if (thisObj.content == null || thisObj.content == false) {
            thisObj.content = '';
          } else if (typeof thisObj.content == 'object' && !!thisObj.content.src) {
            thisObj.content = fs.readFileSync(`${thisObj.content.src}`, 'utf8');
          }

          if (thisObj.suffix) {
            nameConcat = nameConcat + thisObj.suffix;
          }

          if (!fs.existsSync(root)) {
            fs.mkdirSync(`${root}`, {
              recursive: true
            });
          }

          fs.writeFile(
            `${root}/${nameConcat}.${thisObj.extension}`.trim(),
            this._replaceTokens(thisObj.content),
            err => {
              if (err) {
                console.log(chalk.red(`${err}`));
              }
            }
          );

          break;
        case 'folder':
          if (thisObj.content) {
            this._parseStructure(thisObj.content, `${root}/${thisObj.name}`);
          }
          break;
      }
    }
  };

  private _replaceTokens = (content: any) => {
    for (const opt in this.options) {
      const option = this.options[opt];
      if (typeof option === 'object') {
        for (const o in option) {
          content = content.replace(new RegExp(`%${opt}.${o}%`, 'gi'), option[o]);
        }
      } else {
        content = content.replace(new RegExp(`%${opt}%`, 'gi'), option);
      }
    }
    return content;
  };

  private _startTask = () => {
    this.options.name = caseGroup(this.options.name);
    const fileDirectory = path.resolve(
      `${this.options.dest}/${this.options.name[this.options.nameCase ? this.options.nameCase : 'pascal']}`
    );

    if (!fs.existsSync(fileDirectory)) {
      this._parseStructure(this.options.structure, fileDirectory);
      console.log(
        chalk.green(`Your new ${this.options.group}, ${this.options.name.pascal}, has been created.`)
      );
    } else {
      console.log(
        chalk.red(
          `The new ${this.options.group.toUpperCase()}, ${
            this.options.name.pascal
          }, you are trying to create is not UNIQUE within ${this.options.group.toUpperCase()}.`
        )
      );
    }
  };
}

module.exports = ComponentScaffold;

const getNode = function(data, value, node) {
  for (let x in data) {
    if (data[x][node] === value) {
      return data[x];
    }
  }

  return;
};

const createCase = function(string, type) {
  switch (type) {
    case 'snake':
      return string.toLowerCase().replace(/[\s\.\-]/g, '_');
    case 'hyphen':
      return string.toLowerCase().replace(/[\s\.\_]/g, '-');
    case 'camel':
      let toReturn = string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function(data) {
        return data
          .replace(/[(\-|\.|\_)]/g, '')
          .trim()
          .toUpperCase();
      });
      return toReturn.charAt(0).toLowerCase() + toReturn.slice(1);
    case 'pascal':
      return string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function(data) {
        return data
          .replace(/[(\-|\.|\_)]/g, '')
          .trim()
          .toUpperCase();
      });
    case 'uppercase':
      return string.toUpperCase();
    case 'lowercase':
    default:
      return string.toLowerCase().replace(/[\_\.\-]/g, ' ');
  }
};

const caseGroup = function(string) {
  return {
    snake: createCase(string, 'snake'),
    hyphen: createCase(string, 'hyphen'),
    camel: createCase(string, 'camel'),
    pascal: createCase(string, 'pascal'),
    original: string
  };
};
