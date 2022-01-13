import {SpelExpressionEvaluator as evaluator} from '../../src/SpelExpressionEvaluator.js';
import {StandardContext} from '../../src/StandardContext'

describe('spel expression evaluator', ()=>{

    beforeEach(()=>{
        // add spies
    });

    describe('compile', ()=>{

        it('should compile an expression an return an evaluator', ()=>{
            //when
            let compiledExpression = evaluator.compile('1234');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

        it('should compile expression with constructor', ()=>{
            //when
            let compiledExpression = evaluator.compile('new java.text.SimpleDateFormat("yyyy-MM-dd").parse("2022-01-01")');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

        it('should compile expression with array constructor without dimensions', ()=>{
            //when
            let compiledExpression = evaluator.compile('new int[]{1,2,3}');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

        it('should compile expression with array constructor with dimensions', ()=>{
            //when
            let compiledExpression = evaluator.compile('new int[3]{1,2,3}');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

        it('should compile expression with type reference', ()=>{
            //when
            let compiledExpression = evaluator.compile('T(java.time.LocalTime).parse("11:22")');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

    });


    describe('parse', ()=>{

        describe('primitives', ()=>{

            it('should evaluate a number', ()=>{
                //when
                let numberInt = evaluator.eval('123');
                let numberFloat = evaluator.eval('123.4');
                let negativeNumberInt = evaluator.eval('-123');
                let negativeNumberFloat = evaluator.eval('-123.4');

                //then
                expect(numberInt).toBe(123);
                expect(numberFloat).toBe(123.4);
                expect(negativeNumberInt).toBe(-123);
                expect(negativeNumberFloat).toBe(-123.4);
            });

            it('should evaluate a string', ()=>{
                //when
                let stringSingle = evaluator.eval('\'hello world!\'');
                let stringDouble = evaluator.eval('"hello world!"');

                //then
                expect(stringSingle).toBe('hello world!');
                expect(stringDouble).toBe('hello world!');
            });

            it('should evaluate a string with embedded escaped single quotes', ()=>{
                //when
                let stringSingle = evaluator.eval('\'hello \'\'world\'\'!\'');
                let stringDouble = evaluator.eval('"hello \'\'world\'\'!"');

                //then
                expect(stringSingle).toBe('hello \'world\'!');
                expect(stringDouble).toBe('hello \'world\'!');
            });

            it('should evaluate a string with embedded escaped double quotes', ()=>{
                //when
                let stringSingle = evaluator.eval('\'hello ""world""!\'');
                let stringDouble = evaluator.eval('"hello ""world""!"');

                //then
                expect(stringSingle).toBe('hello "world"!');
                expect(stringDouble).toBe('hello "world"!');
            });

            it('should evaluate a boolean', ()=>{
                //when
                let boolTrue = evaluator.eval('true');
                let boolFalse = evaluator.eval('false');

                //then
                expect(boolTrue).toBe(true);
                expect(boolFalse).toBe(false);
            });

        });

        describe('lookups', ()=>{

            let context;

            beforeEach(()=>{
                context = {
                    iAmANumber: 1,
                    iAmANestedPropertyName: 'propLookup',
                    nested: {
                        iAmAString: 'hi',
                        reallyNested: {
                            iAmTrue: true,
                            hi: 'bye'
                        },
                        propLookup: 'Found!'
                    }
                };
            });

            it('should look up a primitive in the context', ()=>{
                //when
                let number = evaluator.eval('iAmANumber', context);

                //then
                expect(number).toBe(1);
            });

            it('should look up a nested primitive in the context using dot notation', ()=>{
                //when
                let string = evaluator.eval('nested.iAmAString', context);

                //then
                expect(string).toBe('hi');
            });

            it('should look up a doubly nested primitive in the context using dot notation', ()=>{
                //when
                let bool = evaluator.eval('nested.reallyNested.iAmTrue', context);

                //then
                expect(bool).toBe(true);
            });

            it('should look up a nested primitive in the context using bracket notation literal', ()=>{
                //when
                let string = evaluator.eval('nested["iAmAString"]', context);

                //then
                expect(string).toBe('hi');
            });

            it('should look up a nested primitive in the context using bracket notation', ()=>{
                //when
                let string = evaluator.eval('nested[iAmANestedPropertyName]', context);

                //then
                expect(string).toBe('Found!');
            });

            it('should look up a really nested primitive in the context using bracket notation', ()=>{
                //when
                let string = evaluator.eval('nested.reallyNested[nested.iAmAString]', context);

                //then
                expect(string).toBe('bye');
            });

            it('should return null instead of throw error when using safe navigation', ()=>{
                //when
                let willThrow = ()=>{evaluator.eval('nested.doesNotExist');};
                let willBeNull = evaluator.eval('nested?.doesNotExist', context);
                let willAlsoBeNull = evaluator.eval('nested?.doesNotExist?.definitelyDoesNotExist', context);

                //then
                expect(willThrow).toThrow();
                expect(willBeNull).toBe(null);
            });
        });


        describe('comparisons', ()=>{

            it('should evaluate an equality', ()=>{
                //when
                let comp1 = evaluator.eval('1 == 1');
                let comp2 = evaluator.eval('1 == 2');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an equality with lookups', ()=>{
                //given
                let context = {
                    left: 1,
                    right: 1
                };

                //when
                let comp = evaluator.eval('left == right', context);

                //then
                expect(comp).toBe(true);
            });

            it('should evaluate an inequality (not equal)', ()=>{
                //when
                let comp1 = evaluator.eval('1 != 2');
                let comp2 = evaluator.eval('1 != 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (greater than)', ()=>{
                //when
                let comp1 = evaluator.eval('2 > 1');
                let comp2 = evaluator.eval('1 > 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (greater than or equal to)', ()=>{
                //when
                let comp1 = evaluator.eval('1 >= 1');
                let comp2 = evaluator.eval('2 >= 1');
                let comp3 = evaluator.eval('1 >= 2');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(true);
                expect(comp3).toBe(false);
            });

            it('should evaluate an inequality (less than)', ()=>{
                //when
                let comp1 = evaluator.eval('1 < 2');
                let comp2 = evaluator.eval('1 < 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (less than or equal to)', ()=>{
                //when
                let comp1 = evaluator.eval('1 <= 2');
                let comp2 = evaluator.eval('1 <= 2');
                let comp3 = evaluator.eval('2 <= 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(true);
                expect(comp3).toBe(false);
            });

            it('should evaluate a complex inequality', ()=>{
                //when
                let comp = evaluator.eval('"abc".length <= "abcde".length');

                //then
                expect(comp).toBe(true);
            });
        });


        describe('method invocation', ()=>{

            let context = {
                funky: ()=>{
                    return 'fresh';
                },
                argumentative: (arg)=>{
                    return arg;
                },
                name: 'ben'
            };

            it('should look up and invoke a function', ()=>{
                //when
                let ret = evaluator.eval('funky()', context);

                //then
                expect(ret).toBe('fresh');
            });

            it('should look up and invoke a function with arguments', ()=>{
                //when
                let ret = evaluator.eval('argumentative("i disagree!")', context);

                //then
                expect(ret).toBe('i disagree!');
            });

            it('should use a property if getter not available', ()=>{
                //when
                let ret = evaluator.eval('getName()', context);

                //then
                expect(ret).toBe('ben');
            });

            it('should set a property if setter not available', ()=>{
                //given
                evaluator.eval('setName("steve")', context);

                //when
                let ret = evaluator.eval('getName()', context);

                //then
                expect(ret).toBe('steve');
            });


        });


        describe('locals', ()=>{

            it('should refer to a local variable', ()=>{
                //given
                let context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                let local = evaluator.eval('#myString == "hello world!"', context, locals);

                //then
                expect(local).toBe(true);
            });

            it('should refer to the root context', ()=>{
                //given
                let context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                let root = evaluator.eval('#root', context, locals);

                //then
                expect(root).toBe(context);
            });

            it('should refer the "this" context', ()=>{
                //given
                let context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                let that = evaluator.eval('#this', context, locals);

                //then
                expect(that).toBe(context);
            });

            it('should call a local function', ()=>{
                //given
                let context = {};
                let locals = {
                    foo(echo) {
                        return echo;
                    }
                };

                //when
                const result = evaluator.eval('#foo("123") == "123"', context, locals);

                //then
                expect(result).toEqual(true);
            })

        });


        describe('math', ()=>{

            it('should add 2 numbers', ()=>{
                //when
                let sum = evaluator.eval('1 + 1');

                //then
                expect(sum).toBe(2);
            });


            it('should add 3 numbers', ()=>{
                //when
                let sum = evaluator.eval('1 + 1 + 1');

                //then
                expect(sum).toBe(3);
            });

            it('should subtract 2 numbers', ()=>{
                //when
                let difference = evaluator.eval('1 + 1');

                //then
                expect(difference).toBe(2);
            });

            it('should multiply 2 numbers', ()=>{
                //when
                let product = evaluator.eval('1 + 1');

                //then
                expect(product).toBe(2);
            });

            it('should divide 2 numbers', ()=>{
                //when
                let quotient = evaluator.eval('1 + 1');

                //then
                expect(quotient).toBe(2);
            });

            it('should find the modulus of 2 numbers', ()=>{
                //when
                let mod = evaluator.eval('10 % 8');

                //then
                expect(mod).toBe(2);
            });

            it('should evaluate an exponent', ()=>{
                //when
                let mod = evaluator.eval('10^2');

                //then
                expect(mod).toBe(100);
            });

            it('should honor standard order of operations', ()=>{
                //when
                let math = evaluator.eval('8 + 4 * 6 - 2 * 3 / 2'); //8+(4*6)-(2*3/2) = 29

                //then
                expect(math).toBe(29);
            });

        });

        describe('matches', ()=>{

            it('should return true if the left side matches the regexp string on the right side', ()=>{
                //when
                let matches = evaluator.eval('"the quick brown fox" matches "^the.*fox$"');

                //then
                expect(matches).toBe(true);
            });

            it('should return false if the left side does not match the regexp string on the right side', ()=>{
                //when
                let matches = evaluator.eval('"the quick brown dog" matches "^the.*fox$"');

                //then
                expect(matches).toBe(false);
            });


            it('should throw if the regexp is invalid', ()=>{
                //when
                let willthrow = ()=>evaluator.eval('"foo" matches "["');

                //then
                expect(willthrow).toThrow();
            });


        });


        describe('ternary', ()=>{

            it('should return first argument if true', ()=>{
                //when
                let tern = evaluator.eval('true ? "yes" : "no"');

                //then
                expect(tern).toBe('yes');
            });

            it('should return second argument if false', ()=>{
                //when
                let tern = evaluator.eval('false ? "yes" : "no"');

                //then
                expect(tern).toBe('no');
            });

            it('should return expression if truthy, or ifFalseExpression if null ', ()=>{
                //when
                let elvisTruthy = evaluator.eval('"Thank you." ?: "Thank you very much."');
                let elvisFalsy = evaluator.eval('null ?: "Thank you very much."');

                //then
                expect(elvisTruthy).toBe('Thank you.');
                expect(elvisFalsy).toBe('Thank you very much.');
            });

        });


        describe('assignment', ()=>{

            it('should assign a value to the proper context with the specified property name', ()=>{
                //given
                let context = {
                    name: 'Nikola Tesla',
                    heritage: 'Serbian'
                };
                let locals = {
                    newName: 'Mike Tesla'
                };

                //when
                evaluator.eval('name = #newName', context, locals);

                //then
                expect(context.name).toBe('Mike Tesla');
            });

            it('should assign to a nested context', ()=>{
                //given
                let context = {
                    nested: {
                        name: 'Nikola Tesla'
                    }
                };
                let locals = {
                    newName: 'Mike Tesla'
                };

                //when
                evaluator.eval('nested.name = #newName', context, locals);

                //then
                expect(context.nested.name).toBe('Mike Tesla');
            });

        });


        describe('complex literals', ()=>{

            it('should create an array', ()=>{
                //when
                let arr = evaluator.eval('{1, 2, 3, 4}');

                //then
                expect(arr).toEqual([1, 2, 3, 4]);
            });

            it('should get the size of an array', ()=>{
                //when
                let size = evaluator.eval('{1, 2, 3, 4}.size()');

                //then
                expect(size).toEqual(4);
            });

            it('should check whether an array contains an element', ()=>{
                //given
                let context = {
                    classification: 'PHONE',
                };

                //when
                let shouldBeTrue = evaluator.eval(`{'PHONE','EMPLOYMENT_PHONE','WORK_PHONE'}.contains(classification)`, context);

                //then
                expect(shouldBeTrue).toEqual(true)
            });

            it('should create a map', ()=>{
                //when
                let map = evaluator.eval('{name:"Nikola",dob:"10-July-1856"}');

                //then
                expect(map).toEqual({name: 'Nikola', dob: '10-July-1856'});
            });

        });

        describe('unary', ()=>{

            it('should increment an integer but return original value', ()=>{
                //given
                let parsed = evaluator.compile('123++');

                //when
                let inc1 = parsed.eval();
                let inc2 = parsed.eval();

                //then
                expect(inc1).toBe(123);
                expect(inc2).toBe(124);
            });

            it('should decrement an integer but return original value', ()=>{
                //given
                let parsed = evaluator.compile('123--');

                //when
                let dec1 = parsed.eval();
                let dec2 = parsed.eval();

                //then
                expect(dec1).toBe(123);
                expect(dec2).toBe(122);
            });

            it('should increment an integer and return new value', ()=>{
                //given
                let parsed = evaluator.compile('++123');

                //when
                let inc1 = parsed.eval();
                let inc2 = parsed.eval();

                //then
                expect(inc1).toBe(124);
                expect(inc2).toBe(125);
            });

            it('should decrement an integer and return new value', ()=>{
                //given
                let parsed = evaluator.compile('--123');

                //when
                let dec1 = parsed.eval();
                let dec2 = parsed.eval();

                //then
                expect(dec1).toBe(122);
                expect(dec2).toBe(121);
            });

            it('should increment a property on the context', ()=>{
                //given
                let context = {
                    int: 123
                };

                //when
                evaluator.eval('int++', context);

                //then
                expect(context.int).toBe(124);
            });

            it('should increment a local variable', ()=>{
                //given
                let context = {
                    int: 123
                };
                let locals = {
                    int: 321
                };

                //when
                evaluator.eval('#int++', context, locals);

                //then
                expect(locals.int).toBe(322);
            });

            it('should invert a boolean', ()=>{
                //when
                let bool = evaluator.eval('!true');

                //then
                expect(bool).toBe(false);
            });

        });


        describe('logical operators', ()=>{

            it('should evaluate "and" expressions', ()=>{
                //when
                let and1 = evaluator.eval('true && true');
                let and2 = evaluator.eval('true && false');
                let and3 = evaluator.eval('false && true');
                let and4 = evaluator.eval('false && false');

                //then
                expect(and1).toBe(true);
                expect(and2).toBe(false);
                expect(and3).toBe(false);
                expect(and4).toBe(false);
            });

            it('should evaluate "and" expressions', ()=>{
                //when
                let or1 = evaluator.eval('true || true');
                let or2 = evaluator.eval('true || false');
                let or3 = evaluator.eval('false || true');
                let or4 = evaluator.eval('false || false');

                //then
                expect(or1).toBe(true);
                expect(or2).toBe(true);
                expect(or3).toBe(true);
                expect(or4).toBe(false);
            });

        });


        describe('selection/projection', ()=>{

            it('should return a new list based on selection expression', ()=>{
                //given
                let context = {
                    collection: [1, 2, 3, 4, 5, 6]
                };

                //when
                let newCollection = evaluator.eval('collection.?[#this <= 3]', context);

                //then
                expect(newCollection).toEqual([1, 2, 3]);
            });

            it('should return a new map based on selection expression', ()=>{
                //given
                let context = {
                    collection: {
                        a: 1,
                        b: 2,
                        c: 3,
                        d: 4,
                        e: 5
                    }
                };

                //when
                let newCollection1 = evaluator.eval('collection.?[value <= 3]', context);
                let newCollection2 = evaluator.eval('collection.?[key == "a"]', context);

                //then
                expect(newCollection1).toEqual({a: 1, b: 2, c: 3});
                expect(newCollection2).toEqual({a: 1});
            });

            it('should return the first element of list or map', ()=>{
                //given
                let context = {
                    list: [1, 2, 3, 4, 5, 6],
                    map: {
                        a: 1,
                        b: 2,
                        c: 3,
                        d: 4,
                        e: 5
                    }
                };

                //when
                let listFirst = evaluator.eval('list.^[#this <= 3]', context);
                let mapFirst = evaluator.eval('map.^[value <= 3]', context);

                //then
                expect(listFirst).toEqual(1);
                expect(mapFirst).toEqual({a: 1});
            });

            it('should return the last element of list or map', ()=>{
                //given
                let context = {
                    list: [1, 2, 3, 4, 5, 6],
                    map: {
                        a: 1,
                        b: 2,
                        c: 3,
                        d: 4,
                        e: 5
                    }
                };

                //when
                let listFirst = evaluator.eval('list.$[#this <= 3]', context);
                let mapFirst = evaluator.eval('map.$[value <= 3]', context);

                //then
                expect(listFirst).toEqual(3);
                expect(mapFirst).toEqual({c: 3});
            });

            it('should return a list of projected values from a list of objects', ()=>{
                //given
                let context = {
                    list: [
                        {
                            name: 'Ben'
                        },
                        {
                            name: 'Kris'
                        },
                        {
                            name: 'Ansy'
                        }
                    ]
                };

                //when
                let names = evaluator.eval('list.![name]', context);

                //then
                expect(names).toEqual(['Ben', 'Kris', 'Ansy']);
            });

            it('should return a list of entries from a map (not quite like in Java because key must be a string)', ()=>{
                //given
                let context = {
                    map: {
                        ben: {
                            hometown: 'Newton'
                        },
                        kris: {
                            hometown: 'Peabody'
                        },
                        ansy: {
                            hometown: 'Brockton'
                        }
                    }
                };

                //when
                let hometowns = evaluator.eval('map.![hometown]', context);

                //then
                expect(hometowns).toEqual(['Newton', 'Peabody', 'Brockton']);
            });

        });

        describe('constructor', ()=>{
            it('should create new int array', ()=>{
                //given
                let context = {};

                //when
                let newArray = evaluator.eval('new int[]{1, 2, 3}', context);

                //then
                expect(newArray).toEqual([1, 2, 3]);
            });

            it('should create new int array with dimension', ()=>{
                //given
                let context = {};

                //when
                let newArray = evaluator.eval('new int[3]{1, 2, 3}', context);

                //then
                expect(newArray).toEqual([1, 2, 3]);
            });

            it('should create new empty array', ()=>{
                //given
                let context = {};

                //when
                let newArray = evaluator.eval('new int[]', context);

                //then
                expect(newArray).toEqual([]);
            });

            it('should create new empty array with dimension', ()=>{
                //given
                let context = {};

                //when
                let newArray = evaluator.eval('new int[3]', context);

                //then
                expect(newArray.length).toEqual(3);
            });
        });

    });

});
