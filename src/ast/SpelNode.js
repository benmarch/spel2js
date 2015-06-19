(function (exports) {
    'use strict';

    function createSpelNode(nodeType, position /*, operands */) {
        var node = {},
            type = nodeType || 'Abstract',
            children = [],
            parent = null,
            args = Array.prototype.slice.call(arguments),
            operands = args.length > 2 ? args.slice(2) : null,
            activeContext;

        node._type = type;

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

        node.getContext = function (state) {
            return activeContext || state.activeContext.peek();
        };
        node.setContext = function (nodeContext) {
            activeContext = nodeContext;
        };

        node.getStartPosition = function () {
            return (position >> 16);
        };

        node.getEndPosition = function () {
            return (position & 0xffff);
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
            //s += ', Value: ' + node.getValue();
            s += ', Children: [';
            for (var i = 0, l = node.getChildren().length; i < l; i += 1) {
                s += '{' + node.getChildren()[i] + '}, ';
            }
            s += ']';
            return s;
        };

        //constructor
        if (position === 0) {
            throw {
                name: 'Error',
                message: 'Position cannot be 0'
            };
        }

        if (operands) {
            operands.forEach(function (operand) {
                node.addChild(operand);
            });
        }


        return node;
    }

    exports.SpelNode = {
        create: createSpelNode
    };

}(window || exports));
