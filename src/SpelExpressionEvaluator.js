(function (exports) {
    'use strict';

    var spelExpressionEvaluator = {},
        SpelExpressionParser;

    try {
        SpelExpressionParser = require('./SpelExpressionParser').SpelExpressionParser;
    } catch(e) {
        SpelExpressionParser = exports.SpelExpressionParser;
    }

    spelExpressionEvaluator.compile = function (expression) {
        var compiledExpression = SpelExpressionParser().parse(expression);
        return {
            eval: function (context, locals, thisContext) {
                if (!thisContext) {
                    thisContext = this;
                }
                return evalCompiled(compiledExpression, context, locals, thisContext);
            },
            _compiledExpression: compiledExpression
        }
    };

    spelExpressionEvaluator.eval = function (expression, context, locals, thisContext) {
        return spelExpressionEvaluator.compile(expression).eval(context, locals, thisContext);
    };

    function evalCompiled(compiledExpression, context, locals, thisContext) {
        var activeContext = new Stack(),
            state;

        if (!context) {
            context = {};
        }

        activeContext.push(context);

        state = {
            rootContext: context,
            activeContext: activeContext,
            locals: locals,
            thisContext: thisContext
        };
        return compiledExpression.getValue(state);
    }

    exports.SpelExpressionEvaluator = spelExpressionEvaluator;

}(window || exports));
