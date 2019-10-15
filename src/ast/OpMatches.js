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
 * Implements the matches operator. Matches takes two operands:
 * The first is a String and the second is a Java regex.
 * It will return {@code true} when {@link #getValue} is called
 * if the first operand matches the regex.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Chris Thielen
 * @since 3.0
 */
function createNode(position, left, right) {
    var node = SpelNode.create('matches', position, left, right);

    /**
     * Check the first operand matches the regex specified as the second operand.
     * @param state the expression state
     * @return {@code true} if the first operand matches the regex specified as the
     * second operand, otherwise {@code false}
     * @throws EvaluationException if there is a problem evaluating the expression
     * (e.g. the regex is invalid)
     */
    node.getValue = function (state) {
        var data = left.getValue(state);
        var regexpString = right.getValue(state);

        try {
            var regexp = new RegExp(regexpString);
            return !!regexp.exec(data)
        } catch (error) {
            throw {
                name: 'EvaluationException',
                message: error.toString()
            }
        }
    };

    return node;
}

export var OpMatches =  {
    create: createNode
};
