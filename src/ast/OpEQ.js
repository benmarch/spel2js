import {SpelNode} from './SpelNode';

function createNode(position, left, right) {
    var node = SpelNode.create('op-eq', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) === right.getValue(state);
    };

    return node;
}

export var OpEQ =  {
    create: createNode
};
