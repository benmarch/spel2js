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

    TokenKind.prototype.ordinal = function () {
        return this._ordinal;
    };

    exports.TokenKind = TokenKind;

}(window || exports));

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

(function (exports) {
    'use strict';

    var ALTERNATIVE_OPERATOR_NAMES = ["DIV", "EQ", "GE", "GT", "LE", "LT", "MOD", "NE", "NOT"],
        FLAGS = [],
        IS_DIGIT = 1,
        IS_HEXDIGIT = 2,
        IS_ALPHA = 4,

        Token,
        TokenKind;

    try {
        Token = require('./Token').Token;
        TokenKind = require('./TokenKind').TokenKind;
    } catch(e) {
        Token = exports.Token;
        TokenKind = exports.TokenKind;
    }

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
                if (ch == '\'') {
                    // may not be the end if the char after is also a '
                    if (toProcess[pos + 1] == '\'') {
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
                if (ch == '"') {
                    // may not be the end if the char after is also a '
                    if (toProcess[pos + 1] == '"') {
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
                isHex = ch == 'x' || ch == 'X',
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
            if (ch == '.') {
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
            if (kind.tokenChars.length === 2 && toProcess[pos] == kind.tokenChars[0]) {
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

    exports.Tokenizer = {
        tokenize: tokenize
    };

}(window || exports));

(function (exports) {
    'use strict';

    function createSpelNode(nodeType, position /*, operands */) {
        var node = {},
            type = nodeType || 'Abstract',
            children = [],
            parent = null,
            args = Array.prototype.slice.call(arguments),
            operands = args.length > 2 ? args.slice(2) : null,
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
            return (position >> 16);
        };

        node.getEndPosition = function () {
            return (position & 0xffff);
        };

        //must override
        node.getValue = function () {
            throw {
                name: 'MethodNotImplementedException',
                message: 'SpelNode#getValue() must be overridden.'
            }
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

        if (operands) {
            operands.forEach(function (operand) {
                node.addChild(operand);
            });
        }


        return node;
    }

    exports.SpelNode = {
        create: createSpelNode
    };

}(window || exports));

(function (exports, undefined) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, property, assignedValue) {
        var node = SpelNode.create('assign', position, property, assignedValue);

        node.getValue = function (state) {
            var context = state.activeContext.peek();

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to assign property \''+ property.getValue(state) +'\' for an undefined context.'
                }
            }

            return property.setValue(assignedValue.getValue(state), state);
        };

        return node;
    }

    exports.Assign = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('boolean', position);

        node.getValue = function () {
            return value;
        };

        node.setValue = function (newValue) {
            value = newValue;
        };

        return node;
    }

    exports.BooleanLiteral = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expressionComponents) {
        var node = SpelNode.create.apply(null, ['compound', position].concat(expressionComponents));

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
            }
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

    exports.CompoundExpression = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expression, ifFalse) {
        var node = SpelNode.create('elvis', position, expression, ifFalse);

        node.getValue = function (state) {
            return expression.getValue(state) !== null ? expression.getValue(state) : ifFalse.getValue(state);
        };

        return node;
    }

    exports.Elvis = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(parent, functionName) {
        var node = SpelNode.create('method', parent);

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
            }
        };

        return node;
    }

    exports.FunctionReference = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expressionComponents) {
        var node = SpelNode.create.apply(null, ['indexer', position].concat(expressionComponents));

        node.getValue = function (state) {
            var activeContext = state.activeContext,
                context,
                childrenCount = node.getChildren().length,
                i,
                value;

            state.activeContext = new Stack();
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

    exports.Indexer = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, elements) {
        var node = SpelNode.create('list', position),
            list = [].concat(elements || []);

        node.getValue = function (state) {
            return list.map(function (element) {
                return element.getValue(state);
            });
        };

        return node;
    }

    exports.InlineList = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, elements) {
        var node = SpelNode.create('map', position),
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

    exports.InlineMap = {
        create: createNode
    };

}(window || exports));

