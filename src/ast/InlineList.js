(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, elements) {
        var node = SpelNode.create('list', position),
            list = [].concat(elements || []);

        node.getValue = function (state) {
            return list.map(function (element) {
                return element.getValue(state);
            });
        };

        return node;
    }

    exports.InlineList = {
        create: createNode
    };

}(window || exports));
