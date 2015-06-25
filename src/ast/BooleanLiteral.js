import {SpelNode} from './SpelNode';

function createNode(value, position) {
    var node = SpelNode.create('boolean', position);

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

export var BooleanLiteral =  {
    create: createNode
};