(function (exports, undefined) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(nullSafeNavigation, methodName, position, args) {
        var node = SpelNode.create('method', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                compiledArgs = [],
                method;

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ methodName +'\' for an undefined context.'
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
                return context[methodName.charAt(3).toLowerCase() + methodName.substring(4)] = compiledArgs[0];
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

    exports.MethodReference = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('null', position);

        node.getValue = function () {
            return null;
        };

        return node;
    }

    exports.NullLiteral = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('number', position);

        node.getValue = function () {
            return value;
        };

        node.setValue = function (newValue) {
            value = newValue;
        };

        return node;
    }

    exports.NumberLiteral = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-and', position, left, right);

        node.getValue = function (state) {
            //double bang for javascript
            return !!left.getValue(state) && !!right.getValue(state);
        };

        return node;
    }

    exports.OpAnd = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, postfix, int) {
        var node = SpelNode.create('op-dec', position, int);

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

    exports.OpDec = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-divide', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) / right.getValue(state);
        };

        return node;
    }

    exports.OpDivide = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-eq', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) === right.getValue(state);
        };

        return node;
    }

    exports.OpEQ = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-ge', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) >= right.getValue(state);
        };

        return node;
    }

    exports.OpGE = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-gt', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) > right.getValue(state);
        };

        return node;
    }

    exports.OpGT = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, postfix, int) {
        var node = SpelNode.create('op-inc', position, int);

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

    exports.OpInc = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-le', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) <= right.getValue(state);
        };

        return node;
    }

    exports.OpLE = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-lt', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) < right.getValue(state);
        };

        return node;
    }

    exports.OpLT = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-minus', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) - right.getValue(state);
        };

        return node;
    }

    exports.OpMinus = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-modulus', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) % right.getValue(state);
        };

        return node;
    }

    exports.OpModulus = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-multiply', position, left, right);

        node.getValue = function (state) {
            var leftValue = left.getValue(state),
                rightValue = right.getValue(state);

            if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                return leftValue * rightValue;
            }

            //repeats (ex. 'abc' * 2 = 'abcabc')
            if (typeof leftValue === 'string' && typeof  rightValue === 'number') {
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

    exports.OpMultiply = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-ne', position, left, right);

        node.getValue = function (state) {
            return left.getValue(state) !== right.getValue(state);
        };

        return node;
    }

    exports.OpNE = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expr) {
        var node = SpelNode.create('op-not', position, expr);

        node.getValue = function (state) {
            return !expr.getValue(state);
        };

        return node;
    }

    exports.OpNot = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-or', position, left, right);

        node.getValue = function (state) {
            //double bang for javascript
            return !!left.getValue(state) || !!right.getValue(state);
        };

        return node;
    }

    exports.OpOr = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, left, right) {
        var node = SpelNode.create('op-plus', position, left, right);

        node.getValue = function (state) {
            //javascript will handle string concatenation or addition depending on types
            return left.getValue(state) + right.getValue(state);
        };

        return node;
    }

    exports.OpPlus = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, base, exp) {
        var node = SpelNode.create('op-power', position, base, exp);

        node.getValue = function (state) {
            return Math.pow(base.getValue(state), exp.getValue(state));
        };

        return node;
    }

    exports.OpPower = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

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
        var node = SpelNode.create('projection', position, expr);

        node.getValue = function (state) {
            var collection = state.activeContext.peek(),
                entries = [],
                key;

            if (Array.isArray(collection)) {
                return projectCollection(collection, expr, state);
            }
            else if (typeof collection === 'object') {
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

    exports.Projection = {
        create: createNode
    };

}(window || exports));

