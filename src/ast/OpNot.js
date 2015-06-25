import {SpelNode} from './SpelNode';

function createNode(position, expr) {
    var node = SpelNode.create('op-not', position, expr);

    node.getValue = function (state) {
        return !expr.getValue(state);
    };

    return node;
}

export var OpNot =  {
    create: createNode
};
