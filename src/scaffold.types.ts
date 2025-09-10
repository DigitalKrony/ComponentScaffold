export enum Case {
  Snake = 'snake',
  Kebab = 'kebab',
  Camel = 'camel',
  Pascal = 'pascal',
  Uppercase = 'uppercase',
  Lowercase = 'lowercase'
}

export enum ActionType {
  Create = 'create',
  Extend = 'extend'
}

export interface ScaffoldConfig {
  dest: string;
  nameCase: Case
}

export interface ComponentScaffoldProps {
  complete?: boolean;
  config?: ScaffoldConfig;
}

export interface ScaffoldStructure {
  type: 'file' | 'folder';
  name?: string;
  prefix?: string;
  suffix?: string;
  content?: string | { src: string } | ScaffoldStructure[];
}

export interface ExtendProps {
  dir: string;
  friendlyName: string;
  caseName?: Case;
  structure: ScaffoldStructure[];
}

export interface CreateProps {
  dest: string;
  friendlyName: string;
  caseName?: Case;
  structure: ScaffoldStructure[];
}

export type ScaffoldConfigSchema = {
  [K in ActionType]?: K extends ActionType.Create
  ? CreateProps[]
  : K extends ActionType.Extend
  ? ExtendProps[]
  : never;
}