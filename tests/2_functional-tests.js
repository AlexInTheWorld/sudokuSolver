const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const puzzles = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  
  suite('POST request to /api/solve', () => {
    
    test('puzzle with valid puzzle string', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: puzzles[0][0] })
        .end((err, res) => {
          assert.strictEqual(res.body.solution, puzzles[0][1]);
          done();
        });
    });
  
    test('puzzle with missing puzzle string', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: "" })
        .end((err, res) => {
          assert.property(res.body, 'error', 'response object contains error property');
          assert.propertyVal(res.body, 'error', 'Required field missing');
          done();
      });
    });

    test('puzzle with invalid characters', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: "R" + puzzles[0][0].substring(1) })
        .end((err, res) => {
          assert.property(res.body, 'error', 'response object contains error property');
          assert.propertyVal(res.body, 'error', 'Invalid characters in puzzle');
          done();
      });
    });

    test('puzzle with incorrect length', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: puzzles[0][0].substring(1) })
        .end((err, res) => {
          assert.property(res.body, 'error', 'response object contains error property');
          assert.propertyVal(res.body, 'error', 'Expected puzzle to be 81 characters long');
          done();
      });
    });

    test('puzzle that cannot be solved', (done) => {
      chai.request(server)
        .post('/api/solve')
        .send({ puzzle: "5" + puzzles[0][0].substring(1) })
        .end((err, res) => {
          assert.property(res.body, 'error', 'response object contains error property');
          assert.propertyVal(res.body, 'error', 'Puzzle cannot be solved');
          done();
      });
    });

  });
  
  suite('POST request to /api/check', () => {
    
    test('Check a puzzle placement with all fields', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: puzzles[0][0],
          coordinate: "A2",
          value: "3"
        })
        .end((err, res) => {
          assert.property(res.body, 'valid');
          assert.propertyVal(res.body, 'valid', true, 'prop named valid is assigned a truthy value: true');
          done();
      });
    });
    
    test('Check a puzzle placement with single placement conflict', (done) => {
      chai.request(server)
        .post('/api/check')
        .send({
          puzzle: puzzles[0][0],
          coordinate: "B1",
          value: "8"
        })
        .end((err, res) => {
          assert.propertyVal(res.body, 'valid', false, 'valid property of response obj has value false')
          assert.property(res.body, 'conflict', 'response obj has property named conflict');
          assert.lengthOf(res.body.conflict, 1, 'conflict key stores arr of length == 1');
          assert.include(res.body.conflict, 'column', 'array includes the value == column');
          done();
      });
    });
  
    test('Check a puzzle placement with multiple placement conflicts', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0],
            coordinate: "B1",
            value: "6"
          })
          .end((err, res) => {
            assert.propertyVal(res.body, 'valid', false, 'valid property of response obj has value false')
            assert.property(res.body, 'conflict', 'response obj has property named conflict');
            assert.lengthOf(res.body.conflict, 2, 'conflict key stores arr of length == 2');
            assert.include(res.body.conflict, 'row', 'array includes the value == row');
            assert.include(res.body.conflict, 'region', 'array includes the value == region');
            done();
        });
    });
    
    
    test('Check a puzzle placement with all placement conflicts', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0],
            coordinate: "B1",
            value: "1"
          })
          .end((err, res) => {
            assert.propertyVal(res.body, 'valid', false, 'valid property of response obj has value false')
            assert.property(res.body, 'conflict', 'response obj has property named conflict');
            assert.lengthOf(res.body.conflict, 3, 'conflict key stores arr of length == 3');
            assert.strictEqual(res.body.conflict.join("/"), 'row/column/region', 'arr has row, column and region as values');
            done();
        });
    });
    
    test('Check a puzzle placement with missing required fields', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0],
            coordinate: "B1",
            value: ""
          })
          .end((err, res) => {
            assert.property(res.body, 'error', 'response obj has property named error');
            assert.propertyVal(res.body, 'error', 'Required field(s) missing');
            done();
        });
    });
    
    test('Check a puzzle placement with invalid characters', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: "R" + puzzles[0][0].substring(1),
            coordinate: "B1",
            value: "9"
          })
          .end((err, res) => {
            assert.property(res.body, 'error', 'response obj has property named error');
            assert.propertyVal(res.body, 'error', 'Invalid characters in puzzle');
            done();
        });
    });
    
    test('Check a puzzle placement with incorrect length', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0].substring(1),
            coordinate: "B1",
            value: "9"
          })
          .end((err, res) => {
            assert.property(res.body, 'error', 'response obj has property named error');
            assert.propertyVal(res.body, 'error', 'Expected puzzle to be 81 characters long');
            done();
        });
    });
    
    test('Check a puzzle placement with invalid placement coordinate', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0],
            coordinate: "B0",
            value: "9"
          })
          .end((err, res) => {
            assert.property(res.body, 'error', 'response obj has property named error');
            assert.propertyVal(res.body, 'error', 'Invalid coordinate');
            done();
        });
    });
    
    test('Check a puzzle placement with invalid placement value', (done) => {
        chai.request(server)
          .post('/api/check')
          .send({
            puzzle: puzzles[0][0],
            coordinate: 'B1',
            value: '0'
          })
          .end((err, res) => {
            assert.property(res.body, 'error', 'response obj has property named error');
            assert.propertyVal(res.body, 'error', 'Invalid value');
            done();
        });
    });
    
  });
});

