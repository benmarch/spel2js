/*
 * Copyright 2002-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {SpelNode} from './SpelNode';

/**
 * Represents a DOT separated expression sequence, such as 'property1.property2.methodOne()'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expressionComponents) {
    var node = SpelNode.create.apply(null, ['compound', position].concat(expressionComponents));

    function buildContextStack(state) {
        var childrenCount = node.getChildren().length,
            i;

        for (i = 0; i < childrenCount; i += 1) {
            if (node.getChildren()[i].getType() === 'indexer') {
                state.activeContext.push(state.activeContext.peek()[node.getChildren()[i].getValue(state)]);
            } else {
                state.activeContext.push(node.getChildren()[i].getValue(state));
            }
        }

        return function unbuildContextStack() {
            for (i = 0; i < childrenCount; i += 1) {
                state.activeContext.pop();
            }
        };
    }

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            value;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to evaluate compound expression with an undefined context.'
            };
        }

        var unbuildContextStack = buildContextStack(state);

        value = state.activeContext.peek();

        unbuildContextStack();

        return value;
    };

    node.setValue = function (value, state) {
        var unbuildContextStack = buildContextStack(state),
            childCount = node.getChildren().length;

        state.activeContext.pop();

        value = node.getChildren()[childCount - 1].setValue(value, state);

        state.activeContext.push(null);

        unbuildContextStack();

        return value;

    };

    return node;
}

export var CompoundExpression =  {
    create: createNode
};
