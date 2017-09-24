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

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.spel2js = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

/**
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelExpressionParser = require('./SpelExpressionParser');

var _libStack = require('./lib/Stack');

var spelExpressionEvaluator = {};

function evalCompiled(compiledExpression, context, locals) {
    var activeContext = new _libStack.Stack(),
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
    var compiledExpression = (0, _SpelExpressionParser.SpelExpressionParser)().parse(expression);
    return {
        eval: function _eval(context, locals) {
            return evalCompiled(compiledExpression, context, locals);
        },
        _compiledExpression: compiledExpression
    };
};

spelExpressionEvaluator.eval = function (expression, context, locals) {
    return spelExpressionEvaluator.compile(expression).eval(context, locals);
};

exports.SpelExpressionEvaluator = spelExpressionEvaluator;

},{"./SpelExpressionParser":2,"./lib/Stack":42}],2:[function(require,module,exports){
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

/**
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 *
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _TokenKind = require('./TokenKind');

var _Tokenizer = require('./Tokenizer');

var _astBooleanLiteral = require('./ast/BooleanLiteral');

var _astNumberLiteral = require('./ast/NumberLiteral');

var _astStringLiteral = require('./ast/StringLiteral');

var _astNullLiteral = require('./ast/NullLiteral');

var _astFunctionReference = require('./ast/FunctionReference');

var _astMethodReference = require('./ast/MethodReference');

var _astPropertyReference = require('./ast/PropertyReference');

var _astVariableReference = require('./ast/VariableReference');

var _astCompoundExpression = require('./ast/CompoundExpression');

var _astIndexer = require('./ast/Indexer');

var _astAssign = require('./ast/Assign');

var _astOpEQ = require('./ast/OpEQ');

var _astOpNE = require('./ast/OpNE');

var _astOpGE = require('./ast/OpGE');

var _astOpGT = require('./ast/OpGT');

var _astOpLE = require('./ast/OpLE');

var _astOpLT = require('./ast/OpLT');

var _astOpPlus = require('./ast/OpPlus');

var _astOpMinus = require('./ast/OpMinus');

var _astOpMultiply = require('./ast/OpMultiply');

var _astOpDivide = require('./ast/OpDivide');

var _astOpModulus = require('./ast/OpModulus');

var _astOpPower = require('./ast/OpPower');

var _astOpInc = require('./ast/OpInc');

var _astOpDec = require('./ast/OpDec');

var _astOpNot = require('./ast/OpNot');

var _astOpAnd = require('./ast/OpAnd');

var _astOpOr = require('./ast/OpOr');

var _astTernary = require('./ast/Ternary');

var _astElvis = require('./ast/Elvis');

var _astInlineList = require('./ast/InlineList');

var _astInlineMap = require('./ast/InlineMap');

var _astSelection = require('./ast/Selection');

var _astProjection = require('./ast/Projection');

//not yet implemented
var OperatorInstanceof, OperatorMatches, OperatorBetween, BeanReference, TypeReference, QualifiedIdentifier, Identifier, ConstructorReference;

var SpelExpressionParser = function SpelExpressionParser() {

    var VALID_QUALIFIED_ID_PATTERN = new RegExp('[\\p{L}\\p{N}_$]+');

    var configuration;

    // For rules that build nodes, they are stacked here for return
    var constructedNodes = [];

    // The expression being parsed
    var expressionString;

    // The token stream constructed from that expression string
    var tokenStream;

    // length of a populated token stream
    var tokenStreamLength;

    // Current location in the token stream when processing tokens
    var tokenStreamPointer;

    /**
     * Create a parser with some configured behavior.
     * @param config custom configuration options
     */
    function setConfiguration(config) {
        configuration = config;
    }

    function parse(expression, context) {
        try {
            expressionString = expression;
            tokenStream = _Tokenizer.Tokenizer.tokenize(expression);
            tokenStreamLength = tokenStream.length;
            tokenStreamPointer = 0;
            constructedNodes = [];
            var ast = eatExpression();
            if (moreTokens()) {
                raiseInternalException(peekToken().startPos, 'MORE_INPUT', nextToken().toString());
            }
            //Assert.isTrue(this.constructedNodes.isEmpty());
            return ast;
        } catch (e) {
            throw e.message;
        }
    }

    //	expression
    //    : logicalOrExpression
    //      ( (ASSIGN^ logicalOrExpression)
    //	    | (DEFAULT^ logicalOrExpression)
    //	    | (QMARK^ expression COLON! expression)
    //      | (ELVIS^ expression))?;
    function eatExpression() {
        var expr = eatLogicalOrExpression();
        if (moreTokens()) {
            var token = peekToken();
            if (token.getKind() === _TokenKind.TokenKind.ASSIGN) {
                // a=b
                if (expr === null) {
                    expr = _astNullLiteral.NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 1));
                }
                nextToken();
                var assignedValue = eatLogicalOrExpression();
                return _astAssign.Assign.create(toPosToken(token), expr, assignedValue);
            }

            if (token.getKind() === _TokenKind.TokenKind.ELVIS) {
                // a?:b (a if it isn't null, otherwise b)
                if (expr === null) {
                    expr = _astNullLiteral.NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 2));
                }
                nextToken(); // elvis has left the building
                var valueIfNull = eatExpression();
                if (valueIfNull === null) {
                    valueIfNull = _astNullLiteral.NullLiteral.create(toPosBounds(token.startPos + 1, token.endPos + 1));
                }
                return _astElvis.Elvis.create(toPosToken(token), expr, valueIfNull);
            }

            if (token.getKind() === _TokenKind.TokenKind.QMARK) {
                // a?b:c
                if (expr === null) {
                    expr = _astNullLiteral.NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 1));
                }
                nextToken();
                var ifTrueExprValue = eatExpression();
                eatToken(_TokenKind.TokenKind.COLON);
                var ifFalseExprValue = eatExpression();
                return _astTernary.Ternary.create(toPosToken(token), expr, ifTrueExprValue, ifFalseExprValue);
            }
        }
        return expr;
    }

    //logicalOrExpression : logicalAndExpression (OR^ logicalAndExpression)*;
    function eatLogicalOrExpression() {
        var expr = eatLogicalAndExpression();
        while (peekIdentifierToken('or') || peekTokenOne(_TokenKind.TokenKind.SYMBOLIC_OR)) {
            var token = nextToken(); //consume OR
            var rhExpr = eatLogicalAndExpression();
            checkOperands(token, expr, rhExpr);
            expr = _astOpOr.OpOr.create(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    // logicalAndExpression : relationalExpression (AND^ relationalExpression)*;
    function eatLogicalAndExpression() {
        var expr = eatRelationalExpression();
        while (peekIdentifierToken('and') || peekTokenOne(_TokenKind.TokenKind.SYMBOLIC_AND)) {
            var token = nextToken(); // consume 'AND'
            var rhExpr = eatRelationalExpression();
            checkOperands(token, expr, rhExpr);
            expr = _astOpAnd.OpAnd.create(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    // relationalExpression : sumExpression (relationalOperator^ sumExpression)?;
    function eatRelationalExpression() {
        var expr = eatSumExpression();
        var relationalOperatorToken = maybeEatRelationalOperator();
        if (relationalOperatorToken !== null) {
            var token = nextToken(); // consume relational operator token
            var rhExpr = eatSumExpression();
            checkOperands(token, expr, rhExpr);
            var tk = relationalOperatorToken.kind;

            if (relationalOperatorToken.isNumericRelationalOperator()) {
                var pos = toPosToken(token);
                if (tk === _TokenKind.TokenKind.GT) {
                    return _astOpGT.OpGT.create(pos, expr, rhExpr);
                }
                if (tk === _TokenKind.TokenKind.LT) {
                    return _astOpLT.OpLT.create(pos, expr, rhExpr);
                }
                if (tk === _TokenKind.TokenKind.LE) {
                    return _astOpLE.OpLE.create(pos, expr, rhExpr);
                }
                if (tk === _TokenKind.TokenKind.GE) {
                    return _astOpGE.OpGE.create(pos, expr, rhExpr);
                }
                if (tk === _TokenKind.TokenKind.EQ) {
                    return _astOpEQ.OpEQ.create(pos, expr, rhExpr);
                }
                //Assert.isTrue(tk === TokenKind.NE);
                return _astOpNE.OpNE.create(pos, expr, rhExpr);
            }

            if (tk === _TokenKind.TokenKind.INSTANCEOF) {
                return new OperatorInstanceof(toPosToken(token), expr, rhExpr);
            }

            if (tk === _TokenKind.TokenKind.MATCHES) {
                return new OperatorMatches(toPosToken(token), expr, rhExpr);
            }

            //Assert.isTrue(tk === TokenKind.BETWEEN);
            return new OperatorBetween(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    //sumExpression: productExpression ( (PLUS^ | MINUS^) productExpression)*;
    function eatSumExpression() {
        var expr = eatProductExpression();
        while (peekTokenAny(_TokenKind.TokenKind.PLUS, _TokenKind.TokenKind.MINUS, _TokenKind.TokenKind.INC)) {
            var token = nextToken(); //consume PLUS or MINUS or INC
            var rhExpr = eatProductExpression();
            checkRightOperand(token, rhExpr);
            if (token.getKind() === _TokenKind.TokenKind.PLUS) {
                expr = _astOpPlus.OpPlus.create(toPosToken(token), expr, rhExpr);
            } else if (token.getKind() === _TokenKind.TokenKind.MINUS) {
                expr = _astOpMinus.OpMinus.create(toPosToken(token), expr, rhExpr);
            }
        }
        return expr;
    }

    // productExpression: powerExpr ((STAR^ | DIV^| MOD^) powerExpr)* ;
    function eatProductExpression() {
        var expr = eatPowerIncDecExpression();
        while (peekTokenAny(_TokenKind.TokenKind.STAR, _TokenKind.TokenKind.DIV, _TokenKind.TokenKind.MOD)) {
            var token = nextToken(); // consume STAR/DIV/MOD
            var rhExpr = eatPowerIncDecExpression();
            checkOperands(token, expr, rhExpr);
            if (token.getKind() === _TokenKind.TokenKind.STAR) {
                expr = _astOpMultiply.OpMultiply.create(toPosToken(token), expr, rhExpr);
            } else if (token.getKind() === _TokenKind.TokenKind.DIV) {
                expr = _astOpDivide.OpDivide.create(toPosToken(token), expr, rhExpr);
            } else {
                //Assert.isTrue(token.getKind() === TokenKind.MOD);
                expr = _astOpModulus.OpModulus.create(toPosToken(token), expr, rhExpr);
            }
        }
        return expr;
    }

    // powerExpr  : unaryExpression (POWER^ unaryExpression)? (INC || DEC) ;
    function eatPowerIncDecExpression() {
        var expr = eatUnaryExpression(),
            token;

        if (peekTokenOne(_TokenKind.TokenKind.POWER)) {
            token = nextToken(); //consume POWER
            var rhExpr = eatUnaryExpression();
            checkRightOperand(token, rhExpr);
            return _astOpPower.OpPower.create(toPosToken(token), expr, rhExpr);
        }

        if (expr !== null && peekTokenAny(_TokenKind.TokenKind.INC, _TokenKind.TokenKind.DEC)) {
            token = nextToken(); //consume INC/DEC
            if (token.getKind() === _TokenKind.TokenKind.INC) {
                return _astOpInc.OpInc.create(toPosToken(token), true, expr);
            }
            return _astOpDec.OpDec.create(toPosToken(token), true, expr);
        }

        return expr;
    }

    // unaryExpression: (PLUS^ | MINUS^ | BANG^ | INC^ | DEC^) unaryExpression | primaryExpression ;
    function eatUnaryExpression() {
        var token, expr;

        if (peekTokenAny(_TokenKind.TokenKind.PLUS, _TokenKind.TokenKind.MINUS, _TokenKind.TokenKind.NOT)) {
            token = nextToken();
            expr = eatUnaryExpression();
            if (token.getKind() === _TokenKind.TokenKind.NOT) {
                return _astOpNot.OpNot.create(toPosToken(token), expr);
            }

            if (token.getKind() === _TokenKind.TokenKind.PLUS) {
                return _astOpPlus.OpPlus.create(toPosToken(token), expr);
            }
            //Assert.isTrue(token.getKind() === TokenKind.MINUS);
            return _astOpMinus.OpMinus.create(toPosToken(token), expr);
        }
        if (peekTokenAny(_TokenKind.TokenKind.INC, _TokenKind.TokenKind.DEC)) {
            token = nextToken();
            expr = eatUnaryExpression();
            if (token.getKind() === _TokenKind.TokenKind.INC) {
                return _astOpInc.OpInc.create(toPosToken(token), false, expr);
            }
            return _astOpDec.OpDec.create(toPosToken(token), false, expr);
        }

        return eatPrimaryExpression();
    }

    // primaryExpression : startNode (node)? -> ^(EXPRESSION startNode (node)?);
    function eatPrimaryExpression() {
        var nodes = [];
        var start = eatStartNode(); // always a start node
        nodes.push(start);
        while (maybeEatNode()) {
            nodes.push(pop());
        }
        if (nodes.length === 1) {
            return nodes[0];
        }
        return _astCompoundExpression.CompoundExpression.create(toPosBounds(start.getStartPosition(), nodes[nodes.length - 1].getEndPosition()), nodes);
    }

    // node : ((DOT dottedNode) | (SAFE_NAVI dottedNode) | nonDottedNode)+;
    function maybeEatNode() {
        var expr = null;
        if (peekTokenAny(_TokenKind.TokenKind.DOT, _TokenKind.TokenKind.SAFE_NAVI)) {
            expr = eatDottedNode();
        } else {
            expr = maybeEatNonDottedNode();
        }

        if (expr === null) {
            return false;
        } else {
            push(expr);
            return true;
        }
    }

    // nonDottedNode: indexer;
    function maybeEatNonDottedNode() {
        if (peekTokenOne(_TokenKind.TokenKind.LSQUARE)) {
            if (maybeEatIndexer()) {
                return pop();
            }
        }
        return null;
    }

    //dottedNode
    // : ((methodOrProperty
    //	  | functionOrVar
    //    | projection
    //    | selection
    //    | firstSelection
    //    | lastSelection
    //    ))
    //	;
    function eatDottedNode() {
        var token = nextToken(); // it was a '.' or a '?.'
        var nullSafeNavigation = token.getKind() === _TokenKind.TokenKind.SAFE_NAVI;
        if (maybeEatMethodOrProperty(nullSafeNavigation) || maybeEatFunctionOrVar() || maybeEatProjection(nullSafeNavigation) || maybeEatSelection(nullSafeNavigation)) {
            return pop();
        }
        if (peekToken() === null) {
            // unexpectedly ran out of data
            raiseInternalException(token.startPos, 'OOD');
        } else {
            raiseInternalException(token.startPos, 'UNEXPECTED_DATA_AFTER_DOT', toString(peekToken()));
        }
        return null;
    }

    // functionOrVar
    // : (POUND ID LPAREN) => function
    // | var
    //
    // function : POUND id=ID methodArgs -> ^(FUNCTIONREF[$id] methodArgs);
    // var : POUND id=ID -> ^(VARIABLEREF[$id]);
    function maybeEatFunctionOrVar() {
        if (!peekTokenOne(_TokenKind.TokenKind.HASH)) {
            return false;
        }
        var token = nextToken();
        var functionOrVariableName = eatToken(_TokenKind.TokenKind.IDENTIFIER);
        var args = maybeEatMethodArgs();
        if (args === null) {
            push(_astVariableReference.VariableReference.create(functionOrVariableName.data, toPosBounds(token.startPos, functionOrVariableName.endPos)));
            return true;
        }

        push(_astFunctionReference.FunctionReference.create(functionOrVariableName.data, toPosBounds(token.startPos, functionOrVariableName.endPos), args));
        return true;
    }

    // methodArgs : LPAREN! (argument (COMMA! argument)* (COMMA!)?)? RPAREN!;
    function maybeEatMethodArgs() {
        if (!peekTokenOne(_TokenKind.TokenKind.LPAREN)) {
            return null;
        }
        var args = [];
        consumeArguments(args);
        eatToken(_TokenKind.TokenKind.RPAREN);
        return args;
    }

    function eatConstructorArgs(accumulatedArguments) {
        if (!peekTokenOne(_TokenKind.TokenKind.LPAREN)) {
            raiseInternalException(toPosToken(peekToken()), 'MISSING_CONSTRUCTOR_ARGS');
        }
        consumeArguments(accumulatedArguments);
        eatToken(_TokenKind.TokenKind.RPAREN);
    }

    /**
     * Used for consuming arguments for either a method or a constructor call
     */
    function consumeArguments(accumulatedArguments) {
        var pos = peekToken().startPos;
        var next;
        do {
            nextToken(); // consume ( (first time through) or comma (subsequent times)
            var token = peekToken();
            if (token === null) {
                raiseInternalException(pos, 'RUN_OUT_OF_ARGUMENTS');
            }
            if (token.getKind() !== _TokenKind.TokenKind.RPAREN) {
                accumulatedArguments.push(eatExpression());
            }
            next = peekToken();
        } while (next !== null && next.kind === _TokenKind.TokenKind.COMMA);

        if (next === null) {
            raiseInternalException(pos, 'RUN_OUT_OF_ARGUMENTS');
        }
    }

    function positionOf(token) {
        if (token === null) {
            // if null assume the problem is because the right token was
            // not found at the end of the expression
            return expressionString.length;
        }
        return token.startPos;
    }

    //startNode
    // : parenExpr | literal
    //	    | type
    //	    | methodOrProperty
    //	    | functionOrVar
    //	    | projection
    //	    | selection
    //	    | firstSelection
    //	    | lastSelection
    //	    | indexer
    //	    | constructor
    function eatStartNode() {
        if (maybeEatLiteral()) {
            return pop();
        } else if (maybeEatParenExpression()) {
            return pop();
        } else if (maybeEatTypeReference() || maybeEatNullReference() || maybeEatConstructorReference() || maybeEatMethodOrProperty(false) || maybeEatFunctionOrVar()) {
            return pop();
        } else if (maybeEatBeanReference()) {
            return pop();
        } else if (maybeEatProjection(false) || maybeEatSelection(false) || maybeEatIndexer()) {
            return pop();
        } else if (maybeEatInlineListOrMap()) {
            return pop();
        } else {
            return null;
        }
    }

    // parse: @beanname @'bean.name'
    // quoted if dotted
    function maybeEatBeanReference() {
        if (peekTokenOne(_TokenKind.TokenKind.BEAN_REF)) {
            var beanRefToken = nextToken();
            var beanNameToken = null;
            var beanName = null;
            if (peekTokenOne(_TokenKind.TokenKind.IDENTIFIER)) {
                beanNameToken = eatToken(_TokenKind.TokenKind.IDENTIFIER);
                beanName = beanNameToken.data;
            } else if (peekTokenOne(_TokenKind.TokenKind.LITERAL_STRING)) {
                beanNameToken = eatToken(_TokenKind.TokenKind.LITERAL_STRING);
                beanName = beanNameToken.stringValue();
                beanName = beanName.substring(1, beanName.length() - 1);
            } else {
                raiseInternalException(beanRefToken.startPos, 'INVALID_BEAN_REFERENCE');
            }

            var beanReference = new BeanReference(toPosToken(beanNameToken), beanName);
            push(beanReference);
            return true;
        }
        return false;
    }

    function maybeEatTypeReference() {
        if (peekTokenOne(_TokenKind.TokenKind.IDENTIFIER)) {
            var typeName = peekToken();
            if (typeName.stringValue() !== 'T') {
                return false;
            }
            // It looks like a type reference but is T being used as a map key?
            var token = nextToken();
            if (peekTokenOne(_TokenKind.TokenKind.RSQUARE)) {
                // looks like 'T]' (T is map key)
                push(_astPropertyReference.PropertyReference.create(token.stringValue(), toPosToken(token)));
                return true;
            }
            eatToken(_TokenKind.TokenKind.LPAREN);
            var node = eatPossiblyQualifiedId();
            // dotted qualified id
            // Are there array dimensions?
            var dims = 0;
            while (peekTokenConsumeIfMatched(_TokenKind.TokenKind.LSQUARE, true)) {
                eatToken(_TokenKind.TokenKind.RSQUARE);
                dims++;
            }
            eatToken(_TokenKind.TokenKind.RPAREN);
            push(new TypeReference(toPosToken(typeName), node, dims));
            return true;
        }
        return false;
    }

    function maybeEatNullReference() {
        if (peekTokenOne(_TokenKind.TokenKind.IDENTIFIER)) {
            var nullToken = peekToken();
            if (nullToken.stringValue().toLowerCase() !== 'null') {
                return false;
            }
            nextToken();
            push(_astNullLiteral.NullLiteral.create(toPosToken(nullToken)));
            return true;
        }
        return false;
    }

    //projection: PROJECT^ expression RCURLY!;
    function maybeEatProjection(nullSafeNavigation) {
        var token = peekToken();
        if (!peekTokenConsumeIfMatched(_TokenKind.TokenKind.PROJECT, true)) {
            return false;
        }
        var expr = eatExpression();
        eatToken(_TokenKind.TokenKind.RSQUARE);
        push(_astProjection.Projection.create(nullSafeNavigation, toPosToken(token), expr));
        return true;
    }

    // list = LCURLY (element (COMMA element)*) RCURLY
    // map  = LCURLY (key ':' value (COMMA key ':' value)*) RCURLY
    function maybeEatInlineListOrMap() {
        var token = peekToken(),
            listElements = [];

        if (!peekTokenConsumeIfMatched(_TokenKind.TokenKind.LCURLY, true)) {
            return false;
        }
        var expr = null;
        var closingCurly = peekToken();
        if (peekTokenConsumeIfMatched(_TokenKind.TokenKind.RCURLY, true)) {
            // empty list '{}'
            expr = _astInlineList.InlineList.create(toPosBounds(token.startPos, closingCurly.endPos));
        } else if (peekTokenConsumeIfMatched(_TokenKind.TokenKind.COLON, true)) {
            closingCurly = eatToken(_TokenKind.TokenKind.RCURLY);
            // empty map '{:}'
            expr = _astInlineMap.InlineMap.create(toPosBounds(token.startPos, closingCurly.endPos));
        } else {
            var firstExpression = eatExpression();
            // Next is either:
            // '}' - end of list
            // ',' - more expressions in this list
            // ':' - this is a map!

            if (peekTokenOne(_TokenKind.TokenKind.RCURLY)) {
                // list with one item in it
                listElements.push(firstExpression);
                closingCurly = eatToken(_TokenKind.TokenKind.RCURLY);
                expr = _astInlineList.InlineList.create(toPosBounds(token.startPos, closingCurly.endPos), listElements);
            } else if (peekTokenConsumeIfMatched(_TokenKind.TokenKind.COMMA, true)) {
                // multi item list
                listElements.push(firstExpression);
                do {
                    listElements.push(eatExpression());
                } while (peekTokenConsumeIfMatched(_TokenKind.TokenKind.COMMA, true));
                closingCurly = eatToken(_TokenKind.TokenKind.RCURLY);
                expr = _astInlineList.InlineList.create(toPosToken(token.startPos, closingCurly.endPos), listElements);
            } else if (peekTokenConsumeIfMatched(_TokenKind.TokenKind.COLON, true)) {
                // map!
                var mapElements = [];
                mapElements.push(firstExpression);
                mapElements.push(eatExpression());
                while (peekTokenConsumeIfMatched(_TokenKind.TokenKind.COMMA, true)) {
                    mapElements.push(eatExpression());
                    eatToken(_TokenKind.TokenKind.COLON);
                    mapElements.push(eatExpression());
                }
                closingCurly = eatToken(_TokenKind.TokenKind.RCURLY);
                expr = _astInlineMap.InlineMap.create(toPosBounds(token.startPos, closingCurly.endPos), mapElements);
            } else {
                raiseInternalException(token.startPos, 'OOD');
            }
        }
        push(expr);
        return true;
    }

    function maybeEatIndexer() {
        var token = peekToken();
        if (!peekTokenConsumeIfMatched(_TokenKind.TokenKind.LSQUARE, true)) {
            return false;
        }
        var expr = eatExpression();
        eatToken(_TokenKind.TokenKind.RSQUARE);
        push(_astIndexer.Indexer.create(toPosToken(token), expr));
        return true;
    }

    function maybeEatSelection(nullSafeNavigation) {
        var token = peekToken();
        if (!peekSelectToken()) {
            return false;
        }
        nextToken();
        var expr = eatExpression();
        if (expr === null) {
            raiseInternalException(toPosToken(token), 'MISSING_SELECTION_EXPRESSION');
        }
        eatToken(_TokenKind.TokenKind.RSQUARE);
        if (token.getKind() === _TokenKind.TokenKind.SELECT_FIRST) {
            push(_astSelection.Selection.create(nullSafeNavigation, _astSelection.Selection.FIRST, toPosToken(token), expr));
        } else if (token.getKind() === _TokenKind.TokenKind.SELECT_LAST) {
            push(_astSelection.Selection.create(nullSafeNavigation, _astSelection.Selection.LAST, toPosToken(token), expr));
        } else {
            push(_astSelection.Selection.create(nullSafeNavigation, _astSelection.Selection.ALL, toPosToken(token), expr));
        }
        return true;
    }

    /**
     * Eat an identifier, possibly qualified (meaning that it is dotted).
     * TODO AndyC Could create complete identifiers (a.b.c) here rather than a sequence of them? (a, b, c)
     */
    function eatPossiblyQualifiedId() {
        var qualifiedIdPieces = [];
        var node = peekToken();
        while (isValidQualifiedId(node)) {
            nextToken();
            if (node.kind !== _TokenKind.TokenKind.DOT) {
                qualifiedIdPieces.push(new Identifier(node.stringValue(), toPosToken(node)));
            }
            node = peekToken();
        }
        if (!qualifiedIdPieces.length) {
            if (node === null) {
                raiseInternalException(expressionString.length(), 'OOD');
            }
            raiseInternalException(node.startPos, 'NOT_EXPECTED_TOKEN', 'qualified ID', node.getKind().toString().toLowerCase());
        }
        var pos = toPosBounds(qualifiedIdPieces[0].getStartPosition(), qualifiedIdPieces[qualifiedIdPieces.length - 1].getEndPosition());
        return new QualifiedIdentifier(pos, qualifiedIdPieces);
    }

    function isValidQualifiedId(node) {
        if (node === null || node.kind === _TokenKind.TokenKind.LITERAL_STRING) {
            return false;
        }
        if (node.kind === _TokenKind.TokenKind.DOT || node.kind === _TokenKind.TokenKind.IDENTIFIER) {
            return true;
        }
        var value = node.stringValue();
        return value.length && VALID_QUALIFIED_ID_PATTERN.test(value);
    }

    // This is complicated due to the support for dollars in identifiers.  Dollars are normally separate tokens but
    // there we want to combine a series of identifiers and dollars into a single identifier
    function maybeEatMethodOrProperty(nullSafeNavigation) {
        if (peekTokenOne(_TokenKind.TokenKind.IDENTIFIER)) {
            var methodOrPropertyName = nextToken();
            var args = maybeEatMethodArgs();
            if (args === null) {
                // property
                push(_astPropertyReference.PropertyReference.create(nullSafeNavigation, methodOrPropertyName.stringValue(), toPosToken(methodOrPropertyName)));
                return true;
            }
            // methodreference
            push(_astMethodReference.MethodReference.create(nullSafeNavigation, methodOrPropertyName.stringValue(), toPosToken(methodOrPropertyName), args));
            // TODO what is the end position for a method reference? the name or the last arg?
            return true;
        }
        return false;
    }

    //constructor
    //:	('new' qualifiedId LPAREN) => 'new' qualifiedId ctorArgs -> ^(CONSTRUCTOR qualifiedId ctorArgs)
    function maybeEatConstructorReference() {
        if (peekIdentifierToken('new')) {
            var newToken = nextToken();
            // It looks like a constructor reference but is NEW being used as a map key?
            if (peekTokenOne(_TokenKind.TokenKind.RSQUARE)) {
                // looks like 'NEW]' (so NEW used as map key)
                push(_astPropertyReference.PropertyReference.create(newToken.stringValue(), toPosToken(newToken)));
                return true;
            }
            var possiblyQualifiedConstructorName = eatPossiblyQualifiedId();
            var nodes = [];
            nodes.push(possiblyQualifiedConstructorName);
            if (peekTokenOne(_TokenKind.TokenKind.LSQUARE)) {
                // array initializer
                var dimensions = [];
                while (peekTokenConsumeIfMatched(_TokenKind.TokenKind.LSQUARE, true)) {
                    if (!peekTokenOne(_TokenKind.TokenKind.RSQUARE)) {
                        dimensions.push(eatExpression());
                    } else {
                        dimensions.push(null);
                    }
                    eatToken(_TokenKind.TokenKind.RSQUARE);
                }
                if (maybeEatInlineListOrMap()) {
                    nodes.push(pop());
                }
                push(new ConstructorReference(toPosToken(newToken), dimensions, nodes));
            } else {
                // regular constructor invocation
                eatConstructorArgs(nodes);
                // TODO correct end position?
                push(new ConstructorReference(toPosToken(newToken), nodes));
            }
            return true;
        }
        return false;
    }

    function push(newNode) {
        constructedNodes.push(newNode);
    }

    function pop() {
        return constructedNodes.pop();
    }

    //	literal
    //  : INTEGER_LITERAL
    //	| boolLiteral
    //	| STRING_LITERAL
    //  | HEXADECIMAL_INTEGER_LITERAL
    //  | REAL_LITERAL
    //	| DQ_STRING_LITERAL
    //	| NULL_LITERAL
    function maybeEatLiteral() {
        var token = peekToken();
        if (token === null) {
            return false;
        }
        if (token.getKind() === _TokenKind.TokenKind.LITERAL_INT || token.getKind() === _TokenKind.TokenKind.LITERAL_LONG) {
            push(_astNumberLiteral.NumberLiteral.create(parseInt(token.stringValue(), 10), toPosToken(token)));
        } else if (token.getKind() === _TokenKind.TokenKind.LITERAL_REAL || token.getKind() === _TokenKind.TokenKind.LITERAL_REAL_FLOAT) {
            push(_astNumberLiteral.NumberLiteral.create(parseFloat(token.stringValue()), toPosToken(token)));
        } else if (token.getKind() === _TokenKind.TokenKind.LITERAL_HEXINT || token.getKind() === _TokenKind.TokenKind.LITERAL_HEXLONG) {
            push(_astNumberLiteral.NumberLiteral.create(parseInt(token.stringValue(), 16), toPosToken(token)));
        } else if (peekIdentifierToken('true')) {
            push(_astBooleanLiteral.BooleanLiteral.create(true, toPosToken(token)));
        } else if (peekIdentifierToken('false')) {
            push(_astBooleanLiteral.BooleanLiteral.create(false, toPosToken(token)));
        } else if (token.getKind() === _TokenKind.TokenKind.LITERAL_STRING) {
            push(_astStringLiteral.StringLiteral.create(token.stringValue(), toPosToken(token)));
        } else {
            return false;
        }
        nextToken();
        return true;
    }

    //parenExpr : LPAREN! expression RPAREN!;
    function maybeEatParenExpression() {
        if (peekTokenOne(_TokenKind.TokenKind.LPAREN)) {
            nextToken();
            var expr = eatExpression();
            eatToken(_TokenKind.TokenKind.RPAREN);
            push(expr);
            return true;
        } else {
            return false;
        }
    }

    // relationalOperator
    // : EQUAL | NOT_EQUAL | LESS_THAN | LESS_THAN_OR_EQUAL | GREATER_THAN
    // | GREATER_THAN_OR_EQUAL | INSTANCEOF | BETWEEN | MATCHES
    function maybeEatRelationalOperator() {
        var token = peekToken();
        if (token === null) {
            return null;
        }
        if (token.isNumericRelationalOperator()) {
            return token;
        }
        if (token.isIdentifier()) {
            var idString = token.stringValue();
            if (idString.toLowerCase() === 'instanceof') {
                return token.asInstanceOfToken();
            }
            if (idString.toLowerCase() === 'matches') {
                return token.asMatchesToken();
            }
            if (idString.toLowerCase() === 'between') {
                return token.asBetweenToken();
            }
        }
        return null;
    }

    function eatToken(expectedKind) {
        var token = nextToken();
        if (token === null) {
            raiseInternalException(expressionString.length, 'OOD');
        }
        if (token.getKind() !== expectedKind) {
            raiseInternalException(token.startPos, 'NOT_EXPECTED_TOKEN', expectedKind.toString().toLowerCase(), token.getKind().toString().toLowerCase());
        }
        return token;
    }

    function peekTokenOne(desiredTokenKind) {
        return peekTokenConsumeIfMatched(desiredTokenKind, false);
    }

    function peekTokenConsumeIfMatched(desiredTokenKind, consumeIfMatched) {
        if (!moreTokens()) {
            return false;
        }
        var token = peekToken();
        if (token.getKind() === desiredTokenKind) {
            if (consumeIfMatched) {
                tokenStreamPointer++;
            }
            return true;
        }

        if (desiredTokenKind === _TokenKind.TokenKind.IDENTIFIER) {
            // might be one of the textual forms of the operators (e.g. NE for !== ) - in which case we can treat it as an identifier
            // The list is represented here: Tokenizer.alternativeOperatorNames and those ones are in order in the TokenKind enum
            if (token.getKind().ordinal() >= _TokenKind.TokenKind.DIV.ordinal() && token.getKind().ordinal() <= _TokenKind.TokenKind.NOT.ordinal() && token.data !== null) {
                // if token.data were null, we'd know it wasn'token the textual form, it was the symbol form
                return true;
            }
        }
        return false;
    }

    function peekTokenAny() {
        if (!moreTokens()) {
            return false;
        }
        var token = peekToken();
        var args = Array.prototype.slice.call(arguments);
        for (var i = 0, l = args.length; i < l; i += 1) {
            if (token.getKind() === args[i]) {
                return true;
            }
        }
        return false;
    }

    function peekIdentifierToken(identifierString) {
        if (!moreTokens()) {
            return false;
        }
        var token = peekToken();
        return token.getKind() === _TokenKind.TokenKind.IDENTIFIER && token.stringValue().toLowerCase() === identifierString.toLowerCase();
    }

    function peekSelectToken() {
        if (!moreTokens()) {
            return false;
        }
        var token = peekToken();
        return token.getKind() === _TokenKind.TokenKind.SELECT || token.getKind() === _TokenKind.TokenKind.SELECT_FIRST || token.getKind() === _TokenKind.TokenKind.SELECT_LAST;
    }

    function moreTokens() {
        return tokenStreamPointer < tokenStream.length;
    }

    function nextToken() {
        if (tokenStreamPointer >= tokenStreamLength) {
            return null;
        }
        return tokenStream[tokenStreamPointer++];
    }

    function peekToken() {
        if (tokenStreamPointer >= tokenStreamLength) {
            return null;
        }
        return tokenStream[tokenStreamPointer];
    }

    function raiseInternalException(pos, message, expected, actual) {
        if (expected) {
            message += '\nExpected: ' + expected;
        }
        if (actual) {
            message += '\nActual: ' + actual;
        }
        throw {
            name: 'InternalParseException',
            message: 'Error occurred while attempting to parse expression \'' + expressionString + '\' at position ' + pos + '. Message: ' + message
        };
    }

    function toString(token) {
        if (token.getKind().hasPayload()) {
            return token.stringValue();
        }
        return token.getKind().toString().toLowerCase();
    }

    function checkOperands(token, left, right) {
        checkLeftOperand(token, left);
        checkRightOperand(token, right);
    }

    function checkLeftOperand(token, operandExpression) {
        if (operandExpression === null) {
            raiseInternalException(token.startPos, 'LEFT_OPERAND_PROBLEM');
        }
    }

    function checkRightOperand(token, operandExpression) {
        if (operandExpression === null) {
            raiseInternalException(token.startPos, 'RIGHT_OPERAND_PROBLEM');
        }
    }

    /**
     * Compress the start and end of a token into a single int.
     */
    function toPosToken(token) {
        return (token.startPos << 16) + token.endPos;
    }

    function toPosBounds(start, end) {
        return (start << 16) + end;
    }

    return {
        setConfiguration: setConfiguration,
        parse: parse
    };
};
exports.SpelExpressionParser = SpelExpressionParser;

},{"./TokenKind":5,"./Tokenizer":6,"./ast/Assign":7,"./ast/BooleanLiteral":8,"./ast/CompoundExpression":9,"./ast/Elvis":10,"./ast/FunctionReference":11,"./ast/Indexer":12,"./ast/InlineList":13,"./ast/InlineMap":14,"./ast/MethodReference":15,"./ast/NullLiteral":16,"./ast/NumberLiteral":17,"./ast/OpAnd":18,"./ast/OpDec":19,"./ast/OpDivide":20,"./ast/OpEQ":21,"./ast/OpGE":22,"./ast/OpGT":23,"./ast/OpInc":24,"./ast/OpLE":25,"./ast/OpLT":26,"./ast/OpMinus":27,"./ast/OpModulus":28,"./ast/OpMultiply":29,"./ast/OpNE":30,"./ast/OpNot":31,"./ast/OpOr":32,"./ast/OpPlus":33,"./ast/OpPower":34,"./ast/Projection":35,"./ast/PropertyReference":36,"./ast/Selection":37,"./ast/StringLiteral":39,"./ast/Ternary":40,"./ast/VariableReference":41}],3:[function(require,module,exports){
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

/**
 * @author Ben March
 * @since 0.2.0
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
function create(authentication, principal) {
    var context = {};

    context.authentication = authentication || {};
    context.principal = principal || {};

    context.hasRole = function (role) {
        var hasRole = false;

        if (!role) {
            return false;
        }
        if (!context.authentication && !Array.isArray(context.authentication.authorities)) {
            return false;
        }

        context.authentication.authorities.forEach(function (grantedAuthority) {
            if (grantedAuthority.authority.toLowerCase() === role.toLowerCase()) {
                hasRole = true;
            }
        });

        return hasRole;
    };

    context.hasPermission = function () /*variable arguments*/{
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 1) {
            return context.hasRole(args[0]);
        }
    };

    return context;
}

var StandardContext = {
    create: create
};
exports.StandardContext = StandardContext;

},{}],4:[function(require,module,exports){
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

/**
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _TokenKind = require('./TokenKind');

function Token(tokenKind, tokenData, startPos, endPos) {
    this.kind = tokenKind;
    this.startPos = startPos;
    this.endPos = endPos;
    if (tokenData) {
        this.data = tokenData;
    }
}

Token.prototype.getKind = function () {
    return this.kind;
};

Token.prototype.toString = function () {
    var s = '[';
    s += this.kind.toString();
    if (this.kind.hasPayload()) {
        s += ':' + this.data;
    }
    s += ']';
    s += '(' + this.startPos + ',' + this.endPos + ')';
    return s;
};

Token.prototype.isIdentifier = function () {
    return this.kind === _TokenKind.TokenKind.IDENTIFIER;
};

Token.prototype.isNumericRelationalOperator = function () {
    return this.kind === _TokenKind.TokenKind.GT || this.kind === _TokenKind.TokenKind.GE || this.kind === _TokenKind.TokenKind.LT || this.kind === _TokenKind.TokenKind.LE || this.kind === _TokenKind.TokenKind.EQ || this.kind === _TokenKind.TokenKind.NE;
};

Token.prototype.stringValue = function () {
    return this.data;
};

Token.prototype.asInstanceOfToken = function () {
    return new Token(_TokenKind.TokenKind.INSTANCEOF, this.startPos, this.endPos);
};

Token.prototype.asMatchesToken = function () {
    return new Token(_TokenKind.TokenKind.MATCHES, this.startPos, this.endPos);
};

Token.prototype.asBetweenToken = function () {
    return new Token(_TokenKind.TokenKind.BETWEEN, this.startPos, this.endPos);
};

Token.prototype.getStartPosition = function () {
    return this.startPos;
};

Token.prototype.getEndPosition = function () {
    return this.endPos;
};

exports.Token = Token;

},{"./TokenKind":5}],5:[function(require,module,exports){
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

/**
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var types = {

    LITERAL_INT: 1, //tested

    LITERAL_LONG: 2, //tested

    LITERAL_HEXINT: 3, //tested

    LITERAL_HEXLONG: 4, //tested

    LITERAL_STRING: 5, //tested

    LITERAL_REAL: 6, //tested

    LITERAL_REAL_FLOAT: 7, //tested

    LPAREN: '(', //tested

    RPAREN: ')', //tested

    COMMA: ',', //tested

    IDENTIFIER: 0, //tested

    COLON: ':', //tested

    HASH: '#', //tested

    RSQUARE: ']', //tested

    LSQUARE: '[', //tested

    LCURLY: '{', //tested

    RCURLY: '}', //tested

    DOT: '.', //tested

    PLUS: '+', //tested

    STAR: '*', //tested

    MINUS: '-', //tested

    SELECT_FIRST: '^[', //tested

    SELECT_LAST: '$[', //tested

    QMARK: '?', //tested

    PROJECT: '![', //tested

    DIV: '/', //tested

    GE: '>=', //tested

    GT: '>', //tested

    LE: '<=', //tested

    LT: '<', //tested

    EQ: '==', //tested

    NE: '!=', //tested

    MOD: '%', //tested

    NOT: '!', //tested

    ASSIGN: '=', //tested

    INSTANCEOF: 'instanceof', //test fails

    MATCHES: 'matches', //test fails

    BETWEEN: 'between', //test fails

    SELECT: '?[', //tested

    POWER: '^', //tested

    ELVIS: '?:', //tested

    SAFE_NAVI: '?.', //tested

    BEAN_REF: '@', //tested

    SYMBOLIC_OR: '||', //tested

    SYMBOLIC_AND: '&&', //tested

    INC: '++', //tested

    DEC: '--' //tested
};

function TokenKind(type) {
    this.type = type;
    this.tokenChars = types[type];
    this._hasPayload = typeof types[type] !== 'string';
    if (typeof types[type] === 'number') {
        this._ordinal = types[type];
    }
}

//create enum
for (var t in types) {
    if (types.hasOwnProperty(t)) {
        TokenKind[t] = new TokenKind(t);
    }
}

TokenKind.prototype.toString = function () {
    return this.type + (this.tokenChars.length !== 0 ? '(' + this.tokenChars + ')' : '');
};

TokenKind.prototype.getLength = function () {
    return this.tokenChars.length;
};

TokenKind.prototype.hasPayload = function () {
    return this._hasPayload;
};

TokenKind.prototype.valueOf = function (id) {
    for (var t in types) {
        if (types.hasOwnProperty(t) && types[t] === id) {
            return TokenKind[t];
        }
    }
};

TokenKind.prototype.ordinal = function () {
    return this._ordinal;
};

exports.TokenKind = TokenKind;

},{}],6:[function(require,module,exports){
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

/**
 * @author Andy Clement
 * @author Phillip Webb
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _Token = require('./Token');

var _TokenKind = require('./TokenKind');

var ALTERNATIVE_OPERATOR_NAMES = ['DIV', 'EQ', 'GE', 'GT', 'LE', 'LT', 'MOD', 'NE', 'NOT'],
    FLAGS = [],
    IS_DIGIT = 1,
    IS_HEXDIGIT = 2,
    IS_ALPHA = 4;

function init() {
    var ch;

    for (ch = '0'.charCodeAt(0); ch <= '9'.charCodeAt(0); ch += 1) {
        FLAGS[ch] |= IS_DIGIT | IS_HEXDIGIT;
    }
    for (ch = 'A'.charCodeAt(0); ch <= 'F'.charCodeAt(0); ch += 1) {
        FLAGS[ch] |= IS_HEXDIGIT;
    }
    for (ch = 'a'.charCodeAt(0); ch <= 'f'.charCodeAt(0); ch += 1) {
        FLAGS[ch] |= IS_HEXDIGIT;
    }
    for (ch = 'A'.charCodeAt(0); ch <= 'Z'.charCodeAt(0); ch += 1) {
        FLAGS[ch] |= IS_ALPHA;
    }
    for (ch = 'a'.charCodeAt(0); ch <= 'z'.charCodeAt(0); ch += 1) {
        FLAGS[ch] |= IS_ALPHA;
    }
}

init();

function tokenize(inputData) {
    var expressionString = inputData,
        toProcess = inputData + '\0',
        max = toProcess.length,
        pos = 0,
        tokens = [];

    function process() {
        var ch;

        while (pos < max) {
            ch = toProcess[pos];
            if (isAlphabetic(ch)) {
                lexIdentifier();
            } else {
                switch (ch) {
                    case '+':
                        if (isTwoCharToken(_TokenKind.TokenKind.INC)) {
                            pushPairToken(_TokenKind.TokenKind.INC);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.PLUS);
                        }
                        break;
                    case '_':
                        // the other way to start an identifier
                        lexIdentifier();
                        break;
                    case '-':
                        if (isTwoCharToken(_TokenKind.TokenKind.DEC)) {
                            pushPairToken(_TokenKind.TokenKind.DEC);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.MINUS);
                        }
                        break;
                    case ':':
                        pushCharToken(_TokenKind.TokenKind.COLON);
                        break;
                    case '.':
                        pushCharToken(_TokenKind.TokenKind.DOT);
                        break;
                    case ',':
                        pushCharToken(_TokenKind.TokenKind.COMMA);
                        break;
                    case '*':
                        pushCharToken(_TokenKind.TokenKind.STAR);
                        break;
                    case '/':
                        pushCharToken(_TokenKind.TokenKind.DIV);
                        break;
                    case '%':
                        pushCharToken(_TokenKind.TokenKind.MOD);
                        break;
                    case '(':
                        pushCharToken(_TokenKind.TokenKind.LPAREN);
                        break;
                    case ')':
                        pushCharToken(_TokenKind.TokenKind.RPAREN);
                        break;
                    case '[':
                        pushCharToken(_TokenKind.TokenKind.LSQUARE);
                        break;
                    case '#':
                        pushCharToken(_TokenKind.TokenKind.HASH);
                        break;
                    case ']':
                        pushCharToken(_TokenKind.TokenKind.RSQUARE);
                        break;
                    case '{':
                        pushCharToken(_TokenKind.TokenKind.LCURLY);
                        break;
                    case '}':
                        pushCharToken(_TokenKind.TokenKind.RCURLY);
                        break;
                    case '@':
                        pushCharToken(_TokenKind.TokenKind.BEAN_REF);
                        break;
                    case '^':
                        if (isTwoCharToken(_TokenKind.TokenKind.SELECT_FIRST)) {
                            pushPairToken(_TokenKind.TokenKind.SELECT_FIRST);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.POWER);
                        }
                        break;
                    case '!':
                        if (isTwoCharToken(_TokenKind.TokenKind.NE)) {
                            pushPairToken(_TokenKind.TokenKind.NE);
                        } else if (isTwoCharToken(_TokenKind.TokenKind.PROJECT)) {
                            pushPairToken(_TokenKind.TokenKind.PROJECT);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.NOT);
                        }
                        break;
                    case '=':
                        if (isTwoCharToken(_TokenKind.TokenKind.EQ)) {
                            pushPairToken(_TokenKind.TokenKind.EQ);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.ASSIGN);
                        }
                        break;
                    case '&':
                        if (!isTwoCharToken(_TokenKind.TokenKind.SYMBOLIC_AND)) {
                            throw {
                                name: 'SpelParseException',
                                message: 'Missing character \'&\' in expression (' + expressionString + ') at position ' + pos
                            };
                        }
                        pushPairToken(_TokenKind.TokenKind.SYMBOLIC_AND);
                        break;
                    case '|':
                        if (!isTwoCharToken(_TokenKind.TokenKind.SYMBOLIC_OR)) {
                            throw {
                                name: 'SpelParseException',
                                message: 'Missing character \'|\' in expression (' + expressionString + ') at position ' + pos
                            };
                        }
                        pushPairToken(_TokenKind.TokenKind.SYMBOLIC_OR);
                        break;
                    case '?':
                        if (isTwoCharToken(_TokenKind.TokenKind.SELECT)) {
                            pushPairToken(_TokenKind.TokenKind.SELECT);
                        } else if (isTwoCharToken(_TokenKind.TokenKind.ELVIS)) {
                            pushPairToken(_TokenKind.TokenKind.ELVIS);
                        } else if (isTwoCharToken(_TokenKind.TokenKind.SAFE_NAVI)) {
                            pushPairToken(_TokenKind.TokenKind.SAFE_NAVI);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.QMARK);
                        }
                        break;
                    case '$':
                        if (isTwoCharToken(_TokenKind.TokenKind.SELECT_LAST)) {
                            pushPairToken(_TokenKind.TokenKind.SELECT_LAST);
                        } else {
                            lexIdentifier();
                        }
                        break;
                    case '>':
                        if (isTwoCharToken(_TokenKind.TokenKind.GE)) {
                            pushPairToken(_TokenKind.TokenKind.GE);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.GT);
                        }
                        break;
                    case '<':
                        if (isTwoCharToken(_TokenKind.TokenKind.LE)) {
                            pushPairToken(_TokenKind.TokenKind.LE);
                        } else {
                            pushCharToken(_TokenKind.TokenKind.LT);
                        }
                        break;
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        lexNumericLiteral(ch === '0');
                        break;
                    case ' ':
                    case '\t':
                    case '\r':
                    case '\n':
                        // drift over white space
                        pos += 1;
                        break;
                    case '\'':
                        lexQuotedStringLiteral();
                        break;
                    case '"':
                        lexDoubleQuotedStringLiteral();
                        break;
                    case '\0':
                        // hit sentinel at end of value
                        pos += 1; // will take us to the end
                        break;
                    case '\\':
                        throw {
                            name: 'SpelParseException',
                            message: 'Unexpected escape character in expression (' + expressionString + ') at position ' + pos
                        };
                    default:
                        throw {
                            name: 'SpelParseException',
                            message: 'Cannot handle character \'' + ch + '\' in expression (' + expressionString + ') at position ' + pos
                        };
                }
            }
        }
    }

    function lexQuotedStringLiteral() {
        var start = pos,
            terminated = false,
            ch;

        while (!terminated) {
            pos += 1;
            ch = toProcess[pos];
            if (ch === '\'') {
                // may not be the end if the char after is also a '
                if (toProcess[pos + 1] === '\'') {
                    pos += 1; // skip over that too, and continue
                } else {
                        terminated = true;
                    }
            }
            if (ch.charCodeAt(0) === 0) {
                throw {
                    name: 'SpelParseException',
                    message: 'Non-terminating quoted string in expression (' + expressionString + ') at position ' + pos
                };
            }
        }
        pos += 1;
        tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_STRING, subarray(start, pos), start, pos));
    }
    function lexDoubleQuotedStringLiteral() {
        var start = pos,
            terminated = false,
            ch;

        while (!terminated) {
            pos += 1;
            ch = toProcess[pos];
            if (ch === '"') {
                // may not be the end if the char after is also a '
                if (toProcess[pos + 1] === '"') {
                    pos += 1; // skip over that too, and continue
                } else {
                        terminated = true;
                    }
            }
            if (ch.charCodeAt(0) === 0) {
                throw {
                    name: 'SpelParseException',
                    message: 'Non-terminating double-quoted string in expression (' + expressionString + ') at position ' + pos
                };
            }
        }
        pos += 1;
        tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_STRING, subarray(start, pos), start, pos));
    }

    // REAL_LITERAL :
    // ('.' (DECIMAL_DIGIT)+ (EXPONENT_PART)? (REAL_TYPE_SUFFIX)?) |
    // ((DECIMAL_DIGIT)+ '.' (DECIMAL_DIGIT)+ (EXPONENT_PART)? (REAL_TYPE_SUFFIX)?) |
    // ((DECIMAL_DIGIT)+ (EXPONENT_PART) (REAL_TYPE_SUFFIX)?) |
    // ((DECIMAL_DIGIT)+ (REAL_TYPE_SUFFIX));
    // fragment INTEGER_TYPE_SUFFIX : ( 'L' | 'l' );
    // fragment HEX_DIGIT :
    // '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'A'|'B'|'C'|'D'|'E'|'F'|'a'|'b'|'c'|'d'|'e'|'f';
    //
    // fragment EXPONENT_PART : 'e' (SIGN)* (DECIMAL_DIGIT)+ | 'E' (SIGN)*
    // (DECIMAL_DIGIT)+ ;
    // fragment SIGN : '+' | '-' ;
    // fragment REAL_TYPE_SUFFIX : 'F' | 'f' | 'D' | 'd';
    // INTEGER_LITERAL
    // : (DECIMAL_DIGIT)+ (INTEGER_TYPE_SUFFIX)?;

    function lexNumericLiteral(firstCharIsZero) {
        var isReal = false,
            start = pos,
            ch = toProcess[pos + 1],
            isHex = ch === 'x' || ch === 'X',
            dotpos,
            endOfNumber,
            possibleSign,
            isFloat;

        // deal with hexadecimal
        if (firstCharIsZero && isHex) {
            pos = pos + 1;
            do {
                pos += 1;
            } while (isHexadecimalDigit(toProcess[pos]));
            if (isChar('L', 'l')) {
                pushHexIntToken(subarray(start + 2, pos), true, start, pos);
                pos += 1;
            } else {
                pushHexIntToken(subarray(start + 2, pos), false, start, pos);
            }
            return;
        }

        // real numbers must have leading digits

        // Consume first part of number
        do {
            pos += 1;
        } while (isDigit(toProcess[pos]));

        // a '.' indicates this number is a real
        ch = toProcess[pos];
        if (ch === '.') {
            isReal = true;
            dotpos = pos;
            // carry on consuming digits
            do {
                pos += 1;
            } while (isDigit(toProcess[pos]));
            if (pos === dotpos + 1) {
                // the number is something like '3.'. It is really an int but may be
                // part of something like '3.toString()'. In this case process it as
                // an int and leave the dot as a separate token.
                pos = dotpos;
                pushIntToken(subarray(start, pos), false, start, pos);
                return;
            }
        }

        endOfNumber = pos;

        // Now there may or may not be an exponent

        // is it a long ?
        if (isChar('L', 'l')) {
            if (isReal) {
                // 3.4L - not allowed
                throw {
                    name: 'SpelParseException',
                    message: 'Real cannot be long in expression (' + expressionString + ') at position ' + pos
                };
            }
            pushIntToken(subarray(start, endOfNumber), true, start, endOfNumber);
            pos += 1;
        } else if (isExponentChar(toProcess[pos])) {
            isReal = true; // if it wasn't before, it is now
            pos += 1;
            possibleSign = toProcess[pos];
            if (isSign(possibleSign)) {
                pos += 1;
            }

            // exponent digits
            do {
                pos += 1;
            } while (isDigit(toProcess[pos]));
            isFloat = false;
            if (isFloatSuffix(toProcess[pos])) {
                isFloat = true;
                pos += 1;
                endOfNumber = pos;
            } else if (isDoubleSuffix(toProcess[pos])) {
                pos += 1;
                endOfNumber = pos;
            }
            pushRealToken(subarray(start, pos), isFloat, start, pos);
        } else {
            ch = toProcess[pos];
            isFloat = false;
            if (isFloatSuffix(ch)) {
                isReal = true;
                isFloat = true;
                pos += 1;
                endOfNumber = pos;
            } else if (isDoubleSuffix(ch)) {
                isReal = true;
                pos += 1;
                endOfNumber = pos;
            }
            if (isReal) {
                pushRealToken(subarray(start, endOfNumber), isFloat, start, endOfNumber);
            } else {
                pushIntToken(subarray(start, endOfNumber), false, start, endOfNumber);
            }
        }
    }

    function lexIdentifier() {
        var start = pos,
            substring,
            asString,
            idx;
        do {
            pos += 1;
        } while (isIdentifier(toProcess[pos]));
        substring = subarray(start, pos);

        // Check if this is the alternative (textual) representation of an operator (see
        // alternativeOperatorNames)
        if (pos - start === 2 || pos - start === 3) {
            asString = substring.toUpperCase();
            idx = ALTERNATIVE_OPERATOR_NAMES.indexOf(asString);
            if (idx >= 0) {
                pushOneCharOrTwoCharToken(_TokenKind.TokenKind.valueOf(asString), start, substring);
                return;
            }
        }
        tokens.push(new _Token.Token(_TokenKind.TokenKind.IDENTIFIER, substring.replace('\0', ''), start, pos));
    }

    function pushIntToken(data, isLong, start, end) {
        if (isLong) {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_LONG, data, start, end));
        } else {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_INT, data, start, end));
        }
    }

    function pushHexIntToken(data, isLong, start, end) {
        if (data.length === 0) {
            if (isLong) {
                throw {
                    name: 'SpelParseException',
                    message: 'Not a long in expression (' + expressionString + ') at position ' + pos
                };
            } else {
                throw {
                    name: 'SpelParseException',
                    message: 'Not an int in expression (' + expressionString + ') at position ' + pos
                };
            }
        }
        if (isLong) {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_HEXLONG, data, start, end));
        } else {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_HEXINT, data, start, end));
        }
    }

    function pushRealToken(data, isFloat, start, end) {
        if (isFloat) {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_REAL_FLOAT, data, start, end));
        } else {
            tokens.push(new _Token.Token(_TokenKind.TokenKind.LITERAL_REAL, data, start, end));
        }
    }

    function subarray(start, end) {
        return toProcess.substring(start, end);
    }

    /**
     * Check if this might be a two character token.
     */
    function isTwoCharToken(kind) {
        if (kind.tokenChars.length === 2 && toProcess[pos] === kind.tokenChars[0]) {
            return toProcess[pos + 1] === kind.tokenChars[1];
        }
        return false;
    }

    /**
     * Push a token of just one character in length.
     */
    function pushCharToken(kind) {
        tokens.push(new _Token.Token(kind, null, pos, pos + 1));
        pos += 1;
    }

    /**
     * Push a token of two characters in length.
     */
    function pushPairToken(kind) {
        tokens.push(new _Token.Token(kind, null, pos, pos + 2));
        pos += 2;
    }

    function pushOneCharOrTwoCharToken(kind, pos, data) {
        tokens.push(new _Token.Token(kind, data, pos, pos + kind.getLength()));
    }

    // ID: ('a'..'z'|'A'..'Z'|'_'|'$') ('a'..'z'|'A'..'Z'|'_'|'$'|'0'..'9'|DOT_ESCAPED)*;
    function isIdentifier(ch) {
        return isAlphabetic(ch) || isDigit(ch) || ch === '_' || ch === '$';
    }

    function isChar(a, b) {
        var ch = toProcess[pos];
        return ch === a || ch === b;
    }

    function isExponentChar(ch) {
        return ch === 'e' || ch === 'E';
    }

    function isFloatSuffix(ch) {
        return ch === 'f' || ch === 'F';
    }

    function isDoubleSuffix(ch) {
        return ch === 'd' || ch === 'D';
    }

    function isSign(ch) {
        return ch === '+' || ch === '-';
    }

    function isDigit(ch) {
        if (ch.charCodeAt(0) > 255) {
            return false;
        }
        return (FLAGS[ch.charCodeAt(0)] & IS_DIGIT) !== 0;
    }

    function isAlphabetic(ch) {
        if (ch.charCodeAt(0) > 255) {
            return false;
        }
        return (FLAGS[ch.charCodeAt(0)] & IS_ALPHA) !== 0;
    }

    function isHexadecimalDigit(ch) {
        if (ch.charCodeAt(0) > 255) {
            return false;
        }
        return (FLAGS[ch.charCodeAt(0)] & IS_HEXDIGIT) !== 0;
    }

    process();

    return tokens;
}

var Tokenizer = {
    tokenize: tokenize
};
exports.Tokenizer = Tokenizer;

},{"./Token":4,"./TokenKind":5}],7:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents assignment. An alternative to calling setValue() for an expression is to use
 * an assign.
 *
 * <p>Example: 'someNumberProperty=42'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, property, assignedValue) {
    var node = _SpelNode.SpelNode.create('assign', position, property, assignedValue);

    node.getValue = function (state) {
        var context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to assign property \'' + property.getValue(state) + '\' for an undefined context.'
            };
        }

        return property.setValue(assignedValue.getValue(state), state);
    };

    return node;
}

var Assign = {
    create: createNode
};
exports.Assign = Assign;

},{"./SpelNode":38}],8:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents the literal values TRUE and FALSE.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(value, position) {
    var node = _SpelNode.SpelNode.create('boolean', position);

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

var BooleanLiteral = {
    create: createNode
};
exports.BooleanLiteral = BooleanLiteral;

},{"./SpelNode":38}],9:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents a DOT separated expression sequence, such as 'property1.property2.methodOne()'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expressionComponents) {
    var node = _SpelNode.SpelNode.create.apply(null, ['compound', position].concat(expressionComponents));

    function buildContextStack(state) {
        var childrenCount = node.getChildren().length,
            i;

        for (i = 0; i < childrenCount; i += 1) {
            if (node.getChildren()[i].getType() === 'indexer') {
                state.activeContext.push(state.activeContext.peek()[node.getChildren()[i].getValue(state)]);
            } else {
                state.activeContext.push(node.getChildren()[i].getValue(state));
            }
        }

        return function unbuildContextStack() {
            for (i = 0; i < childrenCount; i += 1) {
                state.activeContext.pop();
            }
        };
    }

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            value;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to evaluate compound expression with an undefined context.'
            };
        }

        var unbuildContextStack = buildContextStack(state);

        value = state.activeContext.peek();

        unbuildContextStack();

        return value;
    };

    node.setValue = function (value, state) {
        var unbuildContextStack = buildContextStack(state),
            childCount = node.getChildren().length;

        state.activeContext.pop();

        value = node.getChildren()[childCount - 1].setValue(value, state);

        state.activeContext.push(null);

        unbuildContextStack();

        return value;
    };

    return node;
}

