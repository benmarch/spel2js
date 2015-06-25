import {SpelNode} from './SpelNode';

function createNode(variableName, position) {
    var node = SpelNode.create('variable', position);

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            locals = state.locals;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up variable \''+ variableName +'\' for an undefined context.'
            };
        }

        //there are 2 keywords (root, this) that need to be dealt with
        if (variableName === 'this') {
            return context;
        }
        if (variableName === 'root') {
            return state.rootContext;
        }

        return locals[variableName];
    };

    node.setValue = function (value, state) {
        var locals = state.locals;

        /*jshint -W093 */
        return locals[variableName] = value;
        /*jshint +W093 */
    };

    return node;
}

export var VariableReference =  {
    create: createNode
};
