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
 * Implements the {@code multiply} operator.
 *
 * <p>Conversions and promotions are handled as defined in
 * <a href="http://java.sun.com/docs/books/jls/third_edition/html/conversions.html">Section 5.6.2 of the
 * Java Language Specification</a>, with the addiction of {@code BigDecimal}/{@code BigInteger} management:
 *
 * <p>If any of the operands is of a reference type, unboxing conversion (Section 5.1.8)
 * is performed. Then:<br>
 * If either operand is of type {@code BigDecimal}, the other is converted to {@code BigDecimal}.<br>
 * If either operand is of type double, the other is converted to double.<br>
 * Otherwise, if either operand is of type float, the other is converted to float.<br>
 * If either operand is of type {@code BigInteger}, the other is converted to {@code BigInteger}.<br>
 * Otherwise, if either operand is of type long, the other is converted to long.<br>
 * Otherwise, both operands are converted to type int.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = SpelNode.create('op-multiply', position, left, right);

    node.getValue = function (state) {
        var leftValue = left.getValue(state),
            rightValue = right.getValue(state);

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
            return leftValue * rightValue;
        }

        //repeats (ex. 'abc' * 2 = 'abcabc')
        if (typeof leftValue === 'string' && typeof  rightValue === 'number') {
            var s = '',
                i = 0;
            for (; i < rightValue; i += 1) {
                s += leftValue;
            }
            return s;
        }

        return null;
    };

    return node;
}

export var OpMultiply =  {
    create: createNode
};
