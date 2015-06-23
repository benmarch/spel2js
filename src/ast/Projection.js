(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function projectCollection(collection, expr, state) {
        return collection.map(function (element) {
            var matches;
            state.activeContext.push(element);
            matches = expr.getValue(state);
            state.activeContext.pop();
            return matches;
        });
    }

    function createNode(nullSafeNavigation, position, expr) {
        var node = SpelNode.create('projection', position, expr);

        node.getValue = function (state) {
            var collection = state.activeContext.peek(),
                entries = [],
                key;

            if (Array.isArray(collection)) {
                return projectCollection(collection, expr, state);
            }
            else if (typeof collection === 'object') {
                for (key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        entries.push(collection[key]);
                    }
                }
                return projectCollection(entries, expr, state);
            }

            return null;
        };

        return node;
    }

    exports.Projection = {
        create: createNode
    };

}(window || exports));
