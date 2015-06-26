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
import {Stack} from '../lib/Stack';

/**
 * An Indexer can index into some proceeding structure to access a particular piece of it.
 * Supported structures are: strings / collections (lists/sets) / arrays.
 *
 * @author Andy Clement
 * @author Phillip Webb
 * @author Stephane Nicoll
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expressionComponents) {
    var node = SpelNode.create.apply(null, ['indexer', position].concat(expressionComponents));

    node.getValue = function (state) {
        var activeContext = state.activeContext,
            context,
            childrenCount = node.getChildren().length,
            i,
            value;

        state.activeContext = new Stack();
        state.activeContext.push(state.rootContext);

        context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to evaluate compound expression with an undefined context.'
            };
        }

        for (i = 0; i < childrenCount; i += 1) {
            state.activeContext.push(node.getChildren()[i].getValue(state));
        }

        value = state.activeContext.peek();

        for (i = 0; i < childrenCount; i += 1) {
            state.activeContext.pop();
        }

        state.activeContext = activeContext;

        return value;
    };

    //node.setContext(node.getValue());

    return node;
}

export var Indexer =  {
    create: createNode
};