(function (exports, undefined) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(nullSafeNavigation, propertyName, position) {
        var node = SpelNode.create('property', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek();

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up property \''+ propertyName +'\' for an undefined context.'
                }
            }

            if (context[propertyName] === undefined) {
                //handle safe navigation
                if (nullSafeNavigation) {
                    return null;
                }

                //handle conversion of Java properties to JavaScript properties
                //this might cause problems, I'll look into alternatives
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
                    message: 'Attempting to assign property \''+ propertyName +'\' for an undefined context.'
                }
            }

            return context[propertyName] = value;
        };

        node.getName = function () {
            return propertyName;
        };

        return node;
    }

    exports.PropertyReference = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(context) {
        var node = SpelNode.create('root', null, context);

        node.getValue = function () {
            if (node.getChildren()[0]) {
                return node.getChildren()[0].getValue();
            }
            return null;
        };

        return node;
    }

    exports.RootNode = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function matches(element, expr, state) {
        var matches = false;
        state.activeContext.push(element);
        matches = expr.getValue(state);
        state.activeContext.pop();
        return matches;
    }

    function selectFromArray(collection, whichElement, expr, state) {
        var newCollection = collection.filter(function (element) {
            return matches(element, expr, state);
        });

        switch (whichElement) {
        case 'ALL':
            return newCollection;
            break;
        case 'FIRST':
            return newCollection[0] || null;
            break;
        case 'LAST':
            if (newCollection.length) {
                return newCollection[newCollection.length - 1];
                break;
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
            break;
        case 'FIRST':
            if (entries.length) {
                returnValue[entries[0].key] = entries[0].value;
                return returnValue;
            }
            return null;
            break;
        case 'LAST':
            if (entries.length) {
                returnValue[entries[entries.length - 1].key] = entries[entries.length - 1].value;
                return returnValue;
            }
            return null;
            break;
        }

        entries.forEach(function (entry) {
            newCollection[entry.key] = entry.value;
        });
    }

    function createNode(nullSafeNavigation, whichElement, position, expr) {
        var node = SpelNode.create('selection', position, expr);

        node.getValue = function (state) {
            var collection = state.activeContext.peek();

            if (collection) {
                if (Array.isArray(collection)) {
                    return selectFromArray(collection, whichElement, expr, state);
                }
                else if (typeof collection === 'object') {
                    return selectFromMap(collection, whichElement, expr, state);
                }
            }

            return null;
        };

        return node;
    }

    exports.Selection = {
        create: createNode,
        FIRST: 'FIRST',
        LAST: 'LAST',
        ALL: 'ALL'
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(value, position) {
        var node = SpelNode.create('string', position);

        function stripQuotes(value) {
            if ((value[0] === '\'' && value[value.length - 1] === '\'') ||
                (value[0] === '"' && value[value.length - 1] === '"')) {
                return value.substring(1, value.length - 1);
            }
            return value;
        }

        //value cannot be null so no check
        value = stripQuotes(value);

        node.getValue = function () {
            return value;
        };

        node.setValue = function (newValue) {
            value = newValue;
        };

        return node;
    }

    exports.StringLiteral = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(position, expression, ifTrue, ifFalse) {
        var node = SpelNode.create('ternary', position, expression, ifTrue, ifFalse);

        node.getValue = function (state) {
            return expression.getValue(state) ? ifTrue.getValue(state) : ifFalse.getValue(state);
        };

        return node;
    }

    exports.Ternary = {
        create: createNode
    };

}(window || exports));

