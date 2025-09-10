/**
 *
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFile } from 'node:fs';
import path, { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { globSync } from 'glob';
import { load } from 'js-yaml';

import { caseGroup, uncase } from './scaffold.utils.js';
import { ActionType, Case, CreateProps, ScaffoldConfigSchema } from './scaffold.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const commandDir = process.cwd();

export default class ComponentScaffold<ComponentScaffoldProps> {
  private config: ScaffoldConfigSchema | CreateProps[] | any;
  private queue: any;
  private options: any;
  private action: ActionType;

  constructor(args: ComponentScaffoldProps) {
    const { } = args;

    this.config = this._acquireTheConfig();
    this.queue = JSON.parse(readFileSync(`${__dirname}/inquire.queue.json`, 'utf8'));
    this.action = ActionType.Create;

    if (this.config.extend !== undefined && this.config.create !== undefined) {
      // TODO: Notes an v0.8.*+ instance and calls functions differently
      this._setAction();
    } else {
      // TODO: Array "create" only implementation, skips "action" step
      this._buildQueue(this.queue.create);
      this._askQuestions();
    }

    /*
      // Graceful exit handling
      process.on('uncaughtException', (reason, promise) => {
        if (reason instanceof Error && reason.name === 'ExitPromptError') console.log(chalk.yellow('Closed by user.'));
        else console.error(chalk.red(`Uncaught Exception: ${promise}`), '\n', chalk.white(`Reason: ${reason}`));
      });
    */
  }

  public listGroup = () => {
    const { config } = this;
    const groupConfig = config.create !== undefined ? config.create : config;
    const groupList: string[] = [];


    for (const i in groupConfig) {
      const fn = (groupConfig[i] as any).friendlyName;
      groupList.push(fn);
    }

    return groupList;
  };

  public listFeatures = () => {
    const featureList: string[] = [];
    const extendConfig = this.config.extend;

    if (extendConfig === undefined) return;

    extendConfig.forEach((value: any, index: number, array: any[]) => {
      featureList.push((new inquirer.Separator(`-- ${value.friendlyName} --`)) as any);

      try {
        const thePath = path.resolve(`${commandDir}/${value.dir}`);
        console.log(thePath);
        const files = readdirSync(thePath);
        featureList.push(...files);
      } catch (err) {
        console.error(chalk.red(`Error reading features directory "${value.dir}"`));
      }
    });

    return featureList;
  }

  public listExtensions = () => {
    const extensionConfigList: string[] = [];
    const extConfg = this.config.extend;

    if (extConfg === undefined) return;

    extConfg.every((value: any, index: number, array: any[]) => {
      const fn = (extConfg[index] as any).friendlyName;
      extensionConfigList.push(fn);
      return true;
    });

    return extensionConfigList;
  }

  private _acquireTheConfig = () => {
    const possibleConfigs = globSync(`${commandDir}/scaffold.config.+(json|yml|yaml)`);

    for (const config of possibleConfigs) {
      const src = resolve(config);
      const ext = extname(src);

      console.log(chalk.gray(`Using config file: ${src}`));

      let _configFile = null;

      switch (ext) {
        case '.yaml':
          _configFile = (load(readFileSync(src, 'utf8').toString()) as any[]);
          break
        case '.yml':
          _configFile = load(readFileSync(src, 'utf8').toString());
          break;
        case '.json':
        default:
          _configFile = JSON.parse(readFileSync(src, 'utf8').toString());
          break;
      }

      return _configFile;
    }
  };

  private _setAction = () => {
    const actionPrompt = this._buildQueue(this.queue.actions);

    inquirer.prompt(actionPrompt).then(data => {
      const { action } = data;
      this.action = action || this.action;
      this._askQuestions();
    });
  }

  private _askQuestions = () => {
    const questionQueue = this._buildQueue(this.queue[this.action]);
    const config = this.config[this.action] !== undefined ? this.config[this.action] : this.config;

    inquirer.prompt(questionQueue).then(data => {
      config.forEach((value: any, index: number, array: any[]) => {
        if (this.action === ActionType.Create) {
          if (value.friendlyName === data.group) {
            let newOption = {
              ...value,
              ...data,
              name: caseGroup(data.name),
              nameCase: data.nameCase || Case.Pascal
            }

            this.options = newOption;
            this._startCreateTask();
          }
        }
        else if (this.action === ActionType.Extend) {
          if (value.friendlyName === data.extend) {
            let newOption = {
              ...value,
              ...data,
              name: caseGroup(uncase(data.feature)),
              featureName: data.feature,
              nameCase: data.nameCase || Case.Pascal
            };

            this.options = newOption;
            this._startExtendTask();
          }
        }
      });
    });
  };

  // TODO: return object with array and object string when processing the function
  private _buildQueue = (queue: any[]) => {
    const newQueue = queue;

    for (const question in queue) {
      const thisQ = queue[question];

      if (thisQ.function) {
        thisQ.choices = eval(thisQ.function);
      }

    }

    return newQueue
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
              nameConcat + this.options.name[this.options.nameCase ? this.options.nameCase : Case.Pascal];
          } else {
            nameConcat = nameConcat + this._replaceTokens(thisObj.name);
          }

          if (thisObj.content == null || thisObj.content == false) {
            thisObj.content = '';
          } else if (typeof thisObj.content == 'object' && !!thisObj.content.src) {
            thisObj.content = readFileSync(`${thisObj.content.src}`, 'utf8');
          }

          if (thisObj.suffix) {
            nameConcat = nameConcat + thisObj.suffix;
          }

          const fileSrc = `${root}/${nameConcat}.${thisObj.extension}`.trim()

          if (!existsSync(fileSrc)) {
            if (!existsSync(root)) {
              mkdirSync(`${root}`, {
                recursive: true
              });

              writeFile(
                fileSrc,
                this._replaceTokens(thisObj.content),
                err => {
                  if (err) {
                    console.log(chalk.red(`${err}`));
                  }
                }
              )
            }
          } else {
            console.log(chalk.yellow(`Skipping ${fileSrc}`), chalk.yellow(`File already exists.`));
          }
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

  private _startCreateTask = () => {
    const fileDirectory = resolve(
      `${commandDir}/${this.options.dest}/${this.options.name[this.options.nameCase]}`
    );

    console.log(chalk.blue(`Creating new ${this.options.group}, ${this.options.name.pascal}...`));

    if (!existsSync(fileDirectory)) {
      this._parseStructure(this.options.structure, fileDirectory);
      console.log(
        chalk.green(`Your new ${this.options.group}, ${this.options.name.pascal}, has been created.`)
      );
    } else {
      console.log(
        chalk.red(
          `The new ${this.options.group.toUpperCase()}, ${this.options.name.pascal
          }, you are trying to create is not UNIQUE within ${this.options.group.toUpperCase()}.`
        )
      );
    }
  };

  private _startExtendTask = () => {
    const fileDirectory = resolve(
      `${commandDir}/${this.options.dir}/${this.options.featureName}`
    );

    console.log(chalk.blue(`Extending ${this.options.feature} with ${this.options.friendlyName}...`));

    if (!!existsSync(fileDirectory)) {
      this._parseStructure(this.options.structure, fileDirectory);
      console.log(
        chalk.green(`Your ${this.options.feature} has been extended with ${this.options.friendlyName}.`)
      );
    } else {
      console.log(chalk.red(`The directory ${fileDirectory} does not exist.`));
    }
  }
}
