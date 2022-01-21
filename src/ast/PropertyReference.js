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
 * Represents a simple property or field reference.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Clark Duplichien
 * @author Ben March
 * @since 0.2.0
 */

function createNode(nullSafeNavigation, propertyName, position) {
    var node = SpelNode.create('property', position);

    node.getRaw = function () {
        return propertyName;
    };

    node.getValue = function (state) {
        var context = state.activeContext.peek();

        if (!context) {
            if (nullSafeNavigation) {
                return null;
            }

            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
            };
        }

        if (context[propertyName] === undefined || context[propertyName] === null) {
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
