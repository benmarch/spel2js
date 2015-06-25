import {SpelNode} from './SpelNode';

function createNode(context) {
    var node = SpelNode.create('root', null, context);

    node.getValue = function () {
        if (node.getChildren()[0]) {
            return node.getChildren()[0].getValue();
        }
        return null;
    };

    return node;
}

export var RootNode =  {
    create: createNode
};
