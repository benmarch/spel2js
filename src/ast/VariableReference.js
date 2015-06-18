(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(variableName, position) {
        var node = SpelNode.create('variable', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                locals = state.locals;

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up variable \''+ variableName +'\' for an undefined context.'
                }
            }

            //there are 2 keywords (root, this) that need to be dealt with
            if (variableName === 'this') {
                return state.thisContext;
            }
            if (variableName === 'root') {
                return context;
            }

            //not sure if this will ever be the case but ill leave it for now
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue(locals[variableName]);
            }

            return locals[variableName];
        };

        return node;
    }

    exports.VariableReference = {
        create: createNode
    };

}(window || exports));
