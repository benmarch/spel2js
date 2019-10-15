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
 * Represents the between operator. The left operand to between must be a single value and
 * the right operand must be a list - this operator returns true if the left operand is
 * between (using the registered comparator) the two elements in the list. The definition
 * of between being inclusive follows the SQL BETWEEN definition.
 *
 * @author Andy Clement
 * @since 3.0
 */
function createNode(position, left, right) {
    var node = SpelNode.create('between', position, left, right);

    /**
     * Returns a boolean based on whether a value is in the range expressed. The first
     * operand is any value whilst the second is a list of two values - those two values
     * being the bounds allowed for the first operand (inclusive).
     * @param state the expression state
     * @return true if the left operand is in the range specified, false otherwise
     * @throws EvaluationException if there is a problem evaluating the expression
     */
    node.getValue = function (state) {
        throw {
            name: 'MethodNotImplementedException',
            message: 'OpBetween: Not implemented'
        }
    };

    return node;
}

export var OpBetween =  {
    create: createNode
};
