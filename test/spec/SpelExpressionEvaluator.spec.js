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
describe('spel expression evaluator', function () {
    var evaluator = window.SpelExpressionEvaluator;

    beforeEach(function () {
        // add spies
    });

    describe('compile', function () {

        it('should compile an expression an return an evaluator', function () {
            //when
            var compiledExpression = evaluator.compile('1234');

            //then
            expect(compiledExpression.eval).toBeDefined();
        });

    });


    describe('parse', function () {

        describe('primitives', function () {

            it('should evaluate a number', function () {
                //when
                var numberInt = evaluator.eval('123');
                var numberFloat = evaluator.eval('123.4');

                //then
                expect(numberInt).toBe(123);
                expect(numberFloat).toBe(123.4);
            });

            it('should evaluate a string', function () {
                //when
                var stringSingle = evaluator.eval('\'hello world!\'');
                var stringDouble = evaluator.eval('"hello world!"');

                //then
                expect(stringSingle).toBe('hello world!');
                expect(stringDouble).toBe('hello world!');
            });

            it('should evaluate a boolean', function () {
                //when
                var boolTrue = evaluator.eval('true');
                var boolFalse = evaluator.eval('false');

                //then
                expect(boolTrue).toBe(true);
                expect(boolFalse).toBe(false);
            });

        });

        describe('lookups', function () {

            var context;

            beforeEach(function () {
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

            it('should look up a primitive in the context', function () {
                //when
                var number = evaluator.eval('iAmANumber', context);

                //then
                expect(number).toBe(1);
            });

            it('should look up a nested primitive in the context using dot notation', function () {
                //when
                var string = evaluator.eval('nested.iAmAString', context);

                //then
                expect(string).toBe('hi');
            });

            it('should look up a doubly nested primitive in the context using dot notation', function () {
                //when
                var bool = evaluator.eval('nested.reallyNested.iAmTrue', context);

                //then
                expect(bool).toBe(true);
            });

            it('should look up a nested primitive in the context using bracket notation literal', function () {
                //when
                var string = evaluator.eval('nested["iAmAString"]', context);

                //then
                expect(string).toBe('hi');
            });

            it('should look up a nested primitive in the context using bracket notation', function () {
                //when
                var string = evaluator.eval('nested[iAmANestedPropertyName]', context);

                //then
                expect(string).toBe('Found!');
            });

            it('should look up a really nested primitive in the context using bracket notation', function () {
                //when
                var string = evaluator.eval('nested.reallyNested[nested.iAmAString]', context);

                //then
                expect(string).toBe('bye');
            });

            it('should return null instead of throw error when using safe navigation', function () {
                //when
                var willThrow = function () {evaluator.eval('nested.doesNotExist');}
                var willBeNull = evaluator.eval('nested?.doesNotExist', context);

                //then
                expect(willThrow).toThrow();
                expect(willBeNull).toBe(null);
            });
        });


        describe('comparisons', function () {

            it('should evaluate an equality', function () {
                //when
                var comp1 = evaluator.eval('1 == 1');
                var comp2 = evaluator.eval('1 == 2');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an equality with lookups', function () {
                //given
                var context = {
                    left: 1,
                    right: 1
                };

                //when
                var comp = evaluator.eval('left == right', context);

                //then
                expect(comp).toBe(true);
            });

            it('should evaluate an inequality (not equal)', function () {
                //when
                var comp1 = evaluator.eval('1 != 2');
                var comp2 = evaluator.eval('1 != 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (greater than)', function () {
                //when
                var comp1 = evaluator.eval('2 > 1');
                var comp2 = evaluator.eval('1 > 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (greater than or equal to)', function () {
                //when
                var comp1 = evaluator.eval('1 >= 1');
                var comp2 = evaluator.eval('2 >= 1');
                var comp3 = evaluator.eval('1 >= 2');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(true);
                expect(comp3).toBe(false);
            });

            it('should evaluate an inequality (less than)', function () {
                //when
                var comp1 = evaluator.eval('1 < 2');
                var comp2 = evaluator.eval('1 < 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(false);
            });

            it('should evaluate an inequality (less than or equal to)', function () {
                //when
                var comp1 = evaluator.eval('1 <= 2');
                var comp2 = evaluator.eval('1 <= 2');
                var comp3 = evaluator.eval('2 <= 1');

                //then
                expect(comp1).toBe(true);
                expect(comp2).toBe(true);
                expect(comp3).toBe(false);
            });

            it('should evaluate a complex inequality', function () {
                //when
                var comp = evaluator.eval('"abc".length <= "abcde".length');

                //then
                expect(comp).toBe(true);
            });

        });


        describe('method invocation', function () {

            var context = {
                funky: function () {
                    return 'fresh';
                },
                argumentative: function (arg) {
                    return arg;
                },
                name: 'ben'
            };

            it('should look up and invoke a function', function () {
                //when
                var ret = evaluator.eval('funky()', context);

                //then
                expect(ret).toBe('fresh');
            });

            it('should look up and invoke a function with arguments', function () {
                //when
                var ret = evaluator.eval('argumentative("i disagree!")', context);

                //then
                expect(ret).toBe('i disagree!');
            });

            it('should use a property if getter not available', function () {
                //when
                var ret = evaluator.eval('getName()', context);

                //then
                expect(ret).toBe('ben');
            });

            it('should set a property if setter not available', function () {
                //given
                evaluator.eval('setName("steve")', context);

                //when
                var ret = evaluator.eval('getName()', context);

                //then
                expect(ret).toBe('steve');
            });


        });


        describe('locals', function () {

            it('should refer to a local variable', function () {
                //given
                var context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                var local = evaluator.eval('#myString == "hello world!"', context, locals);

                //then
                expect(local).toBe(true);
            });

            it('should refer to the root context', function () {
                //given
                var context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                var root = evaluator.eval('#root', context, locals);

                //then
                expect(root).toBe(context);
            });

            it('should refer the "this" context', function () {
                //given
                var context = {
                        myString: 'global context'
                    },
                    locals = {
                        myString: 'hello world!'
                    };

                //when
                var that = evaluator.eval('#this', context, locals, this);

                //then
                expect(that).toBe(this);
            });

        });


        describe('math', function () {

            it('should add 2 numbers', function () {
                //when
                var sum = evaluator.eval('1 + 1');

                //then
                expect(sum).toBe(2);
            });


            it('should add 3 numbers', function () {
                //when
                var sum = evaluator.eval('1 + 1 + 1');

                //then
                expect(sum).toBe(3);
            });

            it('should subtract 2 numbers', function () {
                //when
                var difference = evaluator.eval('1 + 1');

                //then
                expect(difference).toBe(2);
            });

            it('should multiply 2 numbers', function () {
                //when
                var product = evaluator.eval('1 + 1');

                //then
                expect(product).toBe(2);
            });

            it('should divide 2 numbers', function () {
                //when
                var quotient = evaluator.eval('1 + 1');

                //then
                expect(quotient).toBe(2);
            });

            it('should find the modulus of 2 numbers', function () {
                //when
                var mod = evaluator.eval('10 % 8');

                //then
                expect(mod).toBe(2);
            });

            it('should evaluate an exponent', function () {
                //when
                var mod = evaluator.eval('10^2');

                //then
                expect(mod).toBe(100);
            });

            it('should honor standard order of operations', function () {
                //when
                var math = evaluator.eval('8 + 4 * 6 - 2 * 3 / 2'); //8+(4*6)-(2*3/2) = 29

                //then
                expect(math).toBe(29);
            });

        });


        describe('ternary', function () {

            it('should return first argument if true', function () {
                //when
                var tern = evaluator.eval('true ? "yes" : "no"');

                //then
                expect(tern).toBe('yes');
            });

            it('should return second argument if false', function () {
                //when
                var tern = evaluator.eval('false ? "yes" : "no"');

                //then
                expect(tern).toBe('no');
            });

            it('should return expression if truthy, or ifFalseExpression if null ', function () {
                //when
                var elvisTruthy = evaluator.eval('"Thank you." ?: "Thank you very much."');
                var elvisFalsy = evaluator.eval('null ?: "Thank you very much."');

                //then
                expect(elvisTruthy).toBe('Thank you.');
                expect(elvisFalsy).toBe('Thank you very much.');
            });

        });


        describe('assignment', function () {

            it('should assign a value to the proper context with the specified property name', function () {
                //given
                var context = {
                    name: 'Nikola Tesla',
                    heritage: 'Serbian'
                };
                var locals = {
                    newName: 'Mike Tesla'
                };

                //when
                evaluator.eval('name = #newName', context, locals);

                //then
                expect(context.name).toBe('Mike Tesla');
            });

            it('should assign to a nested context', function () {
                //given
                var context = {
                    nested: {
                        name: 'Nikola Tesla'
                    }
                };
                var locals = {
                    newName: 'Mike Tesla'
                };

                //when
                evaluator.eval('nested.name = #newName', context, locals);

                //then
                expect(context.nested.name).toBe('Mike Tesla');
            });

        });


        describe('complex literals', function () {

            it('should create an array', function () {
                //when
                var arr = evaluator.eval('{1, 2, 3, 4}');

                //then
                expect(arr).toEqual([1, 2, 3, 4]);
            });

            it('should create a map', function () {
                //when
                var map = evaluator.eval("{name:'Nikola',dob:'10-July-1856'}");

                //then
                expect(map).toEqual({name: 'Nikola', dob: '10-July-1856'});
            });

        });

    });

});
