import {SpelNode} from './SpelNode';
function createNode(position, elements) {
    var node = SpelNode.create('list', position),
        list = [].concat(elements || []);

    node.getValue = function (state) {
        return list.map(function (element) {
            return element.getValue(state);
        });
    };

    return node;
}

export var InlineList =  {
    create: createNode
};
