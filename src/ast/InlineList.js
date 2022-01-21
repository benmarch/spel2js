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
 * Represent a list in an expression, e.g. '{1,2,3}'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, elements) {
    var node = SpelNode.create('list', position),
        list = [].concat(elements || []);

    node.getRaw = function () {
        return list;
    };
    
    node.getValue = function (state) {
        return list.map(function (element) {
            return element.getValue(state);
        });
    };

    return node;
}

export var InlineList =  {
    create: createNode
};
