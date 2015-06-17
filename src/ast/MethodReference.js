(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(parent, methodName, args) {
        var node = SpelNode.create('method', parent);

        node.getValue = function () {
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue();
            }
            else if (node.getContext()[methodName]) {
                return node.getContext()[methodName].apply(parent.getContext(), args);
            }
            throw {
                name: 'MethodDoesNotExistException',
                message: 'Method \'' + methodName + '\' does not exist in this context: ' + node.getContext()
            }
        };

        return node;
    }

    exports.MethodReference = {
        create: createNode
    };

}(window || exports));
