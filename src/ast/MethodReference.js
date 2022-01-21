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
import {Stack} from '../lib/Stack'

/**
 * Expression language AST node that represents a method reference.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */


function createNode(nullSafeNavigation, methodName, position, args) {
    var node = SpelNode.create('method', position);

    node.getRaw = function () {
        return {
            methodName,
            args
        };
    };

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            compiledArgs = [],
            method;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \''+ methodName +'\' for an undefined context.'
            };
        }

        //handle safe navigation
        function maybeHandleNullSafeNavigation(member) {
            if (member === undefined || member === null) {
                if (nullSafeNavigation) {
                    return null;
                }

                throw {
                    name: 'NullPointerException',
                    message: 'Method ' + methodName + ' does not exist.'
                };
            }

            return member;
        }

        //populate arguments
        args.forEach(function (arg) {
            // reset the active context to root context for evaluating argument
            const currentActiveContext = state.activeContext
            state.activeContext = new Stack();
            state.activeContext.push(state.rootContext);

            // evaluate argument
            compiledArgs.push(arg.getValue(state));

            // reset the active context
            state.activeContext = currentActiveContext;
        });

        //accessors might not be available
        if (methodName.substr(0, 3) === 'get' && !context[methodName]) {
            return maybeHandleNullSafeNavigation(context[methodName.charAt(3).toLowerCase() + methodName.substring(4)]);
        }
        if (methodName.substr(0, 3) === 'set' && !context[methodName]) {
            /*jshint -W093 */
            return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)] = compiledArgs[0];
            /*jshint +W093 */
        }

        //array methods
        if (Array.isArray(context)) {
            //size() -> length
            if (methodName === 'size') {
                return context.length;
            }

            if (methodName === 'contains') {
                return context.includes(compiledArgs[0])
            }
        }

        method = maybeHandleNullSafeNavigation(context[methodName]);
        if (method) {
            return method.apply(context, compiledArgs);
        }
        return null;
    };

    return node;
}

export var MethodReference =  {
    create: createNode
};
