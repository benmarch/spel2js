(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, postfix, int) {
        var node = SpelNode.create('op-dec', position, int);

        node.getValue = function (state) {
            var cur = int.getValue(state);
            int.setValue(cur - 1, state);
            if (postfix) {
                return cur;
            }
            return cur - 1;
        };

        return node;
    }

    exports.OpDec = {
        create: createNode
    };

}(window || exports));
