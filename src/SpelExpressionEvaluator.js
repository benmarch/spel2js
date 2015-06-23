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
            eval: function (context, locals) {
                return evalCompiled(compiledExpression, context, locals);
            },
            _compiledExpression: compiledExpression
        }
    };

    spelExpressionEvaluator.eval = function (expression, context, locals) {
        return spelExpressionEvaluator.compile(expression).eval(context, locals);
    };

    function evalCompiled(compiledExpression, context, locals) {
        var activeContext = new Stack(),
            state;

        if (!context) {
            context = {};
        }

        activeContext.push(context);

        state = {
            rootContext: context,
            activeContext: activeContext,
            locals: locals
        };
        return compiledExpression.getValue(state);
    }

    exports.SpelExpressionEvaluator = spelExpressionEvaluator;

}(window || exports));
