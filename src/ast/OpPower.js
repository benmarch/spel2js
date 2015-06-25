import {SpelNode} from './SpelNode';

function createNode(position, base, exp) {
    var node = SpelNode.create('op-power', position, base, exp);

    node.getValue = function (state) {
        return Math.pow(base.getValue(state), exp.getValue(state));
    };

    return node;
}

export var OpPower =  {
    create: createNode
};
