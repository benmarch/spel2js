(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expr) {
        var node = SpelNode.create('op-not', position, expr);

        node.getValue = function (state) {
            return !expr.getValue(state);
        };

        return node;
    }

    exports.OpNot = {
        create: createNode
    };

}(window || exports));
