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
 * Represents a variable reference, eg. #someVar. Note this is different to a *local*
 * variable like $someVar
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(variableName, position) {
    var node = SpelNode.create('variable', position);

    node.getRaw = function () {
        return variableName;
    };

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
