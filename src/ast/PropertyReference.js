(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(context, propertyName, parent) {
        var node = SpelNode.create('property', parent);

        node.getValue = function () {
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue();
            }
            else if (context) {
                return context[propertyName];
            }
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
            }
        };

        node.setContext(node.getValue());

        return node;
    }

    exports.PropertyReference = {
        create: createNode
    };

}(window || exports));
