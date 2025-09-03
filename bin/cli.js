#!/usr/bin/env node
import ComponentScaffold from './../lib/scaffold.js';

const [, , ...args] = process.argv;

new ComponentScaffold(args);
// scaffold();