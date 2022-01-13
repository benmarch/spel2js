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


import {TokenKind} from './TokenKind';
import {Tokenizer} from './Tokenizer';
import {BooleanLiteral} from './ast/BooleanLiteral';
import {NumberLiteral} from './ast/NumberLiteral';
import {StringLiteral} from './ast/StringLiteral';
import {NullLiteral} from './ast/NullLiteral';
import {FunctionReference} from './ast/FunctionReference';
import {MethodReference} from './ast/MethodReference';
import {PropertyReference} from './ast/PropertyReference';
import {VariableReference} from './ast/VariableReference';
import {CompoundExpression} from './ast/CompoundExpression';
import {Indexer} from './ast/Indexer';
import {Assign} from './ast/Assign';
import {OpEQ} from './ast/OpEQ';
import {OpNE} from './ast/OpNE';
import {OpGE} from './ast/OpGE';
import {OpGT} from './ast/OpGT';
import {OpLE} from './ast/OpLE';
import {OpLT} from './ast/OpLT';
import {OpPlus} from './ast/OpPlus';
import {OpMinus} from './ast/OpMinus';
import {OpMultiply} from './ast/OpMultiply';
import {OpDivide} from './ast/OpDivide';
import {OpModulus} from './ast/OpModulus';
import {OpPower} from './ast/OpPower';
import {OpInc} from './ast/OpInc';
import {OpDec} from './ast/OpDec';
import {OpNot} from './ast/OpNot';
import {OpAnd} from './ast/OpAnd';
import {OpOr} from './ast/OpOr';
import {OpMatches} from "./ast/OpMatches";
import {Ternary} from './ast/Ternary';
import {Elvis} from './ast/Elvis';
import {InlineList} from './ast/InlineList';
import {InlineMap} from './ast/InlineMap';
import {Selection} from './ast/Selection';
import {Projection} from './ast/Projection';

//not yet implemented
import {OpInstanceof} from './ast/OpInstanceof';
import {OpBetween} from './ast/OpBetween';
import {TypeReference} from './ast/TypeReference';
import {BeanReference} from './ast/BeanReference';
import {Identifier} from './ast/Identifier';
import {QualifiedIdentifier} from './ast/QualifiedIdentifier';
import {ConstructorReference} from './ast/ConstructorReference';

export var SpelExpressionParser = function () {


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
            tokenStream = Tokenizer.tokenize(expression);
            tokenStreamLength = tokenStream.length;
            tokenStreamPointer = 0;
            constructedNodes = [];
            var ast = eatExpression();
            if (moreTokens()) {
                raiseInternalException(peekToken().startPos, 'MORE_INPUT', nextToken().toString());
            }
            //Assert.isTrue(this.constructedNodes.isEmpty());
            return ast;
        }
        catch (e) {
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
            if (token.getKind() === TokenKind.ASSIGN) {  // a=b
                if (expr === null) {
                    expr = NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 1));
                }
                nextToken();
                var assignedValue = eatLogicalOrExpression();
                return Assign.create(toPosToken(token), expr, assignedValue);
            }

            if (token.getKind() === TokenKind.ELVIS) {  // a?:b (a if it isn't null, otherwise b)
                if (expr === null) {
                    expr = NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 2));
                }
                nextToken();  // elvis has left the building
                var valueIfNull = eatExpression();
                if (valueIfNull === null) {
                    valueIfNull = NullLiteral.create(toPosBounds(token.startPos + 1, token.endPos + 1));
                }
                return Elvis.create(toPosToken(token), expr, valueIfNull);
            }

            if (token.getKind() === TokenKind.QMARK) {  // a?b:c
                if (expr === null) {
                    expr = NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 1));
                }
                nextToken();
                var ifTrueExprValue = eatExpression();
                eatToken(TokenKind.COLON);
                var ifFalseExprValue = eatExpression();
                return Ternary.create(toPosToken(token), expr, ifTrueExprValue, ifFalseExprValue);
            }
        }
        return expr;
    }

    //logicalOrExpression : logicalAndExpression (OR^ logicalAndExpression)*;
    function eatLogicalOrExpression() {
        var expr = eatLogicalAndExpression();
        while (peekIdentifierToken('or') || peekTokenOne(TokenKind.SYMBOLIC_OR)) {
            var token = nextToken();  //consume OR
            var rhExpr = eatLogicalAndExpression();
            checkOperands(token, expr, rhExpr);
            expr = OpOr.create(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    // logicalAndExpression : relationalExpression (AND^ relationalExpression)*;
    function eatLogicalAndExpression() {
        var expr = eatRelationalExpression();
        while (peekIdentifierToken('and') || peekTokenOne(TokenKind.SYMBOLIC_AND)) {
            var token = nextToken();  // consume 'AND'
            var rhExpr = eatRelationalExpression();
            checkOperands(token, expr, rhExpr);
            expr = OpAnd.create(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    // relationalExpression : sumExpression (relationalOperator^ sumExpression)?;
    function eatRelationalExpression() {
        var expr = eatSumExpression();
        var relationalOperatorToken = maybeEatRelationalOperator();
        if (relationalOperatorToken !== null) {
            var token = nextToken();  // consume relational operator token
            var rhExpr = eatSumExpression();
            checkOperands(token, expr, rhExpr);
            var tk = relationalOperatorToken.kind;

            if (relationalOperatorToken.isNumericRelationalOperator()) {
                var pos = toPosToken(token);
                if (tk === TokenKind.GT) {
                    return OpGT.create(pos, expr, rhExpr);
                }
                if (tk === TokenKind.LT) {
                    return OpLT.create(pos, expr, rhExpr);
                }
                if (tk === TokenKind.LE) {
                    return OpLE.create(pos, expr, rhExpr);
                }
                if (tk === TokenKind.GE) {
                    return OpGE.create(pos, expr, rhExpr);
                }
                if (tk === TokenKind.EQ) {
                    return OpEQ.create(pos, expr, rhExpr);
                }
                //Assert.isTrue(tk === TokenKind.NE);
                return OpNE.create(pos, expr, rhExpr);
            }

            if (tk === TokenKind.INSTANCEOF) {
                return OpInstanceof.create(toPosToken(token), expr, rhExpr);
            }

            if (tk === TokenKind.MATCHES) {
                return OpMatches.create(toPosToken(token), expr, rhExpr);
            }

            //Assert.isTrue(tk === TokenKind.BETWEEN);
            return OpBetween.create(toPosToken(token), expr, rhExpr);
        }
        return expr;
    }

    //sumExpression: productExpression ( (PLUS^ | MINUS^) productExpression)*;
    function eatSumExpression() {
        var expr = eatProductExpression();
        while (peekTokenAny(TokenKind.PLUS, TokenKind.MINUS, TokenKind.INC)) {
            var token = nextToken();//consume PLUS or MINUS or INC
            var rhExpr = eatProductExpression();
            checkRightOperand(token, rhExpr);
            if (token.getKind() === TokenKind.PLUS) {
                expr = OpPlus.create(toPosToken(token), expr, rhExpr);
            }
            else if (token.getKind() === TokenKind.MINUS) {
                expr = OpMinus.create(toPosToken(token), expr, rhExpr);
            }
        }
        return expr;
    }

    // productExpression: powerExpr ((STAR^ | DIV^| MOD^) powerExpr)* ;
    function eatProductExpression() {
        var expr = eatPowerIncDecExpression();
        while (peekTokenAny(TokenKind.STAR, TokenKind.DIV, TokenKind.MOD)) {
            var token = nextToken();  // consume STAR/DIV/MOD
            var rhExpr = eatPowerIncDecExpression();
            checkOperands(token, expr, rhExpr);
            if (token.getKind() === TokenKind.STAR) {
                expr = OpMultiply.create(toPosToken(token), expr, rhExpr);
            }
            else if (token.getKind() === TokenKind.DIV) {
                expr = OpDivide.create(toPosToken(token), expr, rhExpr);
            }
            else {
                //Assert.isTrue(token.getKind() === TokenKind.MOD);
                expr = OpModulus.create(toPosToken(token), expr, rhExpr);
            }
        }
        return expr;
    }

    // powerExpr  : unaryExpression (POWER^ unaryExpression)? (INC || DEC) ;
    function eatPowerIncDecExpression() {
        var expr = eatUnaryExpression(),
            token;

        if (peekTokenOne(TokenKind.POWER)) {
            token = nextToken();  //consume POWER
            var rhExpr = eatUnaryExpression();
            checkRightOperand(token, rhExpr);
            return OpPower.create(toPosToken(token), expr, rhExpr);
        }

        if (expr !== null && peekTokenAny(TokenKind.INC, TokenKind.DEC)) {
            token = nextToken();  //consume INC/DEC
            if (token.getKind() === TokenKind.INC) {
                return OpInc.create(toPosToken(token), true, expr);
            }
            return OpDec.create(toPosToken(token), true, expr);
        }

        return expr;
    }

    // unaryExpression: (PLUS^ | MINUS^ | BANG^ | INC^ | DEC^) unaryExpression | primaryExpression ;
    function eatUnaryExpression() {
        var token,
            expr;

        if (peekTokenAny(TokenKind.PLUS, TokenKind.MINUS, TokenKind.NOT)) {
            token = nextToken();
            expr = eatUnaryExpression();
            if (token.getKind() === TokenKind.NOT) {
                return OpNot.create(toPosToken(token), expr);
            }

            if (token.getKind() === TokenKind.PLUS) {
                return OpPlus.create(toPosToken(token), expr);
            }
            //Assert.isTrue(token.getKind() === TokenKind.MINUS);
            return OpMinus.create(toPosToken(token), expr);

        }
        if (peekTokenAny(TokenKind.INC, TokenKind.DEC)) {
            token = nextToken();
            expr = eatUnaryExpression();
            if (token.getKind() === TokenKind.INC) {
                return OpInc.create(toPosToken(token), false, expr);
            }
            return OpDec.create(toPosToken(token), false, expr);
        }

        return eatPrimaryExpression();
    }

    // primaryExpression : startNode (node)? -> ^(EXPRESSION startNode (node)?);
    function eatPrimaryExpression() {
        var nodes = [];
        var start = eatStartNode();  // always a start node
        nodes.push(start);
        while (maybeEatNode()) {
            nodes.push(pop());
        }
        if (nodes.length === 1) {
            return nodes[0];
        }
        return CompoundExpression.create(toPosBounds(start.getStartPosition(), nodes[nodes.length - 1].getEndPosition()), nodes);
    }

    // node : ((DOT dottedNode) | (SAFE_NAVI dottedNode) | nonDottedNode)+;
    function maybeEatNode() {
        var expr = null;
        if (peekTokenAny(TokenKind.DOT, TokenKind.SAFE_NAVI)) {
            expr = eatDottedNode();
        }
        else {
            expr = maybeEatNonDottedNode();
        }

        if (expr === null) {
            return false;
        }
        else {
            push(expr);
            return true;
        }
    }

    // nonDottedNode: indexer;
    function maybeEatNonDottedNode() {
        if (peekTokenOne(TokenKind.LSQUARE)) {
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
        var token = nextToken();// it was a '.' or a '?.'
        var nullSafeNavigation = token.getKind() === TokenKind.SAFE_NAVI;
        if (maybeEatMethodOrProperty(nullSafeNavigation) || maybeEatFunctionOrVar() || maybeEatProjection(nullSafeNavigation) || maybeEatSelection(nullSafeNavigation)) {
            return pop();
        }
        if (peekToken() === null) {
            // unexpectedly ran out of data
            raiseInternalException(token.startPos, 'OOD');
        }
        else {
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
        if (!peekTokenOne(TokenKind.HASH)) {
            return false;
        }
        var token = nextToken();
        var functionOrVariableName = eatToken(TokenKind.IDENTIFIER);
        var args = maybeEatMethodArgs();
        if (args === null) {
            push(VariableReference.create(functionOrVariableName.data, toPosBounds(token.startPos, functionOrVariableName.endPos)));
            return true;
        }

        push(FunctionReference.create(functionOrVariableName.data, toPosBounds(token.startPos, functionOrVariableName.endPos), args));
        return true;
    }

    // methodArgs : LPAREN! (argument (COMMA! argument)* (COMMA!)?)? RPAREN!;
    function maybeEatMethodArgs() {
        if (!peekTokenOne(TokenKind.LPAREN)) {
            return null;
        }
        var args = [];
        consumeArguments(args);
        eatToken(TokenKind.RPAREN);
        return args;
    }

    function eatConstructorArgs(accumulatedArguments) {
        if (!peekTokenOne(TokenKind.LPAREN)) {
            raiseInternalException(toPosToken(peekToken()), 'MISSING_CONSTRUCTOR_ARGS');
        }
        consumeArguments(accumulatedArguments);
        eatToken(TokenKind.RPAREN);
    }

    /**
     * Used for consuming arguments for either a method or a constructor call
     */
    function consumeArguments(accumulatedArguments) {
        var pos = peekToken().startPos;
        var next;
        do {
            nextToken();  // consume ( (first time through) or comma (subsequent times)
            var token = peekToken();
            if (token === null) {
                raiseInternalException(pos, 'RUN_OUT_OF_ARGUMENTS');
            }
            if (token.getKind() !== TokenKind.RPAREN) {
                accumulatedArguments.push(eatExpression());
            }
            next = peekToken();
        }
        while (next !== null && next.kind === TokenKind.COMMA);

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
        }
        else if (maybeEatParenExpression()) {
            return pop();
        }
        else if (maybeEatTypeReference() || maybeEatNullReference() || maybeEatConstructorReference() || maybeEatMethodOrProperty(false) || maybeEatFunctionOrVar()) {
            return pop();
        }
        else if (maybeEatBeanReference()) {
            return pop();
        }
        else if (maybeEatProjection(false) || maybeEatSelection(false) || maybeEatIndexer()) {
            return pop();
        }
        else if (maybeEatInlineListOrMap()) {
            return pop();
        }
        else {
            return null;
        }
    }

    // parse: @beanname @'bean.name'
    // quoted if dotted
    function maybeEatBeanReference() {
        if (peekTokenOne(TokenKind.BEAN_REF)) {
            var beanRefToken = nextToken();
            var beanNameToken = null;
            var beanName = null;
            if (peekTokenOne(TokenKind.IDENTIFIER)) {
                beanNameToken = eatToken(TokenKind.IDENTIFIER);
                beanName = beanNameToken.data;
            }
            else if (peekTokenOne(TokenKind.LITERAL_STRING)) {
                beanNameToken = eatToken(TokenKind.LITERAL_STRING);
                beanName = beanNameToken.stringValue();
                beanName = beanName.substring(1, beanName.length() - 1);
            }
            else {
                raiseInternalException(beanRefToken.startPos, 'INVALID_BEAN_REFERENCE');
            }

            var beanReference = BeanReference.create(toPosToken(beanNameToken), beanName);
            push(beanReference);
            return true;
        }
        return false;
    }

    function maybeEatTypeReference() {
        if (peekTokenOne(TokenKind.IDENTIFIER)) {
            var typeName = peekToken();
            if (typeName.stringValue() !== 'T') {
                return false;
            }
            // It looks like a type reference but is T being used as a map key?
            var token = nextToken();
            if (peekTokenOne(TokenKind.RSQUARE)) {
                // looks like 'T]' (T is map key)
                push(PropertyReference.create(token.stringValue(), toPosToken(token)));
                return true;
            }
            eatToken(TokenKind.LPAREN);
            var node = eatPossiblyQualifiedId();
            // dotted qualified id
            // Are there array dimensions?
            var dims = 0;
            while (peekTokenConsumeIfMatched(TokenKind.LSQUARE, true)) {
                eatToken(TokenKind.RSQUARE);
                dims++;
            }
            eatToken(TokenKind.RPAREN);
            push(TypeReference.create(toPosToken(typeName), node, dims));
            return true;
        }
        return false;
    }

    function maybeEatNullReference() {
        if (peekTokenOne(TokenKind.IDENTIFIER)) {
            var nullToken = peekToken();
            if (nullToken.stringValue().toLowerCase() !== 'null') {
                return false;
            }
            nextToken();
            push(NullLiteral.create(toPosToken(nullToken)));
            return true;
        }
        return false;
    }

    //projection: PROJECT^ expression RCURLY!;
    function maybeEatProjection(nullSafeNavigation) {
        var token = peekToken();
        if (!peekTokenConsumeIfMatched(TokenKind.PROJECT, true)) {
            return false;
        }
        var expr = eatExpression();
        eatToken(TokenKind.RSQUARE);
        push(Projection.create(nullSafeNavigation, toPosToken(token), expr));
        return true;
    }

    // list = LCURLY (element (COMMA element)*) RCURLY
    // map  = LCURLY (key ':' value (COMMA key ':' value)*) RCURLY
    function maybeEatInlineListOrMap() {
        var token = peekToken(),
            listElements = [];

        if (!peekTokenConsumeIfMatched(TokenKind.LCURLY, true)) {
            return false;
        }
        var expr = null;
        var closingCurly = peekToken();
        if (peekTokenConsumeIfMatched(TokenKind.RCURLY, true)) {
            // empty list '{}'
            expr = InlineList.create(toPosBounds(token.startPos, closingCurly.endPos));
        }
        else if (peekTokenConsumeIfMatched(TokenKind.COLON, true)) {
            closingCurly = eatToken(TokenKind.RCURLY);
            // empty map '{:}'
            expr = InlineMap.create(toPosBounds(token.startPos, closingCurly.endPos));
        }
        else {
            var firstExpression = eatExpression();
            // Next is either:
            // '}' - end of list
            // ',' - more expressions in this list
            // ':' - this is a map!

            if (peekTokenOne(TokenKind.RCURLY)) { // list with one item in it
                listElements.push(firstExpression);
                closingCurly = eatToken(TokenKind.RCURLY);
                expr = InlineList.create(toPosBounds(token.startPos, closingCurly.endPos), listElements);
            }
            else if (peekTokenConsumeIfMatched(TokenKind.COMMA, true)) { // multi item list
                listElements.push(firstExpression);
                do {
                    listElements.push(eatExpression());
                }
                while (peekTokenConsumeIfMatched(TokenKind.COMMA, true));
                closingCurly = eatToken(TokenKind.RCURLY);
                expr = InlineList.create(toPosToken(token.startPos, closingCurly.endPos), listElements);

            }
            else if (peekTokenConsumeIfMatched(TokenKind.COLON, true)) {  // map!
                var mapElements = [];
                mapElements.push(firstExpression);
                mapElements.push(eatExpression());
                while (peekTokenConsumeIfMatched(TokenKind.COMMA, true)) {
                    mapElements.push(eatExpression());
                    eatToken(TokenKind.COLON);
                    mapElements.push(eatExpression());
                }
                closingCurly = eatToken(TokenKind.RCURLY);
                expr = InlineMap.create(toPosBounds(token.startPos, closingCurly.endPos), mapElements);
            }
            else {
                raiseInternalException(token.startPos, 'OOD');
            }
        }
        push(expr);
        return true;
    }

    function maybeEatIndexer() {
        var token = peekToken();
        if (!peekTokenConsumeIfMatched(TokenKind.LSQUARE, true)) {
            return false;
        }
        var expr = eatExpression();
        eatToken(TokenKind.RSQUARE);
        push(Indexer.create(toPosToken(token), expr));
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
        eatToken(TokenKind.RSQUARE);
        if (token.getKind() === TokenKind.SELECT_FIRST) {
            push(Selection.create(nullSafeNavigation, Selection.FIRST, toPosToken(token), expr));
        }
        else if (token.getKind() === TokenKind.SELECT_LAST) {
            push(Selection.create(nullSafeNavigation, Selection.LAST, toPosToken(token), expr));
        }
        else {
            push(Selection.create(nullSafeNavigation, Selection.ALL, toPosToken(token), expr));
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
            if (node.kind !== TokenKind.DOT) {
                qualifiedIdPieces.push(Identifier.create(node.stringValue(), toPosToken(node)));
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
        return QualifiedIdentifier.create(pos, qualifiedIdPieces);
    }

    function isValidQualifiedId(node) {
        if (node === null || node.kind === TokenKind.LITERAL_STRING) {
            return false;
        }
        if (node.kind === TokenKind.DOT || node.kind === TokenKind.IDENTIFIER) {
            return true;
        }
        var value = node.stringValue();
        return (value && value.length && VALID_QUALIFIED_ID_PATTERN.test(value));
    }

    // This is complicated due to the support for dollars in identifiers.  Dollars are normally separate tokens but
    // there we want to combine a series of identifiers and dollars into a single identifier
    function maybeEatMethodOrProperty(nullSafeNavigation) {
        if (peekTokenOne(TokenKind.IDENTIFIER)) {
            var methodOrPropertyName = nextToken();
            var args = maybeEatMethodArgs();
            if (args === null) {
                // property
                push(PropertyReference.create(nullSafeNavigation, methodOrPropertyName.stringValue(), toPosToken(methodOrPropertyName)));
                return true;
            }
            // methodreference
            push(MethodReference.create(nullSafeNavigation, methodOrPropertyName.stringValue(), toPosToken(methodOrPropertyName), args));
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
            if (peekTokenOne(TokenKind.RSQUARE)) {
                // looks like 'NEW]' (so NEW used as map key)
                push(PropertyReference.create(newToken.stringValue(), toPosToken(newToken)));
                return true;
            }
            var possiblyQualifiedConstructorName = eatPossiblyQualifiedId();
            var nodes = [];
            nodes.push(possiblyQualifiedConstructorName);
            if (peekTokenOne(TokenKind.LSQUARE)) {
                // array initializer
                var dimensions = [];
                while (peekTokenConsumeIfMatched(TokenKind.LSQUARE, true)) {
                    if (!peekTokenOne(TokenKind.RSQUARE)) {
                        dimensions.push(eatExpression());
                    }
                    else {
                        dimensions.push(null);
                    }
                    eatToken(TokenKind.RSQUARE);
                }
                if (maybeEatInlineListOrMap()) {
                    nodes.push(pop());
                }
                push(ConstructorReference.create(toPosToken(newToken), dimensions, nodes));
            }
            else {
                // regular constructor invocation
                eatConstructorArgs(nodes);
                // TODO correct end position?
                push(ConstructorReference.create(toPosToken(newToken), nodes));
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
        if (token.getKind() === TokenKind.LITERAL_INT ||
            token.getKind() === TokenKind.LITERAL_LONG) {
            push(NumberLiteral.create(parseInt(token.stringValue(), 10), toPosToken(token)));
        }
        else if (   token.getKind() === TokenKind.LITERAL_REAL ||
                    token.getKind() === TokenKind.LITERAL_REAL_FLOAT) {
            push(NumberLiteral.create(parseFloat(token.stringValue()), toPosToken(token)));
        }
        else if (   token.getKind() === TokenKind.LITERAL_HEXINT ||
                    token.getKind() === TokenKind.LITERAL_HEXLONG) {
            push(NumberLiteral.create(parseInt(token.stringValue(), 16), toPosToken(token)));
        }
        else if (peekIdentifierToken('true')) {
            push(BooleanLiteral.create(true, toPosToken(token)));
        }
        else if (peekIdentifierToken('false')) {
            push(BooleanLiteral.create(false, toPosToken(token)));
        }
        else if (token.getKind() === TokenKind.LITERAL_STRING) {
            push(StringLiteral.create(token.stringValue(), toPosToken(token)));
        }
        else {
            return false;
        }
        nextToken();
        return true;
    }

    //parenExpr : LPAREN! expression RPAREN!;
    function maybeEatParenExpression() {
        if (peekTokenOne(TokenKind.LPAREN)) {
            nextToken();
            var expr = eatExpression();
            eatToken(TokenKind.RPAREN);
            push(expr);
            return true;
        }
        else {
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
            raiseInternalException(token.startPos, 'NOT_EXPECTED_TOKEN',
                expectedKind.toString().toLowerCase(), token.getKind().toString().toLowerCase());
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

        if (desiredTokenKind === TokenKind.IDENTIFIER) {
            // might be one of the textual forms of the operators (e.g. NE for !== ) - in which case we can treat it as an identifier
            // The list is represented here: Tokenizer.alternativeOperatorNames and those ones are in order in the TokenKind enum
            if (token.getKind().ordinal() >= TokenKind.DIV.ordinal() && token.getKind().ordinal() <= TokenKind.NOT.ordinal() && token.data !== null) {
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
        return token.getKind() === TokenKind.IDENTIFIER && token.stringValue().toLowerCase() === identifierString.toLowerCase();
    }

    function peekSelectToken() {
        if (!moreTokens()) {
            return false;
        }
        var token = peekToken();
        return token.getKind() === TokenKind.SELECT || token.getKind() === TokenKind.SELECT_FIRST || token.getKind() === TokenKind.SELECT_LAST;
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
