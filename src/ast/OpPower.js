(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, base, exp) {
        var node = SpelNode.create('op-power', position, base, exp);

        node.getValue = function (state) {
            return Math.pow(base.getValue(state), exp.getValue(state));
        };

        return node;
    }

    exports.OpPower = {
        create: createNode
    };

}(window || exports));
