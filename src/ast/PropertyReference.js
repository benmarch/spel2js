(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(propertyName, position) {
        var node = SpelNode.create('property', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek();
            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
                }
            }
            //not sure if this will ever be the case but ill leave it for now
            else if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue(context[propertyName]);
            }

            return context[propertyName];
        };

        //node.setContext(node.getValue());

        return node;
    }

    exports.PropertyReference = {
        create: createNode
    };

}(window || exports));
