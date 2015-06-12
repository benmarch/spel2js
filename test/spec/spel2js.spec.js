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
describe('spel2js.js', function () {
  beforeEach(function () {
    // add spies
  });

  it('should have a working test harness', function () {
    // arrange
    // act
    // assert
    expect(true).not.toBe(false);
  });

  it('should exist', function () {
    // arrange
    // act
    // assert
    expect(typeof spel2js).toBe('function');
  });

  it('should return nothing', function () {
    // arrange
    // act
    var result = spel2js();
    // assert
    expect(result).toBeUndefined();
  });

});