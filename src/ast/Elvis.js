(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expression, ifFalse) {
        var node = SpelNode.create('elvis', position, expression, ifFalse);

        node.getValue = function (state) {
            return expression.getValue(state) !== null ? expression.getValue(state) : ifFalse.getValue(state);
        };

        return node;
    }

    exports.Elvis = {
        create: createNode
    };

}(window || exports));
