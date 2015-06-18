(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('null', position);

        node.getValue = function () {
            return null;
        };

        return node;
    }

    exports.NullLiteral = {
        create: createNode
    };

}(window || exports));