var CompoundExpression = {
    create: createNode
};
exports.CompoundExpression = CompoundExpression;

},{"./SpelNode":38}],10:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents the elvis operator ?:. For an expression "a?:b" if a is not null, the value
 * of the expression is "a", if a is null then the value of the expression is "b".
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expression, ifFalse) {
    var node = _SpelNode.SpelNode.create('elvis', position, expression, ifFalse);

    node.getValue = function (state) {
        return expression.getValue(state) !== null ? expression.getValue(state) : ifFalse.getValue(state);
    };

    return node;
}

var Elvis = {
    create: createNode
};
exports.Elvis = Elvis;

},{"./SpelNode":38}],11:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * A function reference is of the form "#someFunction(a,b,c)". Functions may be defined in
 * the context prior to the expression being evaluated or within the expression itself
 * using a lambda function definition. For example: Lambda function definition in an
 * expression: "(#max = {|x,y|$x>$y?$x:$y};max(2,3))" Calling context defined function:
 * "#isEven(37)". Functions may also be static java methods, registered in the context
 * prior to invocation of the expression.
 *
 * <p>Functions are very simplistic, the arguments are not part of the definition (right
 * now), so the names must be unique.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(parent, functionName) {
    var node = _SpelNode.SpelNode.create('method', parent);

    node.getValue = function () {
        var refNode = node,
            context = null;
        do {
            if (refNode.getParent()) {
                refNode = refNode.getParent();
            } else {
                context = refNode.getContext();
            }
        } while (refNode);
        if (context[functionName]) {
            return context[functionName].call(context);
        }
        throw {
            name: 'FunctionDoesNotExistException',
            message: 'Function \'' + functionName + '\' does not exist.'
        };
    };

    return node;
}

