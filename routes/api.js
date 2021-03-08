'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');


module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
        if (!req.body.puzzle || !req.body.value || !req.body.coordinate) { return res.json({error: 'Required field(s) missing'})}
        var validated = solver.validate(req.body.puzzle);
        if (validated.error) {
          res.json(validated);
        } else {
          res.json(solver.checkPlacement(validated, req.body.coordinate.toUpperCase().trim(), req.body.value.trim()));
        }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      if (!req.body.puzzle) {return res.json({ "error": 'Required field missing' })}
      var validated = solver.validate(req.body.puzzle);
      var solution = solver.solve(validated);
      res.json(solution);
    });
};
