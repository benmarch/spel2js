(function (exports) {
    'use strict';

    function createSpelNode(nodeType, parentNode, context) {
        var node = {},
            type = nodeType || 'Abstract',
            children = [],
            parent = parentNode || null;

        node.getType = function () {
            return type;
        };
        node.setType = function (nodeType) {
            type = nodeType;
        };

        node.getChildren = function () {
            return children;
        };
        node.addChild = function (childNode) {
            childNode.setParent(node);
            children.push(childNode);
        };

        node.getParent = function () {
            return parent;
        };
        node.setParent = function (parentNode) {
            parent = parentNode;
        };

        node.getContext = function () {
            return context || parent.getContext();
        };
        node.setContext = function (nodeContext) {
            context = nodeContext;
        };

        //must override
        node.getValue = function () {
            throw {
                name: 'MethodNotImplementedException',
                message: 'SpelNode#getValue() must be overridden.'
            }
        };

        node.toString = function () {
            var s = 'Kind: ' + node.getType();
            s += ', Value: ' + node.getValue();
            s += ', Children: [';
            for (var i = 0, l = node.getChildren().length; i < l; i += 1) {
                s += '{' + node.getChildren()[i] + '}';
            }
            s += ']';
            return s;
        };

        if (parentNode) {
            parentNode.addChild(node);
        }

        return node;
    }

    exports.SpelNode = {
        create: createSpelNode
    };

}(window || exports));
