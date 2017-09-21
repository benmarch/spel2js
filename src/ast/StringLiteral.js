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
 * Expression language AST node that represents a string literal.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */

function createNode(value, position) {
    var node = SpelNode.create('string', position);

    function stripQuotes(value) {
        if ((value[0] === '\'' && value[value.length - 1] === '\'') ||
            (value[0] === '"' && value[value.length - 1] === '"')) {
            value = value.substring(1, value.length - 1);
        }

        return value.replace(/''/g, '\'').replace(/""/g, '"');
    }

    //value cannot be null so no check
    value = stripQuotes(value);

    node.getValue = function () {
        return value;
    };

    node.setValue = function (newValue) {
        /*jshint -W093 */
        return value = newValue;
        /*jshint +W093 */
    };

    return node;
}

export var StringLiteral =  {
    create: createNode
};
