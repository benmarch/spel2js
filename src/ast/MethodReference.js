(function (exports, undefined) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(nullSafeNavigation, methodName, position, args) {
        var node = SpelNode.create('method', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                compiledArgs = [],
                method;

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ methodName +'\' for an undefined context.'
                };
            }

            //handle safe navigation
            function maybeHandleNullSafeNavigation(member) {
                if (member === undefined) {
                    if (nullSafeNavigation) {
                        return null;
                    }

                    throw {
                        name: 'NullPointerException',
                        message: 'Method ' + methodName + ' does not exist.'
                    };
                }

                return member;
            }

            //populate arguments
            args.forEach(function (arg) {
                compiledArgs.push(arg.getValue(state));
            });

            //accessors might not be available
            if (methodName.substr(0, 3) === 'get' && !context[methodName]) {
                return maybeHandleNullSafeNavigation(context[methodName.charAt(3).toLowerCase() + methodName.substring(4)]);
            }
            if (methodName.substr(0, 3) === 'set' && !context[methodName]) {
                return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)] = compiledArgs[0];
            }

            method = maybeHandleNullSafeNavigation(context[methodName]);
            if (method) {
                return method.apply(context, compiledArgs);
            }
            return null;
        };

        return node;
    }

    exports.MethodReference = {
        create: createNode
    };

}(window || exports));
