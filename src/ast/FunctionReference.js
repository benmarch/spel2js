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
 * A function reference is of the form "#someFunction(a,b,c)". Functions may be defined in
 * the context prior to the expression being evaluated or within the expression itself
 * using a lambda function definition. For example: Lambda function definition in an
 * expression: "(#max = {|x,y|$x>$y?$x:$y};max(2,3))" Calling context defined function:
 * "#isEven(37)". Functions may also be static java methods, registered in the context
 * prior to invocation of the expression.
 *
 * <p>Functions are very simplistic, the arguments are not part of the definition (right
 * now), so the names must be unique.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(functionName, position, args) {
    var node = SpelNode.create('function', position);

    node.getRaw = function () {
        return {
            functionName,
            args
        };
    };

    node.getValue = function (state) {
        var locals = state.locals || {},
            context = state.rootContext,
            compiledArgs = [];

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

        if (locals[functionName]) {
            return locals[functionName].apply(context, compiledArgs);
        }

        throw {
            name: 'FunctionDoesNotExistException',
            message: 'Function \'' + functionName + '\' does not exist.'
        };
    };

    return node;
}

export var FunctionReference =  {
    create: createNode
};
