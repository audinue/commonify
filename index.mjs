export function Transformer () {
	let identifier = '([a-z_$][a-z0-9_$]*)'
	let string = '([\'"][^\'"]+[\'"])'
	let object = '({[^}]+})'
	let regExp = new RegExp(
		'\\bimport(?:'
			// `import foo from 'bar'`,
			+ '(?:\\s+' + identifier + '\\s+from\\s*' + string + ')'
			+ '|(?:\\s*(?:'
				// `import 'foo'`,
				+ string
				// `import * as foo from 'bar'`,
				+ '|(?:\\*\\s*as\\s+' + identifier + '\\s+from\\s*' + string + ')'
				// `import { foo, bar as baz } from 'qux'`,
				+ '|(?:' + object + '\\s*from\\s*' + string + ')'
				// `import('foo')`,
				+ '|(?:\\(\\s*' + string + '\\s*\\))'
				+ '|(?:\\.\\s*meta\\s*\\.\\s*(?:'
					// `import.meta.url`,
					+ '(url)'
					// `import.meta.resolve('foo')`,
					+ '|resolve\\s*\\(\\s*' + string + '\\s*\\)'
					+ '))'
			+ ')))'
		+ '|\\bexport(?:'
			+ '(?:\\s+(?:'
				// `export var foo = 'bar'`,
				+ '((?:var|let|const|function|class)\\s+)' + identifier
				// `export default 'foo'`,
				+ '|(default)'
			+ '))'
			+ '|(?:\\s*(?:'
				// `export { foo, bar as baz } from 'qux'`,
				+ object + '\\s*from\\s*' + string
				// `export { foo, bar as baz }`,
				+ '|(?:' + object + ')'
				// `export * as foo from 'bar'`,
				+ '|(?:\\*\\s*as\\s+' + identifier + '\\s+from\\s*' + string + ')'
				// `export * from 'foo'`,
				+ '|(?:\\*\\s*from\\s*' + string + ')'
			+ ')))'
		, 'ig'
	)
	return function transform (code) {
		let postfix = ''
		return code.replace(regExp, function (...match) {
			if (match[1]) {
				// `const foo=require('bar').default`
				return 'const ' + match[1] + '=require(' + match[2] + ').default'
			}
			if (match[3]) {
				// `require('foo')`
				return 'require(' + match[3] + ')'
			}
			if (match[4]) {
				// `const foo=require('bar')`
				return 'const ' + match[4] + '=require(' + match[5] + ')'
			}
			if (match[6]) {
				// `const{ foo, bar : baz }=require('qux')`
				return 'const' + match[6].replace(/\bas\b/g, ':') + '=require(' + match[7] + ')'
			}
			if (match[8]) {
				// `requireAsync('foo')`
				return 'requireAsync(' + match[8] + ')'
			}
			if (match[9]) {
				// `module.id`
				return 'module.id'
			}
			if (match[10]) {
				// `require.resolve('foo')`
				return 'require.resolve(' + match[10] + ')'
			}
			if (match[11]) {
				// `var foo = 'bar'\nexports.foo=foo`
				postfix += '\nexports.' + match[12] + '=' + match[12]
				return match[11] + match[12]
			}
			if (match[13]) {
				// `exports.default= 'foo'`
				return 'exports.default='
			}
			if (match[14]) {
				// `exports.foo=require('qux').foo;exports.baz=require('qux').bar`
				return parse(match[14])
					.map(function ([target, source]) {
						return 'exports.' + target + '=require(' + match[15] + ').' + source
					})
					.join(';')
			}
			if (match[16]) {
				// `exports.foo=foo;exports.baz=bar`
				return parse(match[16])
					.map(function ([target, source]) {
						return 'exports.' + target + '=' + source
					})
					.join(';')
			}
			if (match[17]) {
				// `exports.foo=require('bar')`
				return 'exports.' + match[17] + '=require(' + match[18] + ')'
			}
			if (match[19]) {
				// `Object.assign(exports,require('foo'))`
				return 'Object.assign(exports,require(' + match[19] + '))'
			}
		}) + postfix
	}
}

// Converts '{ foo, bar as baz }' to [['foo', 'foo'], ['baz', 'bar']]
function parse (object) {
	return object
		.slice(1, -1)
		.split(/,/)
		.map(function (entry) {
			entry = entry.trim().split(/\s*\bas\b\s*/)
			return entry.length === 1
				? [entry[0], entry[0]]
				: [entry[1], entry[0]]
		})
}
