'use strict';

const Parser = require('typescript-eslint-parser');
const Walker = require('node-source-walk');

/**
 * Extracts the dependencies of the supplied TypeScript module
 *
 * @param  {String|Object} src - File's content or AST
 * @return {String[]}
 */
module.exports = function(src, options = {}) {
  options.parser = Parser;
  const walker = new Walker(options);

  const dependencies = [];

  if (typeof src === 'undefined') {
    throw new Error('src not given');
  }

  if (src === '') {
    return dependencies;
  }

  walker.walk(src, function(node) {
    switch (node.type) {
      case 'ImportDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
        }
        break;
      case 'ExportNamedDeclaration':
      case 'ExportAllDeclaration':
        if (node.source && node.source.value) {
          dependencies.push(node.source.value);
        }
        break;
      case 'TSExternalModuleReference':
        if (node.expression && node.expression.value) {
          dependencies.push(node.expression.value);
        }
        break;
      default:
        return;
    }
  });

  return dependencies;
};

module.exports.tsx = function(src, options = {}) {
  options.ecmaFeatures = Object.assign(options.ecmaFeatures || {}, { jsx: true });
  return module.exports(src, options);
};