var FunctionReference = {
    create: createNode
};
exports.FunctionReference = FunctionReference;

},{"./SpelNode":38}],12:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

var _libStack = require('../lib/Stack');

/**
 * An Indexer can index into some proceeding structure to access a particular piece of it.
 * Supported structures are: strings / collections (lists/sets) / arrays.
 *
 * @author Andy Clement
 * @author Phillip Webb
 * @author Stephane Nicoll
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expressionComponents) {
    var node = _SpelNode.SpelNode.create.apply(null, ['indexer', position].concat(expressionComponents));

    node.getValue = function (state) {
        var activeContext = state.activeContext,
            context,
            childrenCount = node.getChildren().length,
            i,
            value;

        state.activeContext = new _libStack.Stack();
        state.activeContext.push(state.rootContext);

        context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to evaluate compound expression with an undefined context.'
            };
        }

        for (i = 0; i < childrenCount; i += 1) {
            state.activeContext.push(node.getChildren()[i].getValue(state));
        }

        value = state.activeContext.peek();

        for (i = 0; i < childrenCount; i += 1) {
            state.activeContext.pop();
        }

        state.activeContext = activeContext;

        return value;
    };

    //node.setContext(node.getValue());

    return node;
}

var Indexer = {
    create: createNode
};
exports.Indexer = Indexer;

},{"../lib/Stack":42,"./SpelNode":38}],13:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represent a list in an expression, e.g. '{1,2,3}'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, elements) {
    var node = _SpelNode.SpelNode.create('list', position),
        list = [].concat(elements || []);

    node.getValue = function (state) {
        return list.map(function (element) {
            return element.getValue(state);
        });
    };

    return node;
}

var InlineList = {
    create: createNode
};
exports.InlineList = InlineList;

},{"./SpelNode":38}],14:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represent a map in an expression, e.g. '{name:'foo',age:12}'
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, elements) {
    var node = _SpelNode.SpelNode.create('map', position),
        mapPieces = [].concat(elements || []);

    node.getValue = function (state) {
        var key = true,
            keyValue = null,
            map = {};

        mapPieces.forEach(function (piece) {
            if (key) {
                //unquoted property names come as type "property" but should be treated as strings
                if (piece.getType() === 'property') {
                    keyValue = piece.getName();
                } else {
                    keyValue = piece.getValue(state);
                }
            } else {
                map[keyValue] = piece.getValue(state);
            }
            key = !key;
        });

        return map;
    };

    return node;
}

var InlineMap = {
    create: createNode
};
exports.InlineMap = InlineMap;

},{"./SpelNode":38}],15:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Expression language AST node that represents a method reference.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */

