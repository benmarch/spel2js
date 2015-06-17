(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, parent) {
        var node = SpelNode.create('string', parent);

        node.getValue = function () {
            return value;
        };

        return node;
    }

    exports.StringNode = {
        create: createNode
    };

}(window || exports));
