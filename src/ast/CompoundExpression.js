(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expressionComponents) {
        var node = SpelNode.create.apply(null, ['compound', position].concat(expressionComponents));

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                childrenCount = node.getChildren().length,
                i,
                value;
            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to evaluate compound expression with an undefined context.'
                };
            }

            for (i = 0; i < childrenCount; i += 1) {
                if (node.getChildren()[i].getType() === 'property') {
                    state.activeContext.push(node.getChildren()[i].getValue(state));
                }
                if (node.getChildren()[i].getType() === 'indexer') {
                    state.activeContext.push(state.activeContext.peek()[node.getChildren()[i].getValue(state)]);
                }
            }

            value = state.activeContext.peek();

            for (i = 0; i < childrenCount; i += 1) {
                state.activeContext.pop();
            }

            return value;
        };

        //node.setContext(node.getValue());

        return node;
    }

    exports.CompoundExpression = {
        create: createNode
    };

}(window || exports));
