(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-multiply', position, left, right);

        node.getValue = function (state) {
            var leftValue = left.getValue(state),
                rightValue = right.getValue(state);

            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue * rightValue;
            }

            //repeats (ex. 'abc' * 2 = 'abcabc')
            if (typeof leftValue === 'string' && typeof  rightValue === 'number') {
                var s = '',
                    i = 0;
                for (; i < rightValue; i += 1) {
                    s += leftValue;
                }
                return s;
            }

            return null;
        };

        return node;
    }

    exports.OpMultiply = {
        create: createNode
    };

}(window || exports));
