(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function matches(element, expr, state) {
        var matches = false;
        state.activeContext.push(element);
        matches = expr.getValue(state);
        state.activeContext.pop();
        return matches;
    }

    function selectFromArray(collection, whichElement, expr, state) {
        var newCollection = collection.filter(function (element) {
            return matches(element, expr, state);
        });

        switch (whichElement) {
        case 'ALL':
            return newCollection;
            break;
        case 'FIRST':
            return newCollection[0] || null;
            break;
        case 'LAST':
            if (newCollection.length) {
                return newCollection[newCollection.length - 1];
                break;
            }
            return null;
        }
    }

    function selectFromMap(collection, whichElement, expr, state) {
        var newCollection = {},
            entry,
            key,
            entries = [],
            returnValue = {};

        for (key in collection) {
            if (collection.hasOwnProperty(key)) {
                entry = {
                    key: key,
                    value: collection[key]
                };
                if (matches(entry, expr, state)) {
                    entries.push(entry);
                }
            }
        }

        switch (whichElement) {
        case 'ALL':
            entries.forEach(function (entry) {
                newCollection[entry.key] = entry.value;
            });
            return newCollection;
            break;
        case 'FIRST':
            if (entries.length) {
                returnValue[entries[0].key] = entries[0].value;
                return returnValue;
            }
            return null;
            break;
        case 'LAST':
            if (entries.length) {
                returnValue[entries[entries.length - 1].key] = entries[entries.length - 1].value;
                return returnValue;
            }
            return null;
            break;
        }

        entries.forEach(function (entry) {
            newCollection[entry.key] = entry.value;
        });
    }

    function createNode(nullSafeNavigation, whichElement, position, expr) {
        var node = SpelNode.create('selection', position, expr);

        node.getValue = function (state) {
            var collection = state.activeContext.peek();

            if (collection) {
                if (Array.isArray(collection)) {
                    return selectFromArray(collection, whichElement, expr, state);
                }
                else if (typeof collection === 'object') {
                    return selectFromMap(collection, whichElement, expr, state);
                }
            }

            return null;
        };

        return node;
    }

    exports.Selection = {
        create: createNode,
        FIRST: 'FIRST',
        LAST: 'LAST',
        ALL: 'ALL'
    };

}(window || exports));
