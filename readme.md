# Component Scaffold

<!-- [![version](https://img.shields.io/badge/dynamic/json?color=blue&label=Version&query=version&url=https%3A%2F%2Fdev.azure.com%2FDesignFunedikly%2FOpenSource%2F_apis%2FsourceProviders%2FTfsGit%2Ffilecontents%3Frepository%3DComponentScaffold%26path%3Dpackage.json%26commitOrBranch%3Dmaster%26api-version%3D5.1-preview.1)] (https://dev.azure.com/DesignFunedikly/OpenSource/_git/ComponentScaffold?path=%2Fpackage.json) -->

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier) [![license](https://img.shields.io/badge/license-MIT-blue?style=flat)](https://dev.azure.com/DesignFunedikly/OpenSource/_git/ComponentScaffold?path=%2Flicenses.md) [![Known Vulnerabilities](https://snyk.io/test/npm/component_scaffold/badge.svg?style=flat)](https://snyk.io/test/npm/component_scaffold)

## Installation

Using npm:

    npm i -g component_scaffold

Running the CLI:

    scaffold

## Configuration

### scaffold.config.[json|yaml]

- **dest**: _string_ = Target parent destination for the files being built.
- **friendlyName**: _string_ = Name that appears in the command line when running the `scaffold` command.
- **structure**: _array[structure]_ = The files and folders object array

### structure _<array[structure]>_

- **type**: _string_ = `file` or `folder`
- **name**: _string_ = By default, the name of the `file`/`folder` is the string input into the command line while running the `scaffold` CLI. However, this will override that name to one of your choosing.
- **prefix**: _string_ = This string will become part of the `file` name at the beginning of the final string regardless if a name is specified or if it's left to the default name.
- **suffix**: _string_ = This string will become part of the `file` name at the end of the final string regardless if a name is specified or if it's left to the default name.
- **extension**: _string_ = This is the desired extension of the `file`.
- **content**: _string_ | _{ src: string }_
  - _string_: If the `content` is a `string` it will fill the `file` with that string.
  - *{ src: *string* }*: If the `content` is an object with a node of `src`, the CLI will read a template file at location and utilize it's content to fill the `file` being created.

### Template file string replacement

When the `content` of a `file` is being filled by a template file, it's utilizes a simple string replacement for some of the options decided throughout the CLI process. These strings will be inclosed in `%` to indicate the beginning and the end of the desired replacement command. These options consist of the options input into the `structure` for the `file`. The only instance when the option will not be replaced as input is the `name`. The name has a `case` selection. These cases are:

- snake
- hyphen
- camel
- pascal
- uppercase
- lowercase

As an example on how to do the above:

    export default class %name.pascal% extends React.Component<%name.pascal%Props, %name.pascal%States>

The above resolved into:

    export default class YourNewComponent extends React.Component<YourNewComponentProps,YourNewComponentStates>
