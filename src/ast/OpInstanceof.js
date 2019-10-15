/*
 * Copyright 2002-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {SpelNode} from './SpelNode';

/**
 * The operator 'instanceof' checks if an object is of the class specified in the right
 * hand operand, in the same way that {@code instanceof} does in Java.
 *
 * THIS OPERATOR IS NOT IMPLEMENTED AND WILL THROW AN EXCEPTION
 *
 * @author Andy Clement
 * @since 3.0
 */
function createNode(position, left, right) {
    var node = SpelNode.create('instanceof', position, left, right);

    /**
     * Compare the left operand to see it is an instance of the type specified as the
     * right operand. The right operand must be a class.
     * @param state the expression state
     * @return {@code true} if the left operand is an instanceof of the right operand,
     * otherwise {@code false}
     * @throws EvaluationException if there is a problem evaluating the expression
     */
    node.getValue = function (state) {
        throw {
            name: 'MethodNotImplementedException',
            message: 'OpInstanceOf: Not implemented'
        }
    };

    return node;
}

export var OpInstanceof =  {
    create: createNode
};
