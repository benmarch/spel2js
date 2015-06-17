(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(parent, functionName) {
        var node = SpelNode.create('method', parent);

        node.getValue = function () {
            var refNode = node,
                context = null;
            do {
                if (refNode.getParent()) {
                    refNode = refNode.getParent();
                } else {
                    context = refNode.getContext();
                }
            } while (refNode);
            if (context[functionName]) {
                return context[functionName].call(context);
            }
            throw {
                name: 'FunctionDoesNotExistException',
                message: 'Function \'' + functionName + '\' does not exist.'
            }
        };

        return node;
    }

    exports.FunctionReference = {
        create: createNode
    };

}(window || exports));
