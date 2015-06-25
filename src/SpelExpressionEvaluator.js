import {SpelExpressionParser as spelExpressionParser} from './SpelExpressionParser';
import {Stack} from './lib/Stack';

var spelExpressionEvaluator = {};

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

spelExpressionEvaluator.compile = function (expression) {
    var compiledExpression = spelExpressionParser().parse(expression);
    return {
        eval: function (context, locals) {
            return evalCompiled(compiledExpression, context, locals);
        },
        _compiledExpression: compiledExpression
    };
};

spelExpressionEvaluator.eval = function (expression, context, locals) {
    return spelExpressionEvaluator.compile(expression).eval(context, locals);
};

export {spelExpressionEvaluator as SpelExpressionEvaluator};
