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
 * Represents a dot separated sequence of strings that indicate a package qualified type
 * reference.
 *
 * <p>Example: "java.lang.String" as in the expression "new java.lang.String('hello')"
 *
 * @author Andy Clement
 * @since 3.0
 */
function createNode(position, pieces) {
    var node = SpelNode.create('qualifiedidentifier', position, ...pieces);

    node.getRaw = function () {
        return pieces.map(p => p.getRaw());
    };

    node.getValue = function (state) {
        throw {
            name: 'MethodNotImplementedException',
            message: 'QualifiedIdentifier: Not implemented'
        }
    };

    return node;
}

export var QualifiedIdentifier =  {
    create: createNode
};
