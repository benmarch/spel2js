import {SpelNode} from './SpelNode';

function createNode(position, left, right) {
    var node = SpelNode.create('op-and', position, left, right);

    node.getValue = function (state) {
        //double bang for javascript
        return !!left.getValue(state) && !!right.getValue(state);
    };

    return node;
}

export var OpAnd =  {
    create: createNode
};
