/*
 * Copyright 2002-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The common supertype of all AST nodes in a parsed Spring Expression Language
 * format expression.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createSpelNode(nodeType, position, ...operands) {
    var node = {},
        type = nodeType || 'Abstract',
        children = [],
        parent = null,
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
        if (!childNode) {
            // See OpMinus and OpPlus: right node can be null for unary mode
            return;
        }
        if (!childNode.setParent) {
            throw {
                name: 'Error',
                message: 'Trying to add a child which is not a node: ' + JSON.stringify(childNode)
            };
        }
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
        };
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

export var SpelNode = {
    create: createSpelNode
};

