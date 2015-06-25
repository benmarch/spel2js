import {SpelNode} from './SpelNode';
function createNode(value, position) {
    var node = SpelNode.create('null', position);

    node.getValue = function () {
        return null;
    };

    return node;
}

export var NullLiteral =  {
    create: createNode
};
