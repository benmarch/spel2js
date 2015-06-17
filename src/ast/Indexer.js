(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expressionComponents) {
        var node = SpelNode.create.apply(null, ['indexer', position].concat(expressionComponents));

        node.getValue = function (state) {
            var activeContext = state.activeContext,
                context,
                childrenCount = node.getChildren().length,
                i,
                value;

            state.activeContext = new Stack();
            state.activeContext.push(state.rootContext);

            context = state.activeContext.peek();

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to evaluate compound expression with an undefined context.'
                };
            }

            for (i = 0; i < childrenCount; i += 1) {
                state.activeContext.push(node.getChildren()[i].getValue(state));
            }

            value = state.activeContext.peek();

            for (i = 0; i < childrenCount; i += 1) {
                state.activeContext.pop();
            }

            state.activeContext = activeContext;

            return value;
        };

        //node.setContext(node.getValue());

        return node;
    }

    exports.Indexer = {
        create: createNode
    };

}(window || exports));
