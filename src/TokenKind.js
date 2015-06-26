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

var types = {

    LITERAL_INT: 1,             //tested

    LITERAL_LONG: 2,            //tested

    LITERAL_HEXINT: 3,          //tested

    LITERAL_HEXLONG: 4,         //tested

    LITERAL_STRING: 5,          //tested

    LITERAL_REAL: 6,            //tested

    LITERAL_REAL_FLOAT: 7,      //tested

    LPAREN: '(',                //tested

    RPAREN: ')',                //tested

    COMMA: ',',                 //tested

    IDENTIFIER: 0,              //tested

    COLON: ':',                 //tested

    HASH: '#',                  //tested

    RSQUARE: ']',               //tested

    LSQUARE: '[',               //tested

    LCURLY: '{',                //tested

    RCURLY: '}',                //tested

    DOT: '.',                   //tested

    PLUS: '+',                  //tested

    STAR: '*',                  //tested

    MINUS: '-',                 //tested

    SELECT_FIRST: '^[',         //tested

    SELECT_LAST: '$[',          //tested

    QMARK: '?',                 //tested

    PROJECT: '![',              //tested

    DIV: '/',                   //tested

    GE: '>=',                   //tested

    GT: '>',                    //tested

    LE: '<=',                   //tested

    LT: '<',                    //tested

    EQ: '==',                   //tested

    NE: '!=',                   //tested

    MOD: '%',                   //tested

    NOT: '!',                   //tested

    ASSIGN: '=',                //tested

    INSTANCEOF: 'instanceof',   //test fails

    MATCHES: 'matches',         //test fails

    BETWEEN: 'between',         //test fails

    SELECT: '?[',               //tested

    POWER: '^',                 //tested

    ELVIS: '?:',                //tested

    SAFE_NAVI: '?.',            //tested

    BEAN_REF: '@',              //tested

    SYMBOLIC_OR: '||',          //tested

    SYMBOLIC_AND: '&&',         //tested

    INC: '++',                  //tested

    DEC: '--'                   //tested
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

export {TokenKind};
