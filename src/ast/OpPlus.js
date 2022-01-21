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
 * The plus operator will:
 * <ul>
 * <li>add numbers
 * <li>concatenate strings
 * </ul>
 *
 * <p>It can be used as a unary operator for numbers.
 * The standard promotions are performed when the operand types vary (double+int=double).
 * For other options it defers to the registered overloader.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ivo Smid
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = SpelNode.create('op-plus', position, left, right);

    node.getValue = function (state) {
        if (!right) {
            return + left.getValue(state);
        }
        //javascript will handle string concatenation or addition depending on types
        return left.getValue(state) + right.getValue(state);
    };

    return node;
}

export var OpPlus =  {
    create: createNode
};
