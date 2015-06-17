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
            eval: function (context) {
                evalCompiled(compiledExpression, context)
            }
        }
    };

    spelExpressionEvaluator.eval = function (expression, context) {
        return evalCompiled(SpelExpressionParser().parse(expression), context);
    };

    function evalCompiled(compiledExpression, context) {
        var activeContext = new Stack();
        activeContext.push(context);
        var state = {
            rootContext: context,
            activeContext: activeContext
        };
        return compiledExpression.getValue(state);
    }

    exports.SpelExpressionEvaluator = spelExpressionEvaluator;

}(window || exports));
