
/*
//intializes the environment which contains all the global
//data structure and variables
//
//some useful terms
//matrix : when referring to the matrix I am referring to
//  the two dimensional array which store the current 
//  solution to the musical composition that is being created
//constraint : a function that is used to limit what values
//  can be used in the matrix
//simple constraint : a constraint that compares the notes 
//  of two positions, or checks a single note for certain
//  conditions
//compound constraint : the constraint whose truth value is
//  a function of the simple constraints that it contains
//unapplied constraint or constraint template : a constraint
//  that has not been given a certain position in the matrix
//  to check, these constraints have word names like 
//  "parallel_fifths" or "max_leap_distance"
//applied constraint : a constraint that has been set to a
//  specific position in the matrix, these constraints are
//  given a unique id instead of a name
//properties : both the matrix and compound constraints can
//  can have any number of properties, properties are simply
//  additional information about the matrix or the constraint
//  that allow for constraints to applied in arbitrarily 
//  specific circumstances, the only default properties right
//  now are length and chord_progression. For the matrix, length
//  is simply the number of note any given voice has, which is
//  also currently equal to the number of chords in the progression
//  For a compound constraint, the length is the distance
//  between the two farthest simple constraints. The chord_progression
//  property is a list of the chords in the order that they are going
//  to be played. It is easy to see how other properties could be
//  added in the future to accound for rhythm, instrumentation,
//  dynamics, or anything else
*/

function initialize_environment(){
        //the globaL data structure that is passed
        //to most functions
        var env = {};

        //a mapping between a simple constraint's id
        //and the function that can be used to check
        //its validity in a given circumstance
        //a constraint is only given an id once it 
        //has been applied to a certain position in
        //the matrix
        env['constraint_lookup'] = {};

        //a mapping between a constraints name and
        //its function, a constraint with a name
        //does not have a particular id since a named
        //constraint is yet to be applied to a position
        //in the matrix. a constraint with and id is 
        //an applied version of one of the constraints
        // in this mapping
        env['constraint_lookup_by_name'] = {};

        //a mapping between positions in the matrix and
        //the ids of the constraints that have been 
        //been applied to that position 
        env['constraint_lookup_by_position'] = [];

        //a mapping between a compound constraint's name
        //and an unapplied version of the constraint
        env['compound_constraint_lookup_by_name'] = {};

        //a mapping between a compound constraint's id
        //and the applied version of the compound constraint
        env['compound_constraint_lookup'] = {};

        //this maps the id of a simple constraint to
        //the id of the compound constraint that contains
        //the simple one
        env['reverse_constraint_lookup'] = {};

        //a mapping between a constraint's id and
        //its most recently set truth value, constraints
        //that have not been evaluated or that have been
        //reset are set to undefined
        env['constraint_result_lookup'] = {};

        //a list of positions for which the constraints
        //need to be reset, positions are added in the
        //backtrack function of csp_solver.js, and the 
        //positions are reset in detect_backtrack in
        //create_simple_constraint.js
        env['backtrack'] = [];

        //each constraint has a unique id
        //this function provides those ids
        env['next_id'] = generate_id();

        return env;
}
//the function that generates ids, is called
//by next_id in env
function generate_id(){
    var id = 0;
    return function(){
        return "id_"+(++id);
    }
}


