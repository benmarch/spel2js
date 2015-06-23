(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-and', position, left, right);

        node.getValue = function (state) {
            //double bang for javascript
            return !!left.getValue(state) && !!right.getValue(state);
        };

        return node;
    }

    exports.OpAnd = {
        create: createNode
    };

}(window || exports));
