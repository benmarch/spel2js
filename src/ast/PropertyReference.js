import {SpelNode} from './SpelNode';

function createNode(nullSafeNavigation, propertyName, position) {
    var node = SpelNode.create('property', position);

    node.getValue = function (state) {
        var context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
            };
        }

        if (context[propertyName] === undefined) {
            //handle safe navigation
            if (nullSafeNavigation) {
                return null;
            }

            //handle conversion of Java properties to JavaScript properties
            if (propertyName === 'size' && Array.isArray(context)) {
                return context.length;
            }

            throw {
                name: 'NullPointerException',
                message: 'Property \'' + propertyName + '\' does not exist.'
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
            };
        }

        /*jshint -W093 */
        return context[propertyName] = value;
        /*jshint +W093 */
    };

    node.getName = function () {
        return propertyName;
    };

    return node;
}

export var PropertyReference =  {
    create: createNode
};
