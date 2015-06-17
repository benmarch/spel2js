(function (exports) {
    'use strict';

    var TokenKind,
        tokenize,
        RootNode,
        BooleanNode,
        NumberNode,
        StringNode,
        FunctionReference,
        MethodReference,
        PropertyReference;

    try {
        TokenKind = require('./TokenKind');
        tokenize = require('./tokenizer');
        RootNode = require('./ast/RootNode');
        BooleanNode = require('./ast/BooleanNode');
        NumberNode = require('./ast/NumberNode');
        StringNode = require('./ast/StringNode');
        FunctionReference = require('./ast/FunctionReference');
        MethodReference = require('./ast/MethodReference');
        PropertyReference = require('./ast/PropertyReference');
    } catch (e) {
        TokenKind = exports.TokenKind;
        tokenize = exports.tokenize;
        RootNode = exports.RootNode;
        BooleanNode = exports.BooleanNode;
        NumberNode = exports.NumberNode;
        StringNode = exports.StringNode;
        FunctionReference = exports.FunctionReference;
        MethodReference = exports.MethodReference;
        PropertyReference = exports.PropertyReference;
    }

    function compile(expression) {
        var tokens = tokenize(expression);
        return {
            eval: function (context) {
                return parse2(tokens, context, context, RootNode.create(context)).getValue();
            }
        }
    }


    function parse2(tokens, localContext, rootContext, ast) {

        do {
            var token = tokens[0];

            if (token) {
                switch (token.getKind()) {

                case TokenKind.LITERAL_HEXINT:
                case TokenKind.LITERAL_HEXLONG:
                case TokenKind.LITERAL_INT:
                case TokenKind.LITERAL_LONG:
                    tokens.shift();
                    ast.addChild(NumberNode.create(parseInt(token.stringValue(), 10)));
                    break;

                case TokenKind.LITERAL_REAL:
                case TokenKind.LITERAL_REAL_FLOAT:
                    tokens.shift();
                    ast.addChild(NumberNode.create(parseFloat(token.stringValue())));
                    break;

                case TokenKind.LITERAL_STRING:
                    tokens.shift();
                    ast.addChild(StringNode.create(token.stringValue().replace(/(\'|\")/g, '')));
                    break;

                case TokenKind.IDENTIFIER:
                    handleLexIdentifier(tokens, localContext, ast);
                    break;
                }
            }
        } while (tokens.length);

        return ast;

    }

    function handleLexIdentifier(tokens, context, ast) {
        var token = tokens[0];

        //booleans
        if (token.stringValue() === 'true') {
            tokens.shift();
            ast.addChild(BooleanNode.create(true));
        }
        else if (token.stringValue() === 'false') {
            tokens.shift();
            ast.addChild(BooleanNode.create(false));
        }

        //lookups
        else if (tokens[1]) {
            if (tokens[1].getKind() === TokenKind.DOT) {
                tokens.shift();
                tokens.shift();
                var nextReference = PropertyReference.create(context, token.stringValue());
                ast.addChild(nextReference);
                parse2(tokens, nextReference.getContext(), context, nextReference);
            }
            else if (tokens[1].getKind() === TokenKind.LSQUARE) {
                tokens.shift();
                tokens.shift();
                var subTokens = [],
                    nextToken;
                do {
                    subTokens.push(tokens[0]);
                    nextToken = tokens.shift();
                    if (!nextToken) {
                        throw {
                            name: 'SpelParseException',
                            message: 'Missing square bracket at position: ' + token.startPos
                        };
                    }
                } while (nextToken.getKind() !== TokenKind.RSQUARE);

                var nextReference = PropertyReference.create(context, token.stringValue());
                ast.addChild(nextReference);
                parse2(subTokens, context, context, ast);
                parse2(tokens, nextReference, context, nextReference);
            }
        }


        else {
            tokens.shift();
            ast.addChild(PropertyReference.create(context, token.stringValue()));
        }
    }


    exports.spelExpressionParser = {
        compile: compile,
        parse: function (expression, context) {
            return compile(expression).eval(context);
        }
    };

}(window || exports));
