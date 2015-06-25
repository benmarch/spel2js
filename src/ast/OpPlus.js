import {SpelNode} from './SpelNode';

function createNode(position, left, right) {
    var node = SpelNode.create('op-plus', position, left, right);

    node.getValue = function (state) {
        //javascript will handle string concatenation or addition depending on types
        return left.getValue(state) + right.getValue(state);
    };

    return node;
}

export var OpPlus =  {
    create: createNode
};
