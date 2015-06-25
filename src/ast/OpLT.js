import {SpelNode} from './SpelNode';

function createNode(position, left, right) {
    var node = SpelNode.create('op-lt', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) < right.getValue(state);
    };

    return node;
}

export var OpLT =  {
    create: createNode
};
