class SudokuSolver {

  constructor() {
    this.rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  }

  get_opts(puzzleObj, coord, value, msg) {
    puzzleObj[coord] = ""; // Exclude the currently pinned position from calculations
    
    // Define start positions for row, column and region used in subsequent numeric calculations
    let col_start = Number(coord[1]);
    let row_start = coord[0];
    let region_start = [3 * Math.floor(this.rows.indexOf(row_start) / 3), 3 * Math.floor((col_start - 1) / 3) + 1];

    let row_nums, col_nums, region_nums, opts, confl_res;
    [row_nums, col_nums, region_nums, opts, confl_res] = ["", "", "", "", []]; //  Opts will contain an array of remaining numeric options for the current position //

    let conflicts = ["row", "column", "region"]; // used for checking placement

    for (let j = 0; j < 9; j++) {

      let row_num = puzzleObj[row_start + (j + 1)];
      let col_num = puzzleObj[this.rows[j] + col_start];
      let region_num = puzzleObj[this.rows[region_start[0] + Math.floor(j / 3)] + ((j % 3) + region_start[1])];

      if (msg == "get nums") {

        if (new RegExp(Number(row_num).toString()).test(row_nums) || new RegExp(Number(col_num).toString()).test(col_nums) || new RegExp(Number(region_num).toString()).test(region_nums)) {
          return {
            error: "Puzzle cannot be solved"
          }
        }
        [row_num, col_num, region_num].forEach(function(item, i) {
          opts += new RegExp(item).test(opts) ? "" : item; // add non-present numbers in opts to opts -- at the end of the string -- 
        })
      } else {
        // If the request is to check for placement validity:
        [row_num, col_num, region_num].forEach(function(item, i) {
          if (value === item && !confl_res[i]) {
            confl_res[i] = conflicts[i];
          }
        })
      }
      row_nums += row_num;
      col_nums += col_num;
      region_nums += region_num;
    }
    return opts || confl_res;
  }

  validate(puzzleString) {

    switch (puzzleString.length) {
      case 81:
        let puzzle_obj = {};
        for (let i = 0; i < 81; i++) {
          if (puzzleString[i] === ".") {
            puzzle_obj[this.rows[Math.floor(i / 9)] + ((i % 9) + 1)] = "";
          } else if(/^[1-9]$/.test(puzzleString[i])) {
            puzzle_obj[this.rows[Math.floor(i / 9)] + ((i % 9) + 1)] = puzzleString[i];
          } else {
            return { error: 'Invalid characters in puzzle'}
          }
        }
        return puzzle_obj;
      default:
        return { error: 'Expected puzzle to be 81 characters long' }
    }
    
  }

  checkPlacement(puzzleObj, coordinate, value) {
    if (puzzleObj.error) { return puzzleObj }
    
    if (!(/^[A-I][1-9]$/.test(coordinate))) { return {error: 'Invalid coordinate'} }
    
    if (!(/^[1-9]$/.test(value))) { return {error: 'Invalid value'} }

    var result = this.get_opts(puzzleObj, coordinate, value, "get conflicts");
    if (result.length > 0) {
      return {
        valid: false,
        conflict: result.filter((item, i) => item)
      }
    } else {
      return {
        valid: true
      }
    }
  }

  solve(puzzleObj) {
    // puzzleObj is here the result of applying validate method to the user input
    // in case there is an 'error' property in it, return the error object as such
    if (puzzleObj.error) {
      return puzzleObj
    }

    var nodes = []; // Will keep track of blank squares in the sudoku grid

    // Loop through all the grid units of sudoku utilizing a backtracking solution attempt (for this 'nodes' is previously defined).
    for (let i = 0; i < 81; i++) {
      /* In each loop, if sudoku unit is not blank, get all possible numeric options for blank sudoku units, define the start unit
      and progress through the remaining 8 units (excluding the currently pinned) for row, column and region with another loop to 
      to sift numeric options (being the initial guess the variable with value "123456789"). Depending on the outcome,
      fix a candidate value and continue loop, go back to a previous node, or end loop with an error due to impossibility of bringing up
      further solution values */
      let current_idx = `${this.rows[Math.floor(i / 9)]}${i % 9 + 1}`;

      if (!puzzleObj[current_idx]) {
        nodes.push(i)
      } // if the position contains no number, push its key to the array of nodes to keep track of

      if (nodes[nodes.length - 1] == i) {
        let current_value = puzzleObj[current_idx]; // Save the tentative value in the current position to be able to select the next one in this cycle (if any)
       
        let num_opts = this.get_opts(puzzleObj, current_idx, "", "get nums");
        if (num_opts.error) { return num_opts }
        
        let reg_exp = new RegExp(`[${Number(num_opts).toString()}]`, "g");
        let next_value = "123456789".replace(reg_exp, ""); // Available numeric options for current position
        // Implement logic based on calculated numeric options 
        switch (next_value.length) {
          case 0: // Return to previous node, if the node is starting node => no possible solutions can be found
            if (nodes.length == 1) {
              return {
                error: "Puzzle cannot be solved"
              }
            }
            nodes.pop();
            i = nodes[nodes.length - 1] - 1;
            break;
            // Select the next value in opts. If null, return no previous node, but if there is no node to return to, return an error message.   
          default:
            let next_num_idx = next_value.search(Number(current_value).toString()) + 1;
            let selected_num = next_value[next_num_idx];
            if (!selected_num) {
              if (nodes.length == 1) {
                return {
                  error: "Puzzle cannot be solved"
                }
              }
              nodes.pop();
              i = nodes[nodes.length - 1] - 1;
            } else {
              puzzleObj[current_idx] = selected_num;
            }
        }
      }
    }
    // Return the solution in the form of a string
    let puzzle_str = "";
    for (let i = 0; i < 81; i++) {
      let key = "ABCDEFGHI"[Math.floor(i / 9)] + (i % 9 + 1);
      puzzle_str += puzzleObj[key];
    }
    return {solution: puzzle_str};
  }
}

module.exports = SudokuSolver;