function createNode(nullSafeNavigation, methodName, position, args) {
    var node = _SpelNode.SpelNode.create('method', position);

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            compiledArgs = [],
            method;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \'' + methodName + '\' for an undefined context.'
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
            /*jshint -W093 */
            return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)] = compiledArgs[0];
            /*jshint +W093 */
        }

        //size() -> length
        if (methodName === 'size' && Array.isArray(context)) {
            return context.length;
        }

        method = maybeHandleNullSafeNavigation(context[methodName]);
        if (method) {
            return method.apply(context, compiledArgs);
        }
        return null;
    };

    return node;
}

var MethodReference = {
    create: createNode
};
exports.MethodReference = MethodReference;

},{"./SpelNode":38}],16:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Expression language AST node that represents null.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(value, position) {
    var node = _SpelNode.SpelNode.create('null', position);

    node.getValue = function () {
        return null;
    };

    return node;
}

var NullLiteral = {
    create: createNode
};
exports.NullLiteral = NullLiteral;

},{"./SpelNode":38}],17:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Expression language AST node that represents a literal number of any kind (since JavaScript only supports doubles anyway)
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(value, position) {
    var node = _SpelNode.SpelNode.create('number', position);

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

var NumberLiteral = {
    create: createNode
};
exports.NumberLiteral = NumberLiteral;

},{"./SpelNode":38}],18:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents the boolean AND operation.
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Oliver Becker
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-and', position, left, right);

    node.getValue = function (state) {
        //double bang for javascript
        return !!left.getValue(state) && !!right.getValue(state);
    };

    return node;
}

