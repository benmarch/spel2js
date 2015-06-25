import {SpelNode} from './SpelNode';

function createNode(value, position) {
    var node = SpelNode.create('string', position);

    function stripQuotes(value) {
        if ((value[0] === '\'' && value[value.length - 1] === '\'') ||
            (value[0] === '"' && value[value.length - 1] === '"')) {
            return value.substring(1, value.length - 1);
        }
        return value;
    }

    //value cannot be null so no check
    value = stripQuotes(value);

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

export var StringLiteral =  {
    create: createNode
};
