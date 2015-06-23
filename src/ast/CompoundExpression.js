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

        function buildContextStack(state) {
            var childrenCount = node.getChildren().length,
                i;

            for (i = 0; i < childrenCount; i += 1) {
                if (node.getChildren()[i].getType() === 'indexer') {
                    state.activeContext.push(state.activeContext.peek()[node.getChildren()[i].getValue(state)]);
                } else {
                    state.activeContext.push(node.getChildren()[i].getValue(state));
                }
            }

            return function unbuildContextStack() {
                for (i = 0; i < childrenCount; i += 1) {
                    state.activeContext.pop();
                }
            }
        }

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                value;

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to evaluate compound expression with an undefined context.'
                };
            }

            var unbuildContextStack = buildContextStack(state);

            value = state.activeContext.peek();

            unbuildContextStack();

            return value;
        };

        node.setValue = function (value, state) {
            var unbuildContextStack = buildContextStack(state),
                childCount = node.getChildren().length;

            state.activeContext.pop();

            value = node.getChildren()[childCount - 1].setValue(value, state);

            state.activeContext.push(null);

            unbuildContextStack();

            return value;

        };

        return node;
    }

    exports.CompoundExpression = {
        create: createNode
    };

}(window || exports));
