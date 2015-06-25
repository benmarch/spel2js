import {SpelNode} from './SpelNode';

function createNode(position, expression, ifTrue, ifFalse) {
    var node = SpelNode.create('ternary', position, expression, ifTrue, ifFalse);

    node.getValue = function (state) {
        return expression.getValue(state) ? ifTrue.getValue(state) : ifFalse.getValue(state);
    };

    return node;
}

export var Ternary =  {
    create: createNode
};