var OpAnd = {
    create: createNode
};
exports.OpAnd = OpAnd;

},{"./SpelNode":38}],19:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Decrement operator.  Can be used in a prefix or postfix form. This will throw
 * appropriate exceptions if the operand in question does not support decrement.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, postfix, int) {
    var node = _SpelNode.SpelNode.create('op-dec', position, int);

    node.getValue = function (state) {
        var cur = int.getValue(state);
        int.setValue(cur - 1, state);
        if (postfix) {
            return cur;
        }
        return cur - 1;
    };

    return node;
}

var OpDec = {
    create: createNode
};
exports.OpDec = OpDec;

},{"./SpelNode":38}],20:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements division operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-divide', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) / right.getValue(state);
    };

    return node;
}

var OpDivide = {
    create: createNode
};
exports.OpDivide = OpDivide;

},{"./SpelNode":38}],21:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the equality operator.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-eq', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) === right.getValue(state);
    };

    return node;
}

var OpEQ = {
    create: createNode
};
exports.OpEQ = OpEQ;

},{"./SpelNode":38}],22:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements greater-than-or-equal operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-ge', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) >= right.getValue(state);
    };

    return node;
}

var OpGE = {
    create: createNode
};
exports.OpGE = OpGE;

},{"./SpelNode":38}],23:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the greater-than operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-gt', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) > right.getValue(state);
    };

    return node;
}

