var letters = "ABCDEFGHI"; //all the rows
var digits = "123456789"; // all the cols, and valid digits
var qv = "tttmmmbbb"; //used for determining quadrant vertical.
var qh = "lllcccrrr"; //used for determining quadrant horizontal.

var squares = {}; 
var unitlist = {};
var units = {};
var peers = {};

//create these prototypes, to make life easier.
Array.prototype.contains = function(v){
    return this.indexOf(v) >= 0;
}
String.prototype.contains = function(v){
    return this.indexOf(v) >= 0;
}

//create all the squares and unitlists
//squares are created by joining a letter from 'letters' and a digit from digits.
for(var i=0;i < letters.length;i++){
    for(var j=0;j< digits.length;j++){
        var row = letters[i];
        var col = digits[j];
        var name = row+col; //this would be a combo of "A,B,C,D,..." and "1,2,3,4,..." == "A1", "B2", etc
        squares[name] = true; //populate the squares object with the square names as keys
        unitlist[row] = (unitlist[row] || []).concat([name]); //add the square name to the row unit it belongs to
        unitlist[col] = (unitlist[col] || []).concat([name]); //add the suqare name to the col unit it belongs to
        unitlist[qv[i]+qh[j]] = (unitlist[qv[i]+qh[j]] || []).concat([name]); //add the square to the quadrant it belongs to. ex. "TL" "BR" etc...
    }
}

for (var s in squares){ //loop through the squares
    units[s] = []; //create the units array for that square on the units object
    for(var key in unitlist){ //Check all units
        if(unitlist[key].contains(s)){ //See if the square belongs to the unit
            units[s].push(unitlist[key]); //if so, add the unit to the squares list of units, should be 3 each
        }
    }
}

for(var s in squares){ //build the peers.
    peers[s] = []; //create peer array for the square
    units[s].forEach(function(unit){ //loop through the units for that square, (which was just populated above)
        unit.forEach(function(p){ //loop through those units, (all 3)
            //Push the Peer Name("B3","B4", etc) to the peers ONCE ONLY!
            if(p !==s && !peers[s].contains(p)){ //this is the check to make sure you didn't already add it.
                peers[s].push(p);//Ok, we checked, it wasn't added, add it now.
            }
        });
    });
}


//This is responsible for solving a given puzzle.
//grid is a string that represents a board.
function parseGrid(grid){
    var values = {};//This will be an object that holds ALL possible values for any given square ({A1:'123678',A2:'45',...})
    
    for(var s in squares){
        values[s] = digits; //assign digits "123456789" to all squares to begin.
    }
    
    //We now need to apply the given digits from grid.
    var i=0; //holder for were we are in the grid string.
    for(var square in squares){ //loop through each square.
        if(digits.contains(grid[i])){ //If the digit is a number from 1-9. 
            if(!assign(values,square,grid[i])){ // assign the given number to the square by calling assign.
                return false; //If assign returns false, that means we failed a guess, this shouldn't happen until we do hard puzzles.
            }
        }   
        i++; //don't forget to increment i.
    }
    return values; //once solved, return the values.
}

//The assign function is responsible for assigning a single digit to a given square.
//It does this be eliminating all the 'other' digits from the square.
function assign(values, s, d){
    var otherVals = values[s].replace(d,''); //copy the digits that need to be removed from this square.
    for (var i=0; i < otherVals.length;i++){ //loop through each of them
        if(!eliminate(values,s,otherVals[i])){ //Call eliminate for each one
            return false; //contradiction encountered. This will be used when we start searching.
        }
    }
    
    return values;
}

//Eliminate a given digit from a square.
function eliminate(values,s,d){
    if(!values[s].contains(d)){ //If the digit has already been eliminated, no need to check anything.
        return values; //Retrun our values.
    }
    
    values[s] = values[s].replace(d,''); //remove the diit from the square
    
    /*THIS CODE IS ONLY NEEDED WHEN WE START SEARCHING!
    if(values[s].length === 0){ //after removing the digit... make sure we didnt break anything. If so, we return false.
        return false; //contradiction... no values can be empty
    }
    */
    
    if(values[s].length === 1){ //If we are down to 1 digit left in our square, we will eliminate that digit from all of its peers.
        peers[s].forEach(function(p){ //loop through each peer.
            eliminate(values, p, values[s]); //Eliminate the digit
        });
    }
    
    //We can use the following algorithm to assign digits that have only 1 possible square in a unit. 
    //For example, If a unit has only one possible location for the number 3, we can safely assign 3 to that square.
    //In order to discover this, we will check every unit our square is in, one at a time. Row, Column, Quadrant.
    //we will check to see if any other squares in the unit have d as an option.
    units[s].forEach(function(unit){ //get the units S is in, and loop through each one.
        var dplaces = []; //add a placeholder for squares that contain our digit.
        unit.forEach(function(s){ //loop through each square.
           if(values[s].contains(d)){ //Check to see if it contains our digit.
               dplaces.push(s); //If it does, add it to our temporary holder.
           }
        });
        
        if(dplaces.length == 0){
            return false;//Condradiction encounterd, ONLY USED DURING GUESSING.
        }
        
        if(dplaces.length == 1){ //only one square in the unit can hold this digit, we are safe to assign it!
            if(!assign(values,dplaces[0],d)){ //Assign the digit to the unique square.
                return false; //If assign returns false, that means we reached contradiction. This would only happen during search.
            }
        }
    });

    return values; //If we get here, all is good, we can return values.
}

function draw(values){
    for(var key in values){
        document.getElementById(key).innerHTML = values[key]; 
    }
}

var puzzle = "008160090010004006726000000800951003507208901100476008000000562600300010050047800";
var vals = parseGrid(puzzle); //Call parse grid to solve the puzzle.
draw(vals);//Draw the grid;
