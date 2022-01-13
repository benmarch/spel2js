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
 * Represents the invocation of a constructor. Either a constructor on a regular type or
 * construction of an array. When an array is constructed, an initializer can be specified.
 *
 * <p>Examples:<br>
 * new String('hello world')<br>
 * new int[]{1,2,3,4}<br>
 * new int[3] new int[3]{1,2,3}
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @since 3.0
 */
function createNode(position, nodes) {
    var node = SpelNode.create('constructorref', position);

    node.getValue = function (state) {
        throw {
            name: 'MethodNotImplementedException',
            message: 'BeanReference: Not implemented'
        }
    };

    return node;
}

export var ConstructorReference =  {
    create: createNode
};