var OpGT = {
    create: createNode
};
exports.OpGT = OpGT;

},{"./SpelNode":38}],24:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Increment operator. Can be used in a prefix or postfix form. This will throw
 * appropriate exceptions if the operand in question does not support increment.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, postfix, int) {
    var node = _SpelNode.SpelNode.create('op-inc', position, int);

    node.getValue = function (state) {
        var cur = int.getValue(state);
        int.setValue(cur + 1, state);
        if (postfix) {
            return cur;
        }
        return cur + 1;
    };

    return node;
}

var OpInc = {
    create: createNode
};
exports.OpInc = OpInc;

},{"./SpelNode":38}],25:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the less-than-or-equal operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-le', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) <= right.getValue(state);
    };

    return node;
}

var OpLE = {
    create: createNode
};
exports.OpLE = OpLE;

},{"./SpelNode":38}],26:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the less-than operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-lt', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) < right.getValue(state);
    };

    return node;
}

var OpLT = {
    create: createNode
};
exports.OpLT = OpLT;

},{"./SpelNode":38}],27:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * The minus operator supports:
 * <ul>
 * <li>subtraction of numbers
 * <li>subtraction of an int from a string of one character
 * (effectively decreasing that character), so 'd'-3='a'
 * </ul>
 *
 * <p>It can be used as a unary operator for numbers.
 * The standard promotions are performed when the operand types vary (double-int=double).
 * For other options it defers to the registered overloader.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-minus', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) - right.getValue(state);
    };

    return node;
}

var OpMinus = {
    create: createNode
};
exports.OpMinus = OpMinus;

},{"./SpelNode":38}],28:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the modulus operator.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-modulus', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) % right.getValue(state);
    };

    return node;
}

var OpModulus = {
    create: createNode
};
exports.OpModulus = OpModulus;

},{"./SpelNode":38}],29:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the {@code multiply} operator.
 *
 * <p>Conversions and promotions are handled as defined in
 * <a href="http://java.sun.com/docs/books/jls/third_edition/html/conversions.html">Section 5.6.2 of the
 * Java Language Specification</a>, with the addiction of {@code BigDecimal}/{@code BigInteger} management:
 *
 * <p>If any of the operands is of a reference type, unboxing conversion (Section 5.1.8)
 * is performed. Then:<br>
 * If either operand is of type {@code BigDecimal}, the other is converted to {@code BigDecimal}.<br>
 * If either operand is of type double, the other is converted to double.<br>
 * Otherwise, if either operand is of type float, the other is converted to float.<br>
 * If either operand is of type {@code BigInteger}, the other is converted to {@code BigInteger}.<br>
 * Otherwise, if either operand is of type long, the other is converted to long.<br>
 * Otherwise, both operands are converted to type int.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-multiply', position, left, right);

    node.getValue = function (state) {
        var leftValue = left.getValue(state),
            rightValue = right.getValue(state);

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
            return leftValue * rightValue;
        }

        //repeats (ex. 'abc' * 2 = 'abcabc')
        if (typeof leftValue === 'string' && typeof rightValue === 'number') {
            var s = '',
                i = 0;
            for (; i < rightValue; i += 1) {
                s += leftValue;
            }
            return s;
        }

        return null;
    };

    return node;
}

var OpMultiply = {
    create: createNode
};
exports.OpMultiply = OpMultiply;

},{"./SpelNode":38}],30:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Implements the not-equal operator.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-ne', position, left, right);

    node.getValue = function (state) {
        return left.getValue(state) !== right.getValue(state);
    };

    return node;
}

var OpNE = {
    create: createNode
};
exports.OpNE = OpNE;

},{"./SpelNode":38}],31:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents a NOT operation.
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Oliver Becker
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expr) {
    var node = _SpelNode.SpelNode.create('op-not', position, expr);

    node.getValue = function (state) {
        return !expr.getValue(state);
    };

    return node;
}

var OpNot = {
    create: createNode
};
exports.OpNot = OpNot;

},{"./SpelNode":38}],32:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents the boolean OR operation.
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Oliver Becker
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-or', position, left, right);

    node.getValue = function (state) {
        //double bang for javascript
        return !!left.getValue(state) || !!right.getValue(state);
    };

    return node;
}

var OpOr = {
    create: createNode
};
exports.OpOr = OpOr;

},{"./SpelNode":38}],33:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * The plus operator will:
 * <ul>
 * <li>add numbers
 * <li>concatenate strings
 * </ul>
 *
 * <p>It can be used as a unary operator for numbers.
 * The standard promotions are performed when the operand types vary (double+int=double).
 * For other options it defers to the registered overloader.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ivo Smid
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, left, right) {
    var node = _SpelNode.SpelNode.create('op-plus', position, left, right);

    node.getValue = function (state) {
        //javascript will handle string concatenation or addition depending on types
        return left.getValue(state) + right.getValue(state);
    };

    return node;
}

