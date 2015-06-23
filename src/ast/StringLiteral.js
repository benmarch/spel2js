(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('string', position);

        function stripQuotes(value) {
            if ((value[0] === '\'' && value[value.length - 1] === '\'') ||
                (value[0] === '"' && value[value.length - 1] === '"')) {
                return value.substring(1, value.length - 1);
            }
            return value;
        }

        //value cannot be null so no check
        value = stripQuotes(value);

        node.getValue = function () {
            return value;
        };

        node.setValue = function (newValue) {
            value = newValue;
        };

        return node;
    }

    exports.StringLiteral = {
        create: createNode
    };

}(window || exports));
