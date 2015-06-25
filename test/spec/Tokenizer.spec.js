import {Tokenizer} from '../../src/Tokenizer';
import {TokenKind} from '../../src/TokenKind';

describe('tokenizer', ()=>{
    let tokenize = Tokenizer.tokenize;

    beforeEach(()=>{
        // add spies
    });

    it('should return an array of one Int token', ()=>{
        //when
        let tokens = tokenize('123');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_INT);
        expect(tokens[0].stringValue()).toBe('123');
    });

    it('should return an array of one long token', ()=>{
        //when
        let tokens = tokenize('123l');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_LONG);
        expect(tokens[0].stringValue()).toBe('123');
    });

    it('should return an array of one hex int token', ()=>{
        //when
        let tokens = tokenize('0xFF');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_HEXINT);
        expect(tokens[0].stringValue()).toBe('FF');
    });

    it('should return an array of one hex long token', ()=>{
        //when
        let tokens = tokenize('0xFFl');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_HEXLONG);
        expect(tokens[0].stringValue()).toBe('FF');
    });

    it('should return an array of one string token', ()=>{
        //when
        let tokens = tokenize('\'hello world!\'');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_STRING);
        expect(tokens[0].stringValue()).toBe('\'hello world!\'');
    });

    it('should return an array of one real token', ()=>{
        //when
        let tokens = tokenize('123.4');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_REAL);
        expect(tokens[0].stringValue()).toBe('123.4');
    });

    it('should return an array of one real float token', ()=>{
        //when
        let tokens = tokenize('123.4f');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(1);
        expect(tokens[0].getKind()).toBe(TokenKind.LITERAL_REAL_FLOAT);
        expect(tokens[0].stringValue()).toBe('123.4f');
    });


    //more complex expressions
    it('should return an array of 4 tokens when given a function with 1 arg', ()=>{
        //when
        let tokens = tokenize('hasPermission(\'DISCUSSION_POST\')');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(4);
        expect(tokens[0].getKind()).toBe(TokenKind.IDENTIFIER);
        expect(tokens[1].getKind()).toBe(TokenKind.LPAREN);
        expect(tokens[2].getKind()).toBe(TokenKind.LITERAL_STRING);
        expect(tokens[3].getKind()).toBe(TokenKind.RPAREN);
    });

    it('should return an array of 11 tokens when given comparison of principal to arg property', ()=>{
        //when
        let tokens = tokenize('principal.email == #comment.user[\'email\']');

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

    it('should tokenize unary operators', ()=>{
        //when
        let tokens = tokenize('+ - * / ^ % ++ -- ! =');

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

    it('should tokenize comparison operators', ()=>{
        //when
        let tokens = tokenize('>= > <= < == != && ||');

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
    /*it('should tokenize keywords', ()=>{
        //when
        let tokens = tokenize('instanceOf matches between');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(3);
        expect(tokens[0].getKind()).toBe(TokenKind.INSTANCEOF);
        expect(tokens[1].getKind()).toBe(TokenKind.MATCHES);
        expect(tokens[2].getKind()).toBe(TokenKind.BETWEEN);
    });*/

    it('should tokenize regex tokens', ()=>{
        //when
        let tokens = tokenize('^[ $[ ? ![ ?[');

        //then
        expect(tokens).toBeDefined();
        expect(tokens.length).toBe(5);
        expect(tokens[0].getKind()).toBe(TokenKind.SELECT_FIRST);
        expect(tokens[1].getKind()).toBe(TokenKind.SELECT_LAST);
        expect(tokens[2].getKind()).toBe(TokenKind.QMARK);
        expect(tokens[3].getKind()).toBe(TokenKind.PROJECT);
        expect(tokens[4].getKind()).toBe(TokenKind.SELECT);
    });

    it('should tokenize miscellaneous tokens', ()=>{
        //when
        let tokens = tokenize(', : { } ?: ?. @');

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

    it('should throw exception if using bitwise operators', ()=>{
        //given
        let shouldThrow1 = ()=>{
            tokenize('|');
        };
        let shouldThrow2 = ()=>{
            tokenize('&');
        };

        //then
        expect(shouldThrow1).toThrow();
        expect(shouldThrow2).toThrow();
    });

    it('should throw exception if escape character is used', ()=>{
        //given
        let shouldThrow = ()=>{
            tokenize('\\hello');
        };

        //then
        expect(shouldThrow).toThrow();
    });

    it('should throw exception if unsupported character is used', ()=>{
        //given
        let shouldThrow = ()=>{
            tokenize('¶');
        };

        //then
        expect(shouldThrow).toThrow();
    });

    it('should throw exception if string literal is unterminated', ()=>{
        //given
        let shouldThrowSingleQuote = ()=>{
            tokenize('\'this is an unterminated stateme');
        };
        let shouldThrowDoubleQuote = ()=>{
            tokenize('"this is an unterminated stateme');
        };

        //then
        expect(shouldThrowSingleQuote).toThrow();
        expect(shouldThrowDoubleQuote).toThrow();
    });

    it('should throw exception if long identifier used on real', ()=>{
        //given
        let shouldThrow = ()=>{
            tokenize('3.4L');
        };

        //then
        expect(shouldThrow).toThrow();
    });
});
