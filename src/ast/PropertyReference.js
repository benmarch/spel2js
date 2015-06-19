(function (exports, undefined) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(nullSafeNavigation, propertyName, position) {
        var node = SpelNode.create('property', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek();

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
                }
            }

            //handle safe navigation
            if (context[propertyName] === undefined) {
                if (nullSafeNavigation) {
                    return null;
                }

                throw {
                    name: 'NullPointerException',
                    message: 'Property ' + propertyName + ' does not exist.'
                };
            }

            return context[propertyName];
        };

        node.setValue = function (value, state) {
            var context = state.activeContext.peek();

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to assign property \''+ propertyName +'\' for an undefined context.'
                }
            }

            return context[propertyName] = value;
        };

        return node;
    }

    exports.PropertyReference = {
        create: createNode
    };

}(window || exports));
