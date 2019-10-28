# Component Scaffold

## Installation

Using npm:

    $ npm i -g component_scaffold

Running the CLI:

    $ scaffold

## Configuration

### scaffold.config.json

- **dest**: *string* = Target parent destination for the files being built.
- **friendlyName**: *string* = Name that appears in the command line when running the `scaffold` command.
- **structure**: *array[structure]* = The files and folders object array

### structure *<array[structure]>*

- **type**: *string* = `file` or `folder`
- **name**: *string* = By default, the name of the `file`/`folder` is the string input into the command line while running the `scaffold` CLI. However, this will override that name to one of your choosing.
- **prefix**: *string* = This string will become part of the `file` name at the beginning of the final string regardless if a name is specified or if it's left to the default name.
- **suffix**: *string* = This string will become part of the `file` name at the end of the final string regardless if a name is specified or if it's left to the default name.
- **extension**: *string* = This is the desired extension of the `file`.
- **content**: *string* | *{ src: string }*
  - *string*: If the `content` is a `string` it will fill the `file` with that string.
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
