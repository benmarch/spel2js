import {SpelNode} from './SpelNode';

function createNode(parent, functionName) {
    var node = SpelNode.create('method', parent);

    node.getValue = function () {
        var refNode = node,
            context = null;
        do {
            if (refNode.getParent()) {
                refNode = refNode.getParent();
            } else {
                context = refNode.getContext();
            }
        } while (refNode);
        if (context[functionName]) {
            return context[functionName].call(context);
        }
        throw {
            name: 'FunctionDoesNotExistException',
            message: 'Function \'' + functionName + '\' does not exist.'
        };
    };

    return node;
}

export var FunctionReference =  {
    create: createNode
};
