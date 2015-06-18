(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(methodName, position, args) {
        var node = SpelNode.create('method', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                compiledArgs = [];

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ methodName +'\' for an undefined context.'
                };
            }

            //populate arguments
            args.forEach(function (arg) {
                compiledArgs.push(arg.getValue(state));
            });

            //accessors might not be available
            if (methodName.substr(0, 3) === 'get' && !context[methodName]) {
                return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)];
            }
            if (methodName.substr(0, 3) === 'set' && !context[methodName]) {
                return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)] = compiledArgs[0];
            }

            //not sure if this will ever be the case but ill leave it for now
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue(context[methodName].apply(context, compiledArgs));
            }

            return context[methodName].apply(context, compiledArgs);
        };

        return node;
    }

    exports.MethodReference = {
        create: createNode
    };

}(window || exports));
