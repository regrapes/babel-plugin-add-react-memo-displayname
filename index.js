const SUPPORTED_HOCS = ['forwardRef', 'memo'];

const isAnonymousComponent = (t, callee) => {
  
  if (t.isIdentifier(callee) && SUPPORTED_HOCS.includes(callee.name)) {
    return true;
  }

  if (t.isMemberExpression(callee)) {
    const {
      property
    } = callee;

    if (t.isIdentifier(property) && SUPPORTED_HOCS.includes(property.name)) {
      return true;
    }
  }

  return false;
};

module.exports = function transform({ types: t }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        const declarations = path.get('declarations')

        for (const declarator of declarations) {
          if (t.isIdentifier(declarator.node.id) && t.isCallExpression(declarator.node.init)) {
            let callExpression
            
            if (t.isArrowFunctionExpression(declarator.node.init.arguments[0])) {
              callExpression = declarator.node.init
            } else if (t.isCallExpression(declarator.node.init.arguments[0]) && isAnonymousComponent(t, declarator.node.init.callee) && t.isArrowFunctionExpression(declarator.node.init.arguments[0].arguments[0])) {
              callExpression = declarator.node.init.arguments[0]
            }

            if (callExpression && isAnonymousComponent(t, callExpression.callee)) {
              path.insertAfter(t.variableDeclarator(t.identifier(declarator.node.id.name + '.displayName'), t.stringLiteral(declarator.node.id.name)))
            }
          }
        }
      }
    }
  }
}
