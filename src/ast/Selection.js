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
 * Represents selection over a map or collection.
 * For example: {1,2,3,4,5,6,7,8,9,10}.?{#isEven(#this) == 'y'} returns [2, 4, 6, 8, 10]
 *
 * <p>Basically a subset of the input data is returned based on the
 * evaluation of the expression supplied as selection criteria.
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Sam Brannen
 * @author Ben March
 * @since 0.2.0
 */

function matches(element, expr, state) {
    var doesMatch = false;
    state.activeContext.push(element);
    doesMatch = expr.getValue(state);
    state.activeContext.pop();
    return doesMatch;
}

function selectFromArray(collection, whichElement, expr, state) {
    var newCollection = collection.filter(function (element) {
        return matches(element, expr, state);
    });

    switch (whichElement) {
    case 'ALL':
        return newCollection;
    case 'FIRST':
        return newCollection[0] || null;
    case 'LAST':
        if (newCollection.length) {
            return newCollection[newCollection.length - 1];
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
    case 'FIRST':
        if (entries.length) {
            returnValue[entries[0].key] = entries[0].value;
            return returnValue;
        }
        return null;
    case 'LAST':
        if (entries.length) {
            returnValue[entries[entries.length - 1].key] = entries[entries.length - 1].value;
            return returnValue;
        }
        return null;
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

export var Selection = {
    create: createNode,
    FIRST: 'FIRST',
    LAST: 'LAST',
    ALL: 'ALL'
};