var OpPlus = {
    create: createNode
};
exports.OpPlus = OpPlus;

},{"./SpelNode":38}],34:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * The power operator.
 *
 * @author Andy Clement
 * @author Giovanni Dall'Oglio Risso
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, base, exp) {
    var node = _SpelNode.SpelNode.create('op-power', position, base, exp);

    node.getValue = function (state) {
        return Math.pow(base.getValue(state), exp.getValue(state));
    };

    return node;
}

var OpPower = {
    create: createNode
};
exports.OpPower = OpPower;

},{"./SpelNode":38}],35:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents projection, where a given operation is performed on all elements in some
 * input sequence, returning a new sequence of the same size. For example:
 * "{1,2,3,4,5,6,7,8,9,10}.!{#isEven(#this)}" returns "[n, y, n, y, n, y, n, y, n, y]"
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Ben March
 * @since 0.2.0
 */

function projectCollection(collection, expr, state) {
    return collection.map(function (element) {
        var matches;
        state.activeContext.push(element);
        matches = expr.getValue(state);
        state.activeContext.pop();
        return matches;
    });
}

function createNode(nullSafeNavigation, position, expr) {
    var node = _SpelNode.SpelNode.create('projection', position, expr);

    node.getValue = function (state) {
        var collection = state.activeContext.peek(),
            entries = [],
            key;

        if (Array.isArray(collection)) {
            return projectCollection(collection, expr, state);
        } else if (typeof collection === 'object') {
            for (key in collection) {
                if (collection.hasOwnProperty(key)) {
                    entries.push(collection[key]);
                }
            }
            return projectCollection(entries, expr, state);
        }

        return null;
    };

    return node;
}

var Projection = {
    create: createNode
};
exports.Projection = Projection;

},{"./SpelNode":38}],36:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents a simple property or field reference.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Clark Duplichien
 * @author Ben March
 * @since 0.2.0
 */

function createNode(nullSafeNavigation, propertyName, position) {
    var node = _SpelNode.SpelNode.create('property', position);

    node.getValue = function (state) {
        var context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up property \'' + propertyName + '\' for an undefined context.'
            };
        }

        if (context[propertyName] === undefined) {
            //handle safe navigation
            if (nullSafeNavigation) {
                return null;
            }

            //handle conversion of Java properties to JavaScript properties
            if (propertyName === 'size' && Array.isArray(context)) {
                return context.length;
            }

            throw {
                name: 'NullPointerException',
                message: 'Property \'' + propertyName + '\' does not exist.'
            };
        }

        return context[propertyName];
    };

    node.setValue = function (value, state) {
        var context = state.activeContext.peek();

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to assign property \'' + propertyName + '\' for an undefined context.'
            };
        }

        /*jshint -W093 */
        return context[propertyName] = value;
        /*jshint +W093 */
    };

    node.getName = function () {
        return propertyName;
    };

    return node;
}

var PropertyReference = {
    create: createNode
};
exports.PropertyReference = PropertyReference;

},{"./SpelNode":38}],37:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents selection over a map or collection.
 * For example: {1,2,3,4,5,6,7,8,9,10}.?{#isEven(#this) == 'y'} returns [2, 4, 6, 8, 10]
 *
 * <p>Basically a subset of the input data is returned based on the
 * evaluation of the expression supplied as selection criteria.
 *
 * @author Andy Clement
 * @author Mark Fisher
 * @author Sam Brannen
 * @author Ben March
 * @since 0.2.0
 */

function matches(element, expr, state) {
    var doesMatch = false;
    state.activeContext.push(element);
    doesMatch = expr.getValue(state);
    state.activeContext.pop();
    return doesMatch;
}

function selectFromArray(collection, whichElement, expr, state) {
    var newCollection = collection.filter(function (element) {
        return matches(element, expr, state);
    });

    switch (whichElement) {
        case 'ALL':
            return newCollection;
        case 'FIRST':
            return newCollection[0] || null;
        case 'LAST':
            if (newCollection.length) {
                return newCollection[newCollection.length - 1];
            }
            return null;
    }
}

function selectFromMap(collection, whichElement, expr, state) {
    var newCollection = {},
        entry,
        key,
        entries = [],
        returnValue = {};

    for (key in collection) {
        if (collection.hasOwnProperty(key)) {
            entry = {
                key: key,
                value: collection[key]
            };
            if (matches(entry, expr, state)) {
                entries.push(entry);
            }
        }
    }

    switch (whichElement) {
        case 'ALL':
            entries.forEach(function (entry) {
                newCollection[entry.key] = entry.value;
            });
            return newCollection;
        case 'FIRST':
            if (entries.length) {
                returnValue[entries[0].key] = entries[0].value;
                return returnValue;
            }
            return null;
        case 'LAST':
            if (entries.length) {
                returnValue[entries[entries.length - 1].key] = entries[entries.length - 1].value;
                return returnValue;
            }
            return null;
    }

    entries.forEach(function (entry) {
        newCollection[entry.key] = entry.value;
    });
}

function createNode(nullSafeNavigation, whichElement, position, expr) {
    var node = _SpelNode.SpelNode.create('selection', position, expr);

    node.getValue = function (state) {
        var collection = state.activeContext.peek();

        if (collection) {
            if (Array.isArray(collection)) {
                return selectFromArray(collection, whichElement, expr, state);
            } else if (typeof collection === 'object') {
                return selectFromMap(collection, whichElement, expr, state);
            }
        }

        return null;
    };

    return node;
}

var Selection = {
    create: createNode,
    FIRST: 'FIRST',
    LAST: 'LAST',
    ALL: 'ALL'
};
exports.Selection = Selection;

},{"./SpelNode":38}],38:[function(require,module,exports){
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

/**
 * The common supertype of all AST nodes in a parsed Spring Expression Language
 * format expression.
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function createSpelNode(nodeType, position) {
    var node = {},
        type = nodeType || 'Abstract',
        children = [],
        parent = null,
        activeContext;

    node._type = type;

    node.getType = function () {
        return type;
    };
    node.setType = function (nodeType) {
        type = nodeType;
    };

    node.getChildren = function () {
        return children;
    };
    node.addChild = function (childNode) {
        childNode.setParent(node);
        children.push(childNode);
    };

    node.getParent = function () {
        return parent;
    };
    node.setParent = function (parentNode) {
        parent = parentNode;
    };

    node.getContext = function (state) {
        return activeContext || state.activeContext.peek();
    };
    node.setContext = function (nodeContext) {
        activeContext = nodeContext;
    };

    node.getStartPosition = function () {
        return position >> 16;
    };

    node.getEndPosition = function () {
        return position & 0xffff;
    };

    //must override
    node.getValue = function () {
        throw {
            name: 'MethodNotImplementedException',
            message: 'SpelNode#getValue() must be overridden.'
        };
    };

    node.toString = function () {
        var s = 'Kind: ' + node.getType();
        //s += ', Value: ' + node.getValue();
        s += ', Children: [';
        for (var i = 0, l = node.getChildren().length; i < l; i += 1) {
            s += '{' + node.getChildren()[i] + '}, ';
        }
        s += ']';
        return s;
    };

    //constructor
    if (position === 0) {
        throw {
            name: 'Error',
            message: 'Position cannot be 0'
        };
    }

    for (var _len = arguments.length, operands = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        operands[_key - 2] = arguments[_key];
    }

    if (operands) {
        operands.forEach(function (operand) {
            node.addChild(operand);
        });
    }

    return node;
}

var SpelNode = {
    create: createSpelNode
};
exports.SpelNode = SpelNode;

},{}],39:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Expression language AST node that represents a string literal.
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */

function createNode(value, position) {
    var node = _SpelNode.SpelNode.create('string', position);

    function stripQuotes(value) {
        if (value[0] === '\'' && value[value.length - 1] === '\'' || value[0] === '"' && value[value.length - 1] === '"') {
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

var StringLiteral = {
    create: createNode
};
exports.StringLiteral = StringLiteral;

},{"./SpelNode":38}],40:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents a ternary expression, for example: "someCheck()?true:false".
 *
 * @author Andy Clement
 * @author Juergen Hoeller
 * @author Ben March
 * @since 0.2.0
 */

function createNode(position, expression, ifTrue, ifFalse) {
    var node = _SpelNode.SpelNode.create('ternary', position, expression, ifTrue, ifFalse);

    node.getValue = function (state) {
        return expression.getValue(state) ? ifTrue.getValue(state) : ifFalse.getValue(state);
    };

    return node;
}

var Ternary = {
    create: createNode
};
exports.Ternary = Ternary;

},{"./SpelNode":38}],41:[function(require,module,exports){
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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _SpelNode = require('./SpelNode');

/**
 * Represents a variable reference, eg. #someVar. Note this is different to a *local*
 * variable like $someVar
 *
 * @author Andy Clement
 * @author Ben March
 * @since 0.2.0
 */

function createNode(variableName, position) {
    var node = _SpelNode.SpelNode.create('variable', position);

    node.getValue = function (state) {
        var context = state.activeContext.peek(),
            locals = state.locals;

        if (!context) {
            throw {
                name: 'ContextDoesNotExistException',
                message: 'Attempting to look up variable \'' + variableName + '\' for an undefined context.'
            };
        }

        //there are 2 keywords (root, this) that need to be dealt with
        if (variableName === 'this') {
            return context;
        }
        if (variableName === 'root') {
            return state.rootContext;
        }

        return locals[variableName];
    };

    node.setValue = function (value, state) {
        var locals = state.locals;

        /*jshint -W093 */
        return locals[variableName] = value;
        /*jshint +W093 */
    };

    return node;
}

var VariableReference = {
    create: createNode
};
exports.VariableReference = VariableReference;

},{"./SpelNode":38}],42:[function(require,module,exports){
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

/**
 * @author Ben March
 * @since 0.2.0
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Stack = Stack;

function Stack(startingElements) {
    this.elements = startingElements || [];
}

Stack.prototype.push = function (el) {
    this.elements.push(el);
    return el;
};

Stack.prototype.pop = function () {
    return this.elements.pop();
};

Stack.prototype.peek = function () {
    return this.elements[this.elements.length - 1];
};

Stack.prototype.empty = function () {
    return this.elements.length > 0;
};

Stack.prototype.search = function (el) {
    return this.elements.length - this.elements.indexOf(el);
};

},{}],43:[function(require,module,exports){
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

/**
 * @author Ben March
 * @since 0.2.0
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _SpelExpressionEvaluator = require('./SpelExpressionEvaluator');

var _StandardContext = require('./StandardContext');

exports.SpelExpressionEvaluator = _SpelExpressionEvaluator.SpelExpressionEvaluator;
exports.StandardContext = _StandardContext.StandardContext;

},{"./SpelExpressionEvaluator":1,"./StandardContext":3}]},{},[43])(43)
});