# Commonify

Transforms ES module to CommonJS module using regular expression.

```js
import { Transformer } from '/path/to/commonify/index.mjs'

let transform = Transformer()
let result = transform(code)
```

## Supported Syntax

```js
import foo from 'bar'
import 'foo'
import * as foo from 'bar'
import { foo, bar as baz } from 'qux'
import('foo')
import.meta.url
import.meta.resolve('foo')
export let foo = 'bar'
export default 'foo'
export { foo, bar as baz } from 'qux'
export { foo, bar as baz }
export * as foo from 'bar'
export * from 'foo'
```

## Import Spec

```js
import 'foo'
// Output:
require('foo')

import foo from 'bar'
// Output:
const foo = require('bar').default

import * as foo from 'bar'
// Output:
const foo = require('bar')

import { foo, bar as baz } from 'qux'
// Output:
const { foo, bar: baz } = require('qux')

import('foo')
// Output
requireAsync('foo')

import.meta.url
// Output:
module.id

import.meta.resolve('foo')
// Output:
require.resolve('foo')
```

## Export Spec

```js
// Also: let, const, function, class
export var foo = 'bar'
// Output:
var foo = 'bar'
/* EOF */ exports.foo = foo

export default 'foo'
// Output:
exports.default = 'foo'

export { foo, bar as baz } from 'qux'
// Output:
exports.foo = require('qux').foo;
exports.baz = require('qux').bar

export { foo, bar as baz }
// Output:
exports.foo = foo;
exports.baz = bar

export * as foo from 'bar'
// Output:
exports.foo = require('bar')

export * from 'foo'
// Output:
Object.assign(exports, require('foo'))
```

> Written with [StackEdit](https://stackedit.io/).
