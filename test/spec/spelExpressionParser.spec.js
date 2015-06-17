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
describe('spel expression parser', function () {
    var parser = window.spelExpressionParser;

    beforeEach(function () {
        // add spies
    });

    describe('compile', function () {

        it('should compile an expression an return an evaluator', function () {
            //when
            var evaluator = parser.compile('1234');

            //then
            expect(evaluator.eval).toBeDefined();
        });

    });


    describe('parse', function () {

        describe('primitives', function () {

            it('should evaluate a number', function () {
                //when
                var numberInt = parser.parse('123');
                var numberFloat = parser.parse('123.4');

                //then
                expect(numberInt).toBe(123);
                expect(numberFloat).toBe(123.4);
            });

            it('should evaluate a string', function () {
                //when
                var stringSingle = parser.parse('\'hello world!\'');
                var stringDouble = parser.parse('"hello world!"');

                //then
                expect(stringSingle).toBe('hello world!');
                expect(stringDouble).toBe('hello world!');
            });

            it('should evaluate a boolean', function () {
                //when
                var boolTrue = parser.parse('true');
                var boolFalse = parser.parse('false');

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
                    nested: {
                        iAmAString: 'hi',
                        reallyNested: {
                            iAmTrue: true
                        }
                    }
                };
            });

            it('should look up a primitive in the context', function () {
                //when
                var number = parser.parse('iAmANumber', context);

                //then
                expect(number).toBe(1);
            });

            it('should look up a nested primitive in the context using dot notation', function () {
                //when
                var string = parser.parse('nested.iAmAString', context);

                //then
                expect(string).toBe('hi');
            });

            it('should look up a doubly nested primitive in the context using dot notation', function () {
                //when
                var bool = parser.parse('nested.reallyNested.iAmTrue', context);

                //then
                expect(bool).toBe(true);
            });

            it('should look up a nested primitive in the context using bracket notation', function () {
                //when
                var string = parser.parse('nested["iAmAString"]', context);

                //then
                expect(string).toBe('hi');
            });

        });

    });

});
