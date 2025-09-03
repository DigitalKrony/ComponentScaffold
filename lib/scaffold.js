/**
 *
 */
import { existsSync, mkdirSync, readFileSync, writeFile } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { globSync } from 'glob';
import { load } from 'js-yaml';
import { getNode, caseGroup } from './scaffold.utils.js';
import { Case } from './scaffold.types.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default class ComponentScaffold {
    constructor(args) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "listGroup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const groupList = [];
                for (const i in this.config) {
                    const fn = this.config[i].friendlyName;
                    groupList.push(fn);
                }
                return groupList;
            }
        });
        Object.defineProperty(this, "_acquireTheConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const possibleConfigs = globSync([`${__dirname}/scaffold.config.json`, `${__dirname}/scaffold.config.yaml`]);
                for (const config of possibleConfigs) {
                    const src = resolve(config);
                    const ext = extname(src);
                    if (ext === '.yaml') {
                        const yamlFile = load(readFileSync(src, 'utf8').toString());
                        return yamlFile;
                    }
                    const jsonFile = readFileSync(src, 'utf8').toString();
                    return (JSON.parse(jsonFile));
                }
            }
        });
        Object.defineProperty(this, "_askQuestions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                console.log(this.queue);
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
            }
        });
        Object.defineProperty(this, "_buildQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                const newQueue = this.queue;
                for (const queue in this.queue) {
                    const thisQ = this.queue[queue];
                    if (thisQ.function) {
                        thisQ.choices = eval(thisQ.function);
                    }
                    this.queue = newQueue;
                }
            }
        });
        Object.defineProperty(this, "_parseStructure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (json, root) => {
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
                            }
                            else {
                                nameConcat = nameConcat + this._replaceTokens(thisObj.name);
                            }
                            if (thisObj.content == null || thisObj.content == false) {
                                thisObj.content = '';
                            }
                            else if (typeof thisObj.content == 'object' && !!thisObj.content.src) {
                                thisObj.content = readFileSync(`${thisObj.content.src}`, 'utf8');
                            }
                            if (thisObj.suffix) {
                                nameConcat = nameConcat + thisObj.suffix;
                            }
                            if (!existsSync(root)) {
                                mkdirSync(`${root}`, {
                                    recursive: true
                                });
                            }
                            writeFile(`${root}/${nameConcat}.${thisObj.extension}`.trim(), this._replaceTokens(thisObj.content), err => {
                                if (err) {
                                    console.log(chalk.red(`${err}`));
                                }
                            });
                            break;
                        case 'folder':
                            if (thisObj.content) {
                                this._parseStructure(thisObj.content, `${root}/${thisObj.name}`);
                            }
                            break;
                    }
                }
            }
        });
        Object.defineProperty(this, "_replaceTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (content) => {
                for (const opt in this.options) {
                    const option = this.options[opt];
                    if (typeof option === 'object') {
                        for (const o in option) {
                            content = content.replace(new RegExp(`%${opt}.${o}%`, 'gi'), option[o]);
                        }
                    }
                    else {
                        content = content.replace(new RegExp(`%${opt}%`, 'gi'), option);
                    }
                }
                return content;
            }
        });
        Object.defineProperty(this, "_startTask", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.options.name = caseGroup(this.options.name);
                const fileDirectory = resolve(`${this.options.dest}/${this.options.name[this.options.nameCase ? this.options.nameCase : Case.Pascal]}`);
                if (!existsSync(fileDirectory)) {
                    this._parseStructure(this.options.structure, fileDirectory);
                    console.log(chalk.green(`Your new ${this.options.group}, ${this.options.name.pascal}, has been created.`));
                }
                else {
                    console.log(chalk.red(`The new ${this.options.group.toUpperCase()}, ${this.options.name.pascal}, you are trying to create is not UNIQUE within ${this.options.group.toUpperCase()}.`));
                }
            }
        });
        const {} = args;
        this.config = this._acquireTheConfig();
        this.queue = JSON.parse(readFileSync(`${__dirname}/inquire.queue.json`, 'utf8'));
        this._buildQueue();
        this._askQuestions();
    }
}
//# sourceMappingURL=scaffold.js.map