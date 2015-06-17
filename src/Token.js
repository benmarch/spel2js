(function (exports) {
    'use strict';

    var TokenKind;

    try {
        TokenKind = require('./TokenKind').TokenKind;
    } catch(e) {
        TokenKind = exports.TokenKind;
    }

    function Token(tokenKind, tokenData, startPos, endPos) {
        this.kind = tokenKind;
        this.startPos = startPos;
        this.endPos = endPos;
        if (tokenData) {
            this.data = tokenData;
        }
        if (!endPos) {
            debugger;
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
        return (this.kind == TokenKind.IDENTIFIER);
    };

    Token.prototype.isNumericRelationalOperator = function () {
        return (this.kind == TokenKind.GT || this.kind == TokenKind.GE || this.kind == TokenKind.LT ||
                this.kind == TokenKind.LE || this.kind==TokenKind.EQ || this.kind==TokenKind.NE);
    };

    Token.prototype.stringValue = function () {
        return this.data;
    };

    Token.prototype.asInstanceOfToken = function () {
        return new Token(TokenKind.INSTANCEOF, this.startPos, this.endPos);
    };

    Token.prototype.asMatchesToken = function () {
        return new Token(TokenKind.MATCHES, this.startPos, this.endPos);
    };

    Token.prototype.asBetweenToken = function () {
        return new Token(TokenKind.BETWEEN, this.startPos, this.endPos);
    };

    Token.prototype.getStartPosition = function () {
        return this.startPos;
    };

    Token.prototype.getEndPosition = function () {
        return this.endPos;
    };

    exports.Token = Token;

}(window || exports));
