# Component Scaffold

[![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FDigitalKrony%2FComponentScaffold%2Frefs%2Fheads%2Fmaster%2Fpackage.json&query=version&label=Version)](https://www.npmjs.com/package/component_scaffold) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier) [![license](https://img.shields.io/badge/license-MIT-blue?style=flat)](https://github.com/DigitalKrony/ComponentScaffold/blob/master/licenses.md) [![Known Vulnerabilities](https://snyk.io/advisor/npm-package/component_scaffold/badge.svg)](https://snyk.io/advisor/npm-package/component_scaffold)

## Installation

Install:
``` shell
npm i -g component_scaffold

yarn global add component_scaffold
```

Running the CLI:
``` shell
scaffold
```

## Configuration

### scaffold.config.\[json|yml|yaml\]

To keep the scffold cmd simple, you can create a top level array of objects that note just what's to be created. Those objects will consist of the "Cerate Feature" options below

However, if you'd like the ability to also extend features that have already been created, your top level object will require the two elements listed below.

- **extend**: _ExtendProps\[\]_
- **create**: _CreateProps\[\]_

#### Extend Feature _\<ExtendProps\>_

- **dir**: _string_ = Directory that holds the features to which the below structure will add to.
- **friendlyName**: _string_ = Name that appears in the command line when running the `scaffold` command.
- **structure**: _array\[structure\]_ = The files and folders object array

#### Create Feature: _\<CreateProps\>_

- **dest**: _string_ = Target parent destination for the files being built.
- **friendlyName**: _string_ = Name that appears in the command line when running the `scaffold` command.
- **structure**: _ScaffoldStructure\[\]_ = The files and folders object array
- **caseName**: _Case_ = An optional setting to determin the default name(s) of the files created. This defaults to `pascal`

### structure _\<ScaffoldStructure\[\]\>_

- **type**: _string_ = `file` or `folder`
- **name**: _string_ = By default, the name of the `file`/`folder` is the string input into the command line while running the `scaffold` CLI. However, this will override that name to one of your choosing.
- **prefix**: _string_ = This string will become part of the `file` name at the beginning of the final string regardless if a name is specified or if it's left to the default name.
- **suffix**: _string_ = This string will become part of the `file` name at the end of the final string regardless if a name is specified or if it's left to the default name.
- **extension**: _string_ = This is the desired extension of the `file`.
- **content**: _string_ | **{ src: _string_ }** | **ScaffoldStructure\[\]**
  - _string_: If the `content` is a `string` it will fill the `file` with that string.
  - **{ src: _string_ }**: If the `content` is an object with a node of `src`, the CLI will read a template file at location and utilize it's content to fill the `file` being created.
  - ScaffoldStructure\[\]: If the type is listed as a folder, the `content` is then set to read a nested array of the same time as the parent.

### Template file string replacement

When the `content` of a `file` is being filled by a template file, it's utilizes a simple string replacement for some of the options decided throughout the CLI process. These strings will be inclosed in `%` to indicate the beginning and the end of the desired replacement command. These options consist of the options input into the `structure` for the `file`. The only instance when the option will not be replaced as input is the `name`. The name has a `case` selection. These cases are:

### Case Enum _\<Case\>_
- snake
- kabab
- camel
- pascal
- uppercase
- lowercase

As an example on how to do the above:

    export default class %name.pascal% extends React.Component<%name.pascal%Props, %name.pascal%States>

The above resolved into:

    export default class YourNewComponent extends React.Component<YourNewComponentProps,YourNewComponentStates>
