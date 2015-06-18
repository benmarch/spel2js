(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expression, ifTrue, ifFalse) {
        var node = SpelNode.create('ternary', position, expression, ifTrue, ifFalse);

        node.getValue = function (state) {
            return expression.getValue(state) ? ifTrue.getValue(state) : ifFalse.getValue(state);
        };

        return node;
    }

    exports.Ternary = {
        create: createNode
    };

}(window || exports));
