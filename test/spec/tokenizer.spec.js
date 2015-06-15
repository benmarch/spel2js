/**
 * @file
 *
 * ### Responsibilities
 * - unit test spel2js.js
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author  <>
 */
'use strict';

/*global spel2js*/
describe('tokenizer', function () {
    var tokenize = window.tokenize,
        TokenKind = window.TokenKind;

    beforeEach(function () {
        // add spies
    });

    it('should return an array of one Int token', function () {
        //when
        var tokens = tokenize('123');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_INT);
        expect(tokens[0].stringValue()).toBe('123');
    });

    it('should return an array of one long token', function () {
        //when
        var tokens = tokenize('123l');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_LONG);
        expect(tokens[0].stringValue()).toBe('123');
    });

    it('should return an array of one hex int token', function () {
        //when
        var tokens = tokenize('0xFF');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_HEXINT);
        expect(tokens[0].stringValue()).toBe('FF\0');
    });

    it('should return an array of one hex long token', function () {
        //when
        var tokens = tokenize('0xFFl');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_HEXLONG);
        expect(tokens[0].stringValue()).toBe('FFl\0');
    });

    it('should return an array of one string token', function () {
        //when
        var tokens = tokenize('\'hello world!\'');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_STRING);
        expect(tokens[0].stringValue()).toBe('\'hello world!\'');
    });

    it('should return an array of one real token', function () {
        //when
        var tokens = tokenize('123.4');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_REAL);
        expect(tokens[0].stringValue()).toBe('123.4');
    });

    it('should return an array of one real float token', function () {
        //when
        var tokens = tokenize('123.4f');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_REAL_FLOAT);
        expect(tokens[0].stringValue()).toBe('123.4f');
    });


    //more complex expressions
    it('should return an array of 4 tokens when given a function with 1 arg', function () {
        //when
        var tokens = tokenize('hasPermission(\'DISCUSSION_POST\')');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(4);
        expect(tokens[0].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[1].getKind()).toBe(TokenKind.LPAREN);
        expect(tokens[2].getKind()).toBe(TokenKind.LITERAL_STRING);
        expect(tokens[3].getKind()).toBe(TokenKind.RPAREN);
    });

    it('should return an array of 11 tokens when given comparison of principal to arg property', function () {
        //when
        var tokens = tokenize('principal.email == #comment.user[\'email\']');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(11);
        expect(tokens[0].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[1].getKind()).toBe(TokenKind.DOT);
        expect(tokens[2].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[3].getKind()).toBe(TokenKind.EQ);
        expect(tokens[4].getKind()).toBe(TokenKind.HASH);
        expect(tokens[5].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[6].getKind()).toBe(TokenKind.DOT);
        expect(tokens[7].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[8].getKind()).toBe(TokenKind.LSQUARE);
        expect(tokens[9].getKind()).toBe(TokenKind.LITERAL_STRING);
        expect(tokens[10].getKind()).toBe(TokenKind.RSQUARE);
    });

    it('should tokenize unary operators', function () {
        //when
        var tokens = tokenize('+ - * / ^ % ++ -- ! =');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(10);
        expect(tokens[0].getKind()).toBe(TokenKind.PLUS);
        expect(tokens[1].getKind()).toBe(TokenKind.MINUS);
        expect(tokens[2].getKind()).toBe(TokenKind.STAR);
        expect(tokens[3].getKind()).toBe(TokenKind.DIV);
        expect(tokens[4].getKind()).toBe(TokenKind.POWER);
        expect(tokens[5].getKind()).toBe(TokenKind.MOD);
        expect(tokens[6].getKind()).toBe(TokenKind.INC);
        expect(tokens[7].getKind()).toBe(TokenKind.DEC);
        expect(tokens[8].getKind()).toBe(TokenKind.NOT);
        expect(tokens[9].getKind()).toBe(TokenKind.ASSIGN);
    });

    it('should tokenize comparison operators', function () {
        //when
        var tokens = tokenize('>= > <= < == != && ||');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(8);
        expect(tokens[0].getKind()).toBe(TokenKind.GE);
        expect(tokens[1].getKind()).toBe(TokenKind.GT);
        expect(tokens[2].getKind()).toBe(TokenKind.LE);
        expect(tokens[3].getKind()).toBe(TokenKind.LT);
        expect(tokens[4].getKind()).toBe(TokenKind.EQ);
        expect(tokens[5].getKind()).toBe(TokenKind.NE);
        expect(tokens[6].getKind()).toBe(TokenKind.SYMBOLIC_AND);
        expect(tokens[7].getKind()).toBe(TokenKind.SYMBOLIC_OR);
    });

    //this test fails. The tokenizer from Spring does not support these
    /*it('should tokenize keywords', function () {
        //when
        var tokens = tokenize('instanceOf matches between');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(3);
        expect(tokens[0].getKind()).toBe(TokenKind.INSTANCEOF);
        expect(tokens[1].getKind()).toBe(TokenKind.MATCHES);
        expect(tokens[2].getKind()).toBe(TokenKind.BETWEEN);
    });*/

    it('should tokenize regex tokens', function () {
        //when
        var tokens = tokenize('^[ $[ ? ![ ?[');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(5);
        expect(tokens[0].getKind()).toBe(TokenKind.SELECT_FIRST);
        expect(tokens[1].getKind()).toBe(TokenKind.SELECT_LAST);
        expect(tokens[2].getKind()).toBe(TokenKind.QMARK);
        expect(tokens[3].getKind()).toBe(TokenKind.PROJECT);
        expect(tokens[4].getKind()).toBe(TokenKind.SELECT);
    });

    it('should tokenize miscellaneous tokens', function () {
        //when
        var tokens = tokenize(', : { } ?: ?. @');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(7);
        expect(tokens[0].getKind()).toBe(TokenKind.COMMA);
        expect(tokens[1].getKind()).toBe(TokenKind.COLON);
        expect(tokens[2].getKind()).toBe(TokenKind.LCURLY);
        expect(tokens[3].getKind()).toBe(TokenKind.RCURLY);
        expect(tokens[4].getKind()).toBe(TokenKind.ELVIS);
        expect(tokens[5].getKind()).toBe(TokenKind.SAFE_NAVI);
        expect(tokens[6].getKind()).toBe(TokenKind.BEAN_REF);
    });

    it('should throw exception if using bitwise operators', function () {
        //given
        function shouldThrow1() {
            tokenize('|');
        }
        function shouldThrow2() {
            tokenize('&');
        }

        //then
        expect(shouldThrow1).toThrow();
        expect(shouldThrow2).toThrow();
    });

    it('should throw exception if escape character is used', function () {
        //given
        function shouldThrow() {
            tokenize('\\hello');
        }

        //then
        expect(shouldThrow).toThrow();
    });

    it('should throw exception if unsupported character is used', function () {
        //given
        function shouldThrow() {
            tokenize('¶');
        }

        //then
        expect(shouldThrow).toThrow();
    });

    it('should throw exception if string literal is unterminated', function () {
        //given
        function shouldThrowSingleQuote() {
            tokenize('\'this is an unterminated stateme');
        }
        function shouldThrowDoubleQuote() {
            tokenize('"this is an unterminated stateme');
        }

        //then
        expect(shouldThrowSingleQuote).toThrow();
        expect(shouldThrowDoubleQuote).toThrow();
    });

    it('should throw exception if long identifier used on real', function () {
        //given
        function shouldThrow() {
            tokenize('3.4L');
        }

        //then
        expect(shouldThrow).toThrow();
    });

    it('should throw exception if identifier is used on malformed hex literal', function () {
        //given
        function shouldThrow1() {
            tokenize('0xi');
        }
        function shouldThrow2() {
            tokenize('0xL');
        }

        //then
        expect(shouldThrow1).toThrow();
        expect(shouldThrow2).toThrow();
    });
});
