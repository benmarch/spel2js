(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, elements) {
        var node = SpelNode.create('map', position),
            mapPieces = [].concat(elements || []);

        console.log(elements);

        node.getValue = function (state) {
            var key = true,
                keyValue = null,
                map = {};

            mapPieces.forEach(function (piece) {
                if (key) {
                    //unquoted property names come as type "property" but should be treated as strings
                    if (piece.getType() === 'property') {
                        keyValue = piece.getName();
                    } else {
                        keyValue = piece.getValue(state);
                    }
                } else {
                   map[keyValue] = piece.getValue(state);
                }
                key = !key;
            });

            return map;
        };

        return node;
    }

    exports.InlineMap = {
        create: createNode
    };

}(window || exports));
