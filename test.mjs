import { Transformer } from './index.mjs'

let entries = [
	[
		`import 'foo'`,
		`require('foo')`
	],
	[
		`import foo from 'bar'`,
		`const foo=require('bar').default`
	],
	[
		`import * as foo from 'bar'`,
		`const foo=require('bar')`
	],
	[
		`import { foo, bar as baz } from 'qux'`,
		`const{ foo, bar : baz }=require('qux')`
	],
	[
		`import('foo')`,
		`requireAsync('foo')`
	],
	[
		`import.meta.url`,
		`module.id`
	],
	[
		`import.meta.resolve('foo')`,
		`require.resolve('foo')`
	],
	[
		`export var foo = 'bar'`,
		`var foo = 'bar'\nexports.foo=foo`
	],
	[
		`export default 'foo'`,
		`exports.default= 'foo'`
	],
	[
		`export { foo, bar as baz } from 'qux'`,
		`exports.foo=require('qux').foo;exports.baz=require('qux').bar`
	],
	[
		`export { foo, bar as baz }`,
		`exports.foo=foo;exports.baz=bar`
	],
	[
		`export * as foo from 'bar'`,
		`exports.foo=require('bar')`
	],
	[
		`export * from 'foo'`,
		`Object.assign(exports,require('foo'))`
	],
]

let transform = Transformer()
let fail = 0

for (let [input, expected] of entries) {
	let actual = transform(input)
	if (actual !== expected) {
		console.error(`FAIL
Input   : ${input}
Expected: ${expected}
Actual  : ${actual}
`)
		fail++
	}
}

console.log(`SUMMARY
Test Count: ${entries.length}
Fail Count: ${fail}
Pass Count: ${entries.length - fail}
`)
