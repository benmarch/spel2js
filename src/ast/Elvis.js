import {SpelNode} from './SpelNode';

function createNode(position, expression, ifFalse) {
    var node = SpelNode.create('elvis', position, expression, ifFalse);

    node.getValue = function (state) {
        return expression.getValue(state) !== null ? expression.getValue(state) : ifFalse.getValue(state);
    };

    return node;
}

export var Elvis =  {
    create: createNode
};
