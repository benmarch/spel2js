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
 * Represents assignment. An alternative to calling setValue() for an expression is to use
 * an assign.
 *
 * <p>Example: 'someNumberProperty=42'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

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
