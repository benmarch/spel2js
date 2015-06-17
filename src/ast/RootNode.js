(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(context) {
        var node = SpelNode.create('root', null, context);

        node.getValue = function () {
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue();
            }
            return null;
        };

        return node;
    }

    exports.RootNode = {
        create: createNode
    };

}(window || exports));
