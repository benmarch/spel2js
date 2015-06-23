(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('boolean', position);

        node.getValue = function () {
            return value;
        };

        node.setValue = function (newValue) {
            value = newValue;
        };

        return node;
    }

    exports.BooleanLiteral = {
        create: createNode
    };

}(window || exports));
