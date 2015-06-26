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

import {Token} from './Token';
import {TokenKind} from './TokenKind';

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
            }
            else {
                switch (ch) {
                case '+':
                    if (isTwoCharToken(TokenKind.INC)) {
                        pushPairToken(TokenKind.INC);
                    }
                    else {
                        pushCharToken(TokenKind.PLUS);
                    }
                    break;
                case '_': // the other way to start an identifier
                    lexIdentifier();
                    break;
                case '-':
                    if (isTwoCharToken(TokenKind.DEC)) {
                        pushPairToken(TokenKind.DEC);
                    }
                    else {
                        pushCharToken(TokenKind.MINUS);
                    }
                    break;
                case ':':
                    pushCharToken(TokenKind.COLON);
                    break;
                case '.':
                    pushCharToken(TokenKind.DOT);
                    break;
                case ',':
                    pushCharToken(TokenKind.COMMA);
                    break;
                case '*':
                    pushCharToken(TokenKind.STAR);
                    break;
                case '/':
                    pushCharToken(TokenKind.DIV);
                    break;
                case '%':
                    pushCharToken(TokenKind.MOD);
                    break;
                case '(':
                    pushCharToken(TokenKind.LPAREN);
                    break;
                case ')':
                    pushCharToken(TokenKind.RPAREN);
                    break;
                case '[':
                    pushCharToken(TokenKind.LSQUARE);
                    break;
                case '#':
                    pushCharToken(TokenKind.HASH);
                    break;
                case ']':
                    pushCharToken(TokenKind.RSQUARE);
                    break;
                case '{':
                    pushCharToken(TokenKind.LCURLY);
                    break;
                case '}':
                    pushCharToken(TokenKind.RCURLY);
                    break;
                case '@':
                    pushCharToken(TokenKind.BEAN_REF);
                    break;
                case '^':
                    if (isTwoCharToken(TokenKind.SELECT_FIRST)) {
                        pushPairToken(TokenKind.SELECT_FIRST);
                    }
                    else {
                        pushCharToken(TokenKind.POWER);
                    }
                    break;
                case '!':
                    if (isTwoCharToken(TokenKind.NE)) {
                        pushPairToken(TokenKind.NE);
                    }
                    else if (isTwoCharToken(TokenKind.PROJECT)) {
                        pushPairToken(TokenKind.PROJECT);
                    }
                    else {
                        pushCharToken(TokenKind.NOT);
                    }
                    break;
                case '=':
                    if (isTwoCharToken(TokenKind.EQ)) {
                        pushPairToken(TokenKind.EQ);
                    }
                    else {
                        pushCharToken(TokenKind.ASSIGN);
                    }
                    break;
                case '&':
                    if (!isTwoCharToken(TokenKind.SYMBOLIC_AND)) {
                        throw {
                            name: 'SpelParseException',
                            message: 'Missing character \'&\' in expression (' + expressionString + ') at position ' + pos
                        };
                    }
                    pushPairToken(TokenKind.SYMBOLIC_AND);
                    break;
                case '|':
                    if (!isTwoCharToken(TokenKind.SYMBOLIC_OR)) {
                        throw {
                            name: 'SpelParseException',
                            message: 'Missing character \'|\' in expression (' + expressionString + ') at position ' + pos
                        };
                    }
                    pushPairToken(TokenKind.SYMBOLIC_OR);
                    break;
                case '?':
                    if (isTwoCharToken(TokenKind.SELECT)) {
                        pushPairToken(TokenKind.SELECT);
                    }
                    else if (isTwoCharToken(TokenKind.ELVIS)) {
                        pushPairToken(TokenKind.ELVIS);
                    }
                    else if (isTwoCharToken(TokenKind.SAFE_NAVI)) {
                        pushPairToken(TokenKind.SAFE_NAVI);
                    }
                    else {
                        pushCharToken(TokenKind.QMARK);
                    }
                    break;
                case '$':
                    if (isTwoCharToken(TokenKind.SELECT_LAST)) {
                        pushPairToken(TokenKind.SELECT_LAST);
                    }
                    else {
                        lexIdentifier();
                    }
                    break;
                case '>':
                    if (isTwoCharToken(TokenKind.GE)) {
                        pushPairToken(TokenKind.GE);
                    }
                    else {
                        pushCharToken(TokenKind.GT);
                    }
                    break;
                case '<':
                    if (isTwoCharToken(TokenKind.LE)) {
                        pushPairToken(TokenKind.LE);
                    }
                    else {
                        pushCharToken(TokenKind.LT);
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
                }
                else {
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
        tokens.push(new Token(TokenKind.LITERAL_STRING, subarray(start, pos), start, pos));
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
                }
                else {
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
        tokens.push(new Token(TokenKind.LITERAL_STRING, subarray(start, pos), start, pos));
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
            }
            while (isHexadecimalDigit(toProcess[pos]));
            if (isChar('L', 'l')) {
                pushHexIntToken(subarray(start + 2, pos), true, start, pos);
                pos += 1;
            }
            else {
                pushHexIntToken(subarray(start + 2, pos), false, start, pos);
            }
            return;
        }

        // real numbers must have leading digits

        // Consume first part of number
        do {
            pos += 1;
        }
        while (isDigit(toProcess[pos]));

        // a '.' indicates this number is a real
        ch = toProcess[pos];
        if (ch === '.') {
            isReal = true;
            dotpos = pos;
            // carry on consuming digits
            do {
                pos += 1;
            }
            while (isDigit(toProcess[pos]));
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
            if (isReal) { // 3.4L - not allowed
                throw {
                    name: 'SpelParseException',
                    message: 'Real cannot be long in expression (' + expressionString + ') at position ' + pos
                };
            }
            pushIntToken(subarray(start, endOfNumber), true, start, endOfNumber);
            pos += 1;
        }
        else if (isExponentChar(toProcess[pos])) {
            isReal = true; // if it wasn't before, it is now
            pos += 1;
            possibleSign = toProcess[pos];
            if (isSign(possibleSign)) {
                pos += 1;
            }

            // exponent digits
            do {
                pos += 1;
            }
            while (isDigit(toProcess[pos]));
            isFloat = false;
            if (isFloatSuffix(toProcess[pos])) {
                isFloat = true;
                pos += 1;
                endOfNumber = pos;
            }
            else if (isDoubleSuffix(toProcess[pos])) {
                pos += 1;
                endOfNumber = pos;
            }
            pushRealToken(subarray(start, pos), isFloat, start, pos);
        }
        else {
            ch = toProcess[pos];
            isFloat = false;
            if (isFloatSuffix(ch)) {
                isReal = true;
                isFloat = true;
                pos += 1;
                endOfNumber = pos;
            }
            else if (isDoubleSuffix(ch)) {
                isReal = true;
                pos += 1;
                endOfNumber = pos;
            }
            if (isReal) {
                pushRealToken(subarray(start, endOfNumber), isFloat, start, endOfNumber);
            }
            else {
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
        }
        while (isIdentifier(toProcess[pos]));
        substring = subarray(start, pos);

        // Check if this is the alternative (textual) representation of an operator (see
        // alternativeOperatorNames)
        if ((pos - start) === 2 || (pos - start) === 3) {
            asString = substring.toUpperCase();
            idx = ALTERNATIVE_OPERATOR_NAMES.indexOf(asString);
            if (idx >= 0) {
                pushOneCharOrTwoCharToken(TokenKind.valueOf(asString), start, substring);
                return;
            }
        }
        tokens.push(new Token(TokenKind.IDENTIFIER, substring.replace('\0', ''), start, pos));
    }

    function pushIntToken(data, isLong, start, end) {
        if (isLong) {
            tokens.push(new Token(TokenKind.LITERAL_LONG, data, start, end));
        }
        else {
            tokens.push(new Token(TokenKind.LITERAL_INT, data, start, end));
        }
    }

    function pushHexIntToken(data, isLong, start, end) {
        if (data.length === 0) {
            if (isLong) {
                throw {
                    name: 'SpelParseException',
                    message: 'Not a long in expression (' + expressionString + ') at position ' + pos
                };
            }
            else {
                throw {
                    name: 'SpelParseException',
                    message: 'Not an int in expression (' + expressionString + ') at position ' + pos
                };
            }
        }
        if (isLong) {
            tokens.push(new Token(TokenKind.LITERAL_HEXLONG, data, start, end));
        }
        else {
            tokens.push(new Token(TokenKind.LITERAL_HEXINT, data, start, end));
        }
    }

    function pushRealToken(data, isFloat, start, end) {
        if (isFloat) {
            tokens.push(new Token(TokenKind.LITERAL_REAL_FLOAT, data, start, end));
        }
        else {
            tokens.push(new Token(TokenKind.LITERAL_REAL, data, start, end));
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
        tokens.push(new Token(kind, null, pos, pos + 1));
        pos += 1;
    }

    /**
     * Push a token of two characters in length.
     */
    function pushPairToken(kind) {
        tokens.push(new Token(kind, null, pos, pos + 2));
        pos += 2;
    }

    function pushOneCharOrTwoCharToken(kind, pos, data) {
        tokens.push(new Token(kind, data, pos, pos + kind.getLength()));
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

export var Tokenizer = {
    tokenize: tokenize
};
