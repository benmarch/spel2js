import {SpelNode} from './SpelNode';

function createNode(position, property, assignedValue) {
    var node = SpelNode.create('assign', position, property, assignedValue);

    node.getValue = function (state) {
        var context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to assign property \''+ property.getValue(state) +'\' for an undefined context.'
            };
        }

        return property.setValue(assignedValue.getValue(state), state);
    };

    return node;
}

export var Assign =  {
    create: createNode
};
