const puzzles = require('../controllers/puzzle-strings.js');
const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
var solver = new Solver();
var puzzle_obj = solver.validate(puzzles[0][0]);
var solved = solver.solve(puzzle_obj);

suite('UnitTests', () => {
  // Logic handles a valid puzzle string of 81 characters
  test('valid puzzle', () => {
    assert.isObject(puzzle_obj, 'response is type object');
    assert.property(puzzle_obj, 'A1', 'response object has coordinates for keys');
    assert.notProperty(puzzle_obj, 'error', 'response has no property named error')
  });
  // Logic handles a puzzle string with invalid characters (not 1-9 or .)
  test('invalid characters', () => {
    let invalid_str = "R" + puzzles[1][0].substring(1);
    let validated = solver.validate(invalid_str);
    assert.isObject(validated, 'response is type object');
    assert.property(validated, 'error', 'response obj contains error property');
    assert.propertyVal(validated, 'error', 'Invalid characters in puzzle'); 
    assert.ownInclude(validated, {error: 'Invalid characters in puzzle'}, 'object includes err msg')
  });
  // Logic handles a puzzle string that is not 81 characters in length
  test('invalid stringed input length', () => {
    let invalid_len_str = puzzles[1][0].substring(1);
    let validated = solver.validate(invalid_len_str);
    assert.isObject(validated, 'response is type object');
    assert.property(validated, 'error', 'response obj contains error property');
    assert.propertyVal(validated, 'error', 'Expected puzzle to be 81 characters long');
    assert.ownInclude(validated, {error: 'Expected puzzle to be 81 characters long'}, 'obj w/ err msg');
  });
  // Logic handles a valid row placement
  test('valid row placement', () => {
    let placed_value = "3";
    let coordinate = "A2";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', true);
  });
  // Logic handles an invalid row placement
  test('invalid row placement', () => {
    let placed_value = "4";
    let coordinate = "A2";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', false);
    assert.property(placement_response, 'conflict', 'response obj contains conflict property');
    assert.include(placement_response.conflict, "row", 'value for conflict is an arr containing row');
  });
  // Logic handles a valid column placement
  test('valid column placement', () => {
    let placed_value = "3";
    let coordinate = "A2";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', true);
  });
  // Logic handles an invalid column placement
  test('invalid column placement', () => {
    let placed_value = "9";
    let coordinate = "A2";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', false);
    assert.property(placement_response, 'conflict', 'response obj contains conflict property');
    assert.include(placement_response.conflict, "column", 'value for conflict is an arr containing column');
  });
  // Logic handles a valid region (3x3 grid) placement
  test('valid region placement', () => {
    let placed_value = "3";
    let coordinate = "A2";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', true);
  });
  // Logic handles an invalid region (3x3 grid) placement
  test('invalid column placement', () => {
    let placed_value = "6";
    let coordinate = "B1";
    let placement_response = solver.checkPlacement(puzzle_obj, coordinate, placed_value);
    assert.isObject(placement_response, 'response is type object');
    assert.propertyVal(placement_response, 'valid', false);
    assert.property(placement_response, 'conflict', 'response obj contains conflict property');
    assert.include(placement_response.conflict, "region", 'value for conflict is an arr containing region');
  });
  // Valid puzzle strings pass the solver
  test('valid puzzle', () => {
    assert.property(solved, 'solution', 'response obj has solution property');
    assert.notProperty(solved, 'error', 'response object does NOT have error property')
  });
  // Invalid puzzle strings fail the solver
  test('invalid puzzle', () => {
    let invalid_str = "R" + puzzles[1][0].substring(1);
    let validated = solver.validate(invalid_str);
    let solved = solver.solve(validated);
    assert.property(solved, 'error', 'response obj has error property');
    assert.notProperty(solved, 'solution', 'response object does NOT have solution property')
  });
  // Solver returns the expected solution for an incomplete puzzle
  test('valid solution', () => {
    assert.propertyVal(solved, 'solution', puzzles[0][1], 'value for solution coincides with verified solution');
  });
});
