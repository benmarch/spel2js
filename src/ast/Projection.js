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
 * Represents projection, where a given operation is performed on all elements in some
 * input sequence, returning a new sequence of the same size. For example:
 * "{1,2,3,4,5,6,7,8,9,10}.!{#isEven(#this)}" returns "[n, y, n, y, n, y, n, y, n, y]"
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Ben March
 * @since 0.2.0
 */

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

export var Projection =  {
    create: createNode
};
