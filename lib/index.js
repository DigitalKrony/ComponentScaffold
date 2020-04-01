'use strict';

// To Require
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const glob = require('glob');
const path = require('path');
const yaml = require('js-yaml');

const createCase = function (string, type) {
  switch (type) {
    case 'snake':
      return string.toLowerCase().replace(/[\s\.\-]/g, '_');
    case 'hyphen':
      return string.toLowerCase().replace(/[\s\.\_]/g, '-');
    case 'camel':
      let toReturn = string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function (data) {
        return data
          .replace(/[(\-|\.|\_)]/g, '')
          .trim()
          .toUpperCase();
      });
      return toReturn.charAt(0).toLowerCase() + toReturn.slice(1);
    case 'pascal':
      return string.replace(/^([A-Z]|[a-z])|[\s\.\-\_](\w)/g, function (data) {
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
}

const caseGroup = function (string) {
  return {
    snake: createCase(string, 'snake'),
    hyphen: createCase(string, 'hyphen'),
    camel: createCase(string, 'camel'),
    pascal: createCase(string, 'pascal'),
    original: string
  };
}

const getNode = function (data, value, node) {
  for (let x in data) {
    if (data[x][node] === value) {
      return data[x];
    }
  }

  return;
}

class ComponentScaffold {
  constructor(args) {
    this.config = this.acquireTheConfig();
    this.queue = JSON.parse(fs.readFileSync(`${__dirname}/inquire.queue.json`, 'utf8'));
    this.options = {};

    this.buildQueue();
    this.askQuestions();
  }

  acquireTheConfig() {
    let currentConfig;
    const possibleConfigs = glob.sync(`./scaffold.config.*`);

    for (const config of possibleConfigs) {
      const src = path.resolve(config);
      const ext = path.extname(src);

      if (ext === '.yaml') {
        currentConfig = yaml.safeLoad(fs.readFileSync(src));
        continue;
      }

      currentConfig = JSON.parse(fs.readFileSync(src));
      continue;
    }

    if (!currentConfig) {
      currentConfig = JSON.parse(fs.readFileSync(`${__dirname}/scaffold.config.json`))
    }

    return currentConfig;
  }

  askQuestions() {
    inquirer.prompt(this.queue)
      .then((data) => {
        let keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
          let thisResponse = data[keys[i]];

          this.options[keys[i]] = thisResponse;
        }

        this.options = {
          ...this.options,
          ...getNode(this.config, this.options.group, 'friendlyName')
        }

        this.startTask();
      });
  }

  listGroup() {
    let groupList = [];

    for (const i in this.config) {
      groupList.push(this.config[i].friendlyName)
    }
    return groupList;
  }

  buildQueue() {
    let newQueue = this.queue;

    for (let queue in this.queue) {
      let thisQ = this.queue[queue];

      if (thisQ.function) {
        thisQ.choices = eval(thisQ.function);
      }
    }

    this.queue = newQueue;
  }

  parseStructure(json, root) {
    for (var i = 0; i < json.length; i++) {
      var thisObj = json[i];

      switch (thisObj.type) {
        case 'file':
          var nameConcat = '';
          if (thisObj.prefix) {
            nameConcat = thisObj.prefix;
          }

          if (!thisObj.name) {
            nameConcat = nameConcat + this.options.name[this.options.nameCase ? this.options.nameCase : 'pascal'];
          } else {
            nameConcat = nameConcat + this.replaceTokens(thisObj.name);
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
            })
          }

          fs.writeFile((`${root}/${nameConcat}.${thisObj.extension}`).trim(), this.replaceTokens(thisObj.content), (err) => {
            if (err) {
              console.log(err);
            }
          });

          break;
        case 'folder':
          if (thisObj.content) {
            this.parseStructure(thisObj.content, `${root}/${thisObj.name}`);
          }

          break;
      }
    }
  }

  replaceTokens(content) {
    for (let opt in this.options) {

      let option = this.options[opt];
      if (typeof option === 'object') {
        for (var o in option) {
          content = content.replace(new RegExp(`%${opt}.${o}%`, 'gi'), option[o]);
        }
      } else {
        content = content.replace(new RegExp(`%${opt}%`, 'gi'), option);
      }
    }
    return content;
  }

  startTask() {
    this.options.name = caseGroup(this.options.name);
    const fileDirectory = path.resolve(`${this.options.dest}/${this.options.name[this.options.nameCase ? this.options.nameCase : 'pascal']}`);


    if (!fs.existsSync(fileDirectory)) {
      this.parseStructure(this.options.structure, fileDirectory);
      console.log(chalk.green(`Your new ${this.options.group}, ${this.options.name.pascal}, has been created.`));
    } else {
      console.log(chalk.red(`The new ${this.options.group.toUpperCase()}, ${this.options.name.pascal}, you are trying to create is not UNIQUE within ${this.options.group.toUpperCase()}.`));
    }
  }
}

module.exports = ComponentScaffold;