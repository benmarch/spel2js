import {SpelNode} from './SpelNode';

function createNode(position, left, right) {
    var node = SpelNode.create('op-or', position, left, right);

    node.getValue = function (state) {
        //double bang for javascript
        return !!left.getValue(state) || !!right.getValue(state);
    };

    return node;
}

export var OpOr =  {
    create: createNode
};
