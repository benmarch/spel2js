(function (exports) {
    'use strict';

    // ordered by priority - operands first
    var types = {

        LITERAL_INT: 1,             //tested

        LITERAL_LONG: 2,            //tested

        LITERAL_HEXINT: 3,          //tested

        LITERAL_HEXLONG: 4,         //tested

        LITERAL_STRING: 5,          //tested

        LITERAL_REAL: 6,            //tested

        LITERAL_REAL_FLOAT: 7,      //tested

        LPAREN: "(",                //tested

        RPAREN: ")",                //tested

        COMMA: ",",                 //tested

        IDENTIFIER: 0,              //tested

        COLON: ":",                 //tested

        HASH: "#",                  //tested

        RSQUARE: "]",               //tested

        LSQUARE: "[",               //tested

        LCURLY: "{",                //tested

        RCURLY: "}",                //tested

        DOT: ".",                   //tested

        PLUS: "+",                  //tested

        STAR: "*",                  //tested

        MINUS: "-",                 //tested

        SELECT_FIRST: "^[",         //tested

        SELECT_LAST: "$[",          //tested

        QMARK: "?",                 //tested

        PROJECT: "![",              //tested

        DIV: "/",                   //tested

        GE: ">=",                   //tested

        GT: ">",                    //tested

        LE: "<=",                   //tested

        LT: "<",                    //tested

        EQ: "==",                   //tested

        NE: "!=",                   //tested

        MOD: "%",                   //tested

        NOT: "!",                   //tested

        ASSIGN: "=",                //tested

        INSTANCEOF: "instanceof",   //test fails

        MATCHES: "matches",         //test fails

        BETWEEN: "between",         //test fails

        SELECT: "?[",               //tested

        POWER: "^",                 //tested

        ELVIS: "?:",                //tested

        SAFE_NAVI: "?.",            //tested

        BEAN_REF: "@",              //tested

        SYMBOLIC_OR: "||",          //tested

        SYMBOLIC_AND: "&&",         //tested

        INC: "++",                  //tested

        DEC: "--"                   //tested
    };

    function TokenKind(type) {
        this.type = type;
        this.tokenChars = types[type];
        this._hasPayload = typeof types[type] !== 'string';
    }

    //create enum
    for (var t in types) {
        if (types.hasOwnProperty(t)) {
            TokenKind[t] = new TokenKind(t);
        }
    }

    TokenKind.prototype.toString = function () {
        return this.type + (this.tokenChars.length != 0 ? "(" + this.tokenChars + ")" : "")
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

    exports.TokenKind = TokenKind;

}(window || exports));
