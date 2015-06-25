import {SpelNode} from './SpelNode';

function createNode(value, position) {
    var node = SpelNode.create('number', position);

    node.getValue = function () {
        return value;
    };

    node.setValue = function (newValue) {
        /*jshint -W093 */
        return value = newValue;
        /*jshint +W093 */
    };

    return node;
}

export var NumberLiteral =  {
    create: createNode
};
