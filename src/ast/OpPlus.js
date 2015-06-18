(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-plus', position, left, right);

        node.getValue = function (state) {
            //javascript will handle string concatenation or addition depending on types
            return left.getValue(state) + right.getValue(state);
        };

        return node;
    }

    exports.OpPlus = {
        create: createNode
    };

}(window || exports));