(function (exports) {
    'use strict';

    var SpelNode;
    try {
        SpelNode = require('./SpelNode').SpelNode;
    } catch (e) {
        SpelNode = exports.SpelNode;
    }

    function createNode(variableName, position) {
        var node = SpelNode.create('variable', position);

        node.getValue = function (state) {
            var context = state.activeContext.peek(),
                locals = state.locals;

            if (!context) {
                throw {
                    name: 'ContextDoesNotExistException',
                    message: 'Attempting to look up variable \''+ variableName +'\' for an undefined context.'
                }
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

            return locals[variableName] = value;
        };

        return node;
    }

    exports.VariableReference = {
        create: createNode
    };

}(window || exports));

(function (exports) {

    var TokenKind,
        Tokenizer,
        RootNode,
        BooleanLiteral,
        NumberLiteral,
        StringLiteral,
        NullLiteral,
        FunctionReference,
        MethodReference,
        PropertyReference,
        VariableReference,
        CompoundExpression,
        Indexer,
        Assign,
        OpEQ,
        OpNE,
        OpGE,
        OpGT,
        OpLE,
        OpLT,
        OpPlus,
        OpMinus,
        OpMultiply,
        OpDivide,
        OpModulus,
        OpPower,
        OpInc,
        OpDec,
        OpNot,
        OpAnd,
        OpOr,
        Ternary,
        Elvis,
        InlineList,
        InlineMap,
        Selection,
        Projection;

    try {
        TokenKind = require('./TokenKind');
        Tokenizer = require('./Tokenizer');
        RootNode = require('./ast/RootNode');
        BooleanLiteral = require('./ast/BooleanLiteral');
        NumberLiteral = require('./ast/NumberLiteral');
        StringLiteral = require('./ast/StringLiteral');
        NullLiteral = require('./ast/NullLiteral');
        FunctionReference = require('./ast/FunctionReference');
        MethodReference = require('./ast/MethodReference');
        PropertyReference = require('./ast/PropertyReference');
        VariableReference = require('./ast/VariableReference');
        CompoundExpression = require('./ast/CompoundExpression');
        Indexer = require('./ast/Indexer');
        Assign = require('./ast/Assign');
        OpEQ = require('./ast/OpEQ');
        OpNE = require('./ast/OpNE');
        OpGE = require('./ast/OpGE');
        OpGT = require('./ast/OpGT');
        OpLE = require('./ast/OpLE');
        OpLT = require('./ast/OpLT');
        OpPlus = require('./ast/OpPlus');
        OpMinus = require('./ast/OpMinus');
        OpMultiply = require('./ast/OpMultiply');
        OpDivide = require('./ast/OpDivide');
        OpModulus = require('./ast/OpModulus');
        OpPower = require('./ast/OpPower');
        OpInc = require('./ast/OpInc');
        OpDec = require('./ast/OpDec');
        OpNot = require('./ast/OpNot');
        OpAnd = require('./ast/OpAnd');
        OpOr = require('./ast/OpOr');
        Ternary = require('./ast/Ternary');
        Elvis = require('./ast/Elvis');
        InlineList = require('./ast/InlineList');
        InlineMap = require('./ast/InlineMap');
        Selection = require('./ast/Selection');
        Projection = require('./ast/Projection');
    } catch (e) {
        TokenKind = exports.TokenKind;
        Tokenizer = exports.Tokenizer;
        RootNode = exports.RootNode;
        BooleanLiteral = exports.BooleanLiteral;
        NumberLiteral = exports.NumberLiteral;
        StringLiteral = exports.StringLiteral;
        NullLiteral = exports.NullLiteral;
        FunctionReference = exports.FunctionReference;
        MethodReference = exports.MethodReference;
        PropertyReference = exports.PropertyReference;
        VariableReference = exports.VariableReference;
        CompoundExpression = exports.CompoundExpression;
        Indexer = exports.Indexer;
        Assign = exports.Assign;
        OpEQ = exports.OpEQ;
        OpNE = exports.OpNE;
        OpGE = exports.OpGE;
        OpGT = exports.OpGT;
        OpLE = exports.OpLE;
        OpLT = exports.OpLT;
        OpPlus = exports.OpPlus;
        OpMinus = exports.OpMinus;
        OpMultiply = exports.OpMultiply;
        OpDivide = exports.OpDivide;
        OpModulus = exports.OpModulus;
        OpPower = exports.OpPower;
        OpInc = exports.OpInc;
        OpDec = exports.OpDec;
        OpNot = exports.OpNot;
        OpAnd = exports.OpAnd;
        OpOr = exports.OpOr;
        Ternary = exports.Ternary;
        Elvis = exports.Elvis;
        InlineList = exports.InlineList;
        InlineMap = exports.InlineMap;
        Selection = exports.Selection;
        Projection = exports.Projection;
    }


    var SpelExpressionParser = function () {


        var VALID_QUALIFIED_ID_PATTERN = new RegExp("[\\p{L}\\p{N}_$]+");


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
                if (token.getKind() == TokenKind.ASSIGN) {  // a=b
                    if (expr == null) {
                        expr = NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 1));
                    }
                    nextToken();
                    var assignedValue = eatLogicalOrExpression();
                    return Assign.create(toPosToken(token), expr, assignedValue);
                }

                if (token.getKind() == TokenKind.ELVIS) {  // a?:b (a if it isn't null, otherwise b)
                    if (expr == null) {
                        expr = NullLiteral.create(toPosBounds(token.startPos - 1, token.endPos - 2));
                    }
                    nextToken();  // elvis has left the building
                    var valueIfNull = eatExpression();
                    if (valueIfNull == null) {
                        valueIfNull = NullLiteral.create(toPosBounds(token.startPos + 1, token.endPos + 1));
                    }
                    return Elvis.create(toPosToken(token), expr, valueIfNull);
                }

                if (token.getKind() == TokenKind.QMARK) {  // a?b:c
                    if (expr == null) {
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
            while (peekIdentifierToken("or") || peekTokenOne(TokenKind.SYMBOLIC_OR)) {
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
            while (peekIdentifierToken("and") || peekTokenOne(TokenKind.SYMBOLIC_AND)) {
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
            if (relationalOperatorToken != null) {
                var token = nextToken();  // consume relational operator token
                var rhExpr = eatSumExpression();
                checkOperands(token, expr, rhExpr);
                var tk = relationalOperatorToken.kind;

                if (relationalOperatorToken.isNumericRelationalOperator()) {
                    var pos = toPosToken(token);
                    if (tk == TokenKind.GT) {
                        return OpGT.create(pos, expr, rhExpr);
                    }
                    if (tk == TokenKind.LT) {
                        return OpLT.create(pos, expr, rhExpr);
                    }
                    if (tk == TokenKind.LE) {
                        return OpLE.create(pos, expr, rhExpr);
                    }
                    if (tk == TokenKind.GE) {
                        return OpGE.create(pos, expr, rhExpr);
                    }
                    if (tk == TokenKind.EQ) {
                        return OpEQ.create(pos, expr, rhExpr);
                    }
                    //Assert.isTrue(tk == TokenKind.NE);
                    return OpNE.create(pos, expr, rhExpr);
                }

                if (tk == TokenKind.INSTANCEOF) {
                    return new OperatorInstanceof(toPosToken(token), expr, rhExpr);
                }

                if (tk == TokenKind.MATCHES) {
                    return new OperatorMatches(toPosToken(token), expr, rhExpr);
                }

                //Assert.isTrue(tk == TokenKind.BETWEEN);
                return new OperatorBetween(toPosToken(token), expr, rhExpr);
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
                if (token.getKind() == TokenKind.PLUS) {
                    expr = OpPlus.create(toPosToken(token), expr, rhExpr);
                }
                else if (token.getKind() == TokenKind.MINUS) {
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
                if (token.getKind() == TokenKind.STAR) {
                    expr = OpMultiply.create(toPosToken(token), expr, rhExpr);
                }
                else if (token.getKind() == TokenKind.DIV) {
                    expr = OpDivide.create(toPosToken(token), expr, rhExpr);
                }
                else {
                    //Assert.isTrue(token.getKind() == TokenKind.MOD);
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

            if (expr != null && peekTokenAny(TokenKind.INC, TokenKind.DEC)) {
                token = nextToken();  //consume INC/DEC
                if (token.getKind() == TokenKind.INC) {
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
                if (token.getKind() == TokenKind.NOT) {
                    return OpNot.create(toPosToken(token), expr);
                }

                if (token.getKind() == TokenKind.PLUS) {
                    return OpPlus.create(toPosToken(token), expr);
                }
                //Assert.isTrue(token.getKind() == TokenKind.MINUS);
                return OpMinus.create(toPosToken(token), expr);

            }
            if (peekTokenAny(TokenKind.INC, TokenKind.DEC)) {
                token = nextToken();
                expr = eatUnaryExpression();
                if (token.getKind() == TokenKind.INC) {
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
            if (nodes.length == 1) {
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

            if (expr == null) {
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
            var nullSafeNavigation = token.getKind() == TokenKind.SAFE_NAVI;
            if (maybeEatMethodOrProperty(nullSafeNavigation) || maybeEatFunctionOrVar()
                || maybeEatProjection(nullSafeNavigation)
                || maybeEatSelection(nullSafeNavigation)) {
                return pop();
            }
            if (peekToken() == null) {
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
            if (args == null) {
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
                if (token == null) {
                    raiseInternalException(pos, 'RUN_OUT_OF_ARGUMENTS');
                }
                if (token.getKind() != TokenKind.RPAREN) {
                    accumulatedArguments.push(eatExpression());
                }
                next = peekToken();
            }
            while (next != null && next.kind == TokenKind.COMMA);

            if (next == null) {
                raiseInternalException(pos, 'RUN_OUT_OF_ARGUMENTS');
            }
        }

        function positionOf(token) {
            if (token == null) {
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
            else if (maybeEatTypeReference() || maybeEatNullReference() || maybeEatConstructorReference() ||
                maybeEatMethodOrProperty(false) || maybeEatFunctionOrVar()) {
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

                var beanReference = new BeanReference(toPosToken(beanNameToken), beanName);
                push(beanReference);
                return true;
            }
            return false;
        }

        function maybeEatTypeReference() {
            if (peekTokenOne(TokenKind.IDENTIFIER)) {
                var typeName = peekToken();
                if (typeName.stringValue() !== "T") {
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
                push(new TypeReference(toPosToken(typeName), node, dims));
                return true;
            }
            return false;
        }

        function maybeEatNullReference() {
            if (peekTokenOne(TokenKind.IDENTIFIER)) {
                var nullToken = peekToken();
                if (nullToken.stringValue().toLowerCase() !== "null") {
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
            if (expr == null) {
                raiseInternalException(toPosToken(token), 'MISSING_SELECTION_EXPRESSION');
            }
            eatToken(TokenKind.RSQUARE);
            if (token.getKind() == TokenKind.SELECT_FIRST) {
                push(Selection.create(nullSafeNavigation, Selection.FIRST, toPosToken(token), expr));
            }
            else if (token.getKind() == TokenKind.SELECT_LAST) {
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
                if (node.kind != TokenKind.DOT) {
                    qualifiedIdPieces.push(new Identifier(node.stringValue(), toPosToken(node)));
                }
                node = peekToken();
            }
            if (!qualifiedIdPieces.length) {
                if (node == null) {
                    raiseInternalException(expressionString.length(), 'OOD');
                }
                raiseInternalException(node.startPos, 'NOT_EXPECTED_TOKEN', "qualified ID", node.getKind().toString().toLowerCase());
            }
            var pos = toPosBounds(qualifiedIdPieces[0].getStartPosition(), qualifiedIdPieces[qualifiedIdPieces.length - 1].getEndPosition());
            return new QualifiedIdentifier(pos, qualifiedIdPieces);
        }

        function isValidQualifiedId(node) {
            if (node == null || node.kind == TokenKind.LITERAL_STRING) {
                return false;
            }
            if (node.kind == TokenKind.DOT || node.kind == TokenKind.IDENTIFIER) {
                return true;
            }
            var value = node.stringValue();
            return (value.length && VALID_QUALIFIED_ID_PATTERN.test(value));
        }

        // This is complicated due to the support for dollars in identifiers.  Dollars are normally separate tokens but
        // there we want to combine a series of identifiers and dollars into a single identifier
        function maybeEatMethodOrProperty(nullSafeNavigation) {
            if (peekTokenOne(TokenKind.IDENTIFIER)) {
                var methodOrPropertyName = nextToken();
                var args = maybeEatMethodArgs();
                if (args == null) {
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
            if (peekIdentifierToken("new")) {
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
                    push(new ConstructorReference(toPosToken(newToken), dimensions, nodes));
                }
                else {
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
            if (token == null) {
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
            else if (peekIdentifierToken("true")) {
                push(BooleanLiteral.create(true, toPosToken(token)));
            }
            else if (peekIdentifierToken("false")) {
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
            if (token == null) {
                return null;
            }
            if (token.isNumericRelationalOperator()) {
                return token;
            }
            if (token.isIdentifier()) {
                var idString = token.stringValue();
                if (idString.toLowerCase() === "instanceof") {
                    return token.asInstanceOfToken();
                }
                if (idString.toLowerCase() === "matches") {
                    return token.asMatchesToken();
                }
                if (idString.toLowerCase() === "between") {
                    return token.asBetweenToken();
                }
            }
            return null;
        }

        function eatToken(expectedKind) {
            var token = nextToken();
            if (token == null) {
                raiseInternalException(expressionString.length, 'OOD');
            }
            if (token.getKind() != expectedKind) {
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
            if (token.getKind() == desiredTokenKind) {
                if (consumeIfMatched) {
                    tokenStreamPointer++;
                }
                return true;
            }

            if (desiredTokenKind == TokenKind.IDENTIFIER) {
                // might be one of the textual forms of the operators (e.g. NE for != ) - in which case we can treat it as an identifier
                // The list is represented here: Tokenizer.alternativeOperatorNames and those ones are in order in the TokenKind enum
                if (token.getKind().ordinal() >= TokenKind.DIV.ordinal() && token.getKind().ordinal() <= TokenKind.NOT.ordinal() && token.data != null) {
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
            return token.getKind() === TokenKind.SELECT || token.getKind() === TokenKind.SELECT_FIRST
                || token.getKind() === TokenKind.SELECT_LAST;
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
            if (operandExpression == null) {
                raiseInternalException(token.startPos, 'LEFT_OPERAND_PROBLEM');
            }
        }

        function checkRightOperand(token, operandExpression) {
            if (operandExpression == null) {
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
        }
    };

    exports.SpelExpressionParser = SpelExpressionParser;

}(window || exports));

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

(function (exports) {
    'use strict';

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

        context.hasPermission = function (/*variable arguments*/) {
            var args = Array.prototype.slice.call(arguments);

            if (args.length === 1) {
                return context.hasRole(args[0]);
            }
        };

        return context;
    }

    exports.StandardContext = {
        create: create
    };

}(window || exports));
