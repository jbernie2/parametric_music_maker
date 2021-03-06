//TODO : 
//continue to test, although everything seems to be working right now
//do some commenting, refactoring, and reorganzing
//try out some different rule types  

//$(document).ready(function(){
 
    //there are currently two types of constraints, simple, and compound.
    //simple constraints consist of a simple comparison between one or two
    //voices and a constant

    //each constraint, both simple and compound, has two versions
    //a template, and applied version.
    
    //the constraint template is a generalize version of a constraint
    //that contains the logic to do a comparison but does not have
    //any voices to compare. 
    //a constraint template has a name given by the user

    //the applied constraint is a constraint given context
    //the constraint is applied to a specific location in the 
    //chord progression 
    //an applied constraint has an id that is generated
    //this is done so that when the csp solver is running
    //it simply looks at the specific spot in the matrix and
    //knows which constraints to check


//ALL THESE VARIABLES SHOULD BE PLACED IN THE ASSOCIATIVE ARRAY env
/*
    // a matrix of equal to the size of the solution matrix,
    // but instead of holding note values, each two dimensional
    // element is a list of constraint_ids that apply to that 
    // particular value
    var constraint_matrix;
    

    // a key value pairing between constraint_ids and the functions
    //  they represent
    var constraint_lookup;
    
    // a key value pairing between constraint_names and constraint
    // templates 
    var constraint_lookup_by_name;

    //a three dimensional array where the first two dimensions line
    //up with the size of the solution_matrix, and the the third is 
    //a list of constraints for that position
    var constraint_lookup_by_position;

    // a key value pairing between constraint_ids and all the compound
    // rules that they are a part of
    var reverse_constraint_lookup;

    // a key value pairing between a constraint's id and its truth value
    // this is so that constraints do not have to be evaluated over 
    // and over again for the same value
    var constraint_result_lookup;

    // a key value pairing between compound_constraint_names and 
    // compound_constraint templates 
    var compound_constraint_lookup_by_name;
    
    // a key value pairing between compound_constraint_ids and 
    // compound_constraints
    var compound_constraint_lookup;

*/

    function generate_id(){
        var id = 0;
        return function(){
            return "id_"+(++id);
        }
    }

    function create_constraint(env,intervals,options)
    {
        return function(chord1,voice1,chord2,voice2){
            return function(id){
                var constraint_lookup_by_position = 
                    env['constraint_lookup_by_position'];

                //initialize array
                if(!constraint_lookup_by_position[chord1])
                    constraint_lookup_by_position[chord1] = new Array();
                if(!constraint_lookup_by_position[chord1][voice1])
                    constraint_lookup_by_position[chord1][voice1] = new Array();
                 if(!constraint_lookup_by_position[chord2])
                    constraint_lookup_by_position[chord2] = new Array();
                if(!constraint_lookup_by_position[chord2][voice2])
                    constraint_lookup_by_position[chord2][voice2] = new Array();

                constraint_lookup_by_position[chord1][voice1].push(id);
                constraint_lookup_by_position[chord2][voice2].push(id);
                
                var note1 = {};
                var note2 = {};
                set_note_positions(note1,note2);

                return function(matrix){
                    var interval = undefined;
                    var result = undefined;
                    var constraint_result_lookup = 
                        env['constraint_result_lookup'];
                    var eval_function = options['eval_function'];

                    detect_backtrack(env,matrix);
                    interval = get_interval(matrix);
                    result = eval_function(interval,intervals,options);
                    constraint_result_lookup[id] = result;
                    return check_compound_constraint(id);
                }
                function get_interval(matrix){
                    var interval;
                    var first_note =  matrix[note1['chord']][note1['voice']];
                    var second_note = matrix[note2['chord']][note2['voice']];

                    if(second_note == undefined || first_note == undefined){
                        interval = undefined;
                    }else{
                        interval =  second_note - first_note;
                    }
                    return interval;
                }
                function detect_backtrack(env,matrix){

                    var constraint_lookup_by_position = 
                        env['constraint_lookup_by_position'];
                    var constraint_result_lookup = env['constraint_result_lookup'];
                    var backtrack = env['backtrack'];

                    if(backtrack.length == 0){
                        return;
                    }
                    for(var i = 0; i < backtrack.length; i++){
                        var chord = backtrack[i][0];
                        var voice = backtrack[i][1];
                        reset_constraints(
                            constraint_lookup_by_position[chord][voice]);
                    }
                    env['backtrack'] = [];

                    function reset_constraints(constraint_id_list){
                        for(var i = 0; i < constraint_id_list.length; i++){
                            var id = constraint_id_list[i];
                            constraint_result_lookup[id] = undefined;
                        }
                    }
                }
                function check_compound_constraint(constraint_id){

                    var reverse_constraint_lookup = 
                        env['reverse_constraint_lookup'];
                    var compound_constraint_lookup = 
                        env['compound_constraint_lookup'];
 
                    var compound_constraint_id = 
                        reverse_constraint_lookup[constraint_id];

                    var compound_constraint = 
                        compound_constraint_lookup[compound_constraint_id]; 

                    var result = compound_constraint(constraint_id);
                    
                    return result;
                }
                //note1 will always be the note that occurs ealier in the music
                //unless both notes occur at the same time, then it will be the 
                //one that occurrs in the lower voice, this is done so that the 
                //interval calculations are more informative, allowing rules
                //to infer the direction of the movement between the two notes
                function set_note_positions(note1,note2){
                    if(chord1 < chord2){
                        note1['chord'] = chord1;
                        note1['voice'] = voice1;
                        note2['chord'] = chord2;
                        note2['voice'] = voice2;
                    }
                    else if(chord1 == chord2){
                        if(voice1 <= voice2){
                            note1['chord'] = chord1;
                            note1['voice'] = voice1;
                            note2['chord'] = chord2;
                            note2['voice'] = voice2;
                        }
                        else{
                            note1['chord'] = chord2;
                            note1['voice'] = voice2;
                            note2['chord'] = chord1;
                            note2['voice'] = voice1;
                        }
                    }
                    else{
                        note1['chord'] = chord2;
                        note1['voice'] = voice2;
                        note2['chord'] = chord1;
                        note2['voice'] = voice1; 
                    }
                }
            };
        };
    }

    function create_constraint_template(env,name,intervals,options){

        var constraint_lookup_by_name = 
            env['constraint_lookup_by_name'];

        constraint_lookup_by_name[name] = create_constraint(env,intervals,options);
    }
 
    function create_compound_constraint_template(env,name,constraint_names,options){
        compound_constraint_lookup_by_name = 
            env['compound_constraint_lookup_by_name'];
        
        compound_constraint_lookup_by_name[name] = 
            function(env,overall_context,context){
                
                var next_id = env['next_id'];
                var constraint_lookup = env['constraint_lookup'];
                var compound_constraint_lookup = env['compound_constraint_lookup'];
                var reverse_constraint_lookup = env['reverse_constraint_lookup'];

                //get all the base positions to apply the constraints to
                var constraint_positions = apply_constraint(env,overall_context); 

                //for each valid position to apply constraint
                for(var i = 0; i < constraint_positions.length; i++){
                     var constraint_id_list = [];
                     var compound_constraint_id = next_id();
                     var applied_constraints = 
                      apply_compound_constraint(env,constraint_positions[i],constraint_names,context);

                    //take the list of applied constraints and give each constraint an
                    //id and place it in the lookup tables
                    for(var j = 0; j < applied_constraints.length; j++){
                        var constraint_id = next_id();
                        constraint_lookup[constraint_id] = applied_constraints[j](constraint_id); 
                        constraint_id_list.push(constraint_id);

                        reverse_constraint_lookup[constraint_id] = compound_constraint_id;
                    }

                    //place compound constraint in lookuptable 
                    compound_constraint_lookup[compound_constraint_id] = create_compound_constraint(env,constraint_id_list);
                }
            };

            function create_compound_constraint(env,constraint_id_list){
                return function(sanity_check){
                    var constraint_result_lookup = env['constraint_result_lookup'];
                    var rule_type = options['rule_type'];
                    var result = true;

                    for(var i = 0; i < constraint_id_list.length; i++){
                        constraint_result = constraint_result_lookup[constraint_id_list[i]];
                        if(constraint_result == undefined){
                            result = result && rule_type;
                        }
                        else
                            result = result && constraint_result;
                    }
                    return (result == rule_type);
                };
            }
        }

    //WORKING

    //finds the appropraite places to apply a constraint to, then returns ta function
    //that the constraint(s) can then be passed into to be applied to those positions.
    //since the postions found are only the first position in the sequence of valid positions,
    //each constraint applied must be passed in with an offset from the first position.
    function apply_constraint(env,overall_context){
    
        var relevant_positions = new Array();

        //the solution matrix can have any number of properties describing various things
        //about its contents, this function takes a property of the matrix and a specific
        //instance of that property and sees if that particular instance occurs within the 
        //matrix, this can be used to apply rules to very specific situations
        function get_all_positions(env,env_property, context_property, comparison_function){
            
            var length = env['length'];
            var positions = new Array();
            for(var i = 0; i < length ; i++){
                if(comparison_function(env,i,env_property,context_property)){
                    positions.push(i);
                }  
            }
            return positions; 
        }

        //WORKING

        //find all positions that matched all properties
        function find_universal_positions(){
            var universal_positions = new Array();
            for(var i = 0; i < relevant_positions[0].length; i++){
                var universal_position = true;
                for(var j = 0; j < relevant_positions.length; j++){
                    var matches = false;
                    for(var k = 0; k < relevant_positions[j].length; k++){
                        if(relevant_positions[0][i] == relevant_positions[j][k])
                            matches = true;
                    }
                    univeral_position = universal_position && matches;
                }
                if(univeral_position)
                    universal_positions.push(relevant_positions[0][i]);
            }
            return universal_positions;
        }

        
        //WORKING

        //loop through all properties of the constraint and see if
        //there are any that match environment properties, if they have the same
        //name, they match. If they match, check to see if the properties have
        //equal content, a customized function can be passed in to compare them
        var properties = overall_context['properties'];
        var comparison_functions = overall_context['comparison_functions'];

        for(var property_key in properties){
            for(var env_key in env){
                if(property_key == env_key){
                    relevant_positions.push(
                        get_all_positions(env,env[env_key],
                                          properties[property_key],
                                          comparison_functions[property_key]));
                }
            }
        }

 
        relevant_positions = find_universal_positions();

        return relevant_positions;
    }


    // a new apply constraint method, I dont think the old one is correct
    function apply_compound_constraint(env,starting_position,constraint_names,context){

        var applied_constraints = new Array();
        for(var i = 0; i < constraint_names.length; i++){
            var constraint = env['constraint_lookup_by_name'][constraint_names[i]];
            var offset = context[i]['offset'];
            var second_offset = context[i]['second_offset'];
            var from_voice = context[i]['from_voice'];
            var to_voice = context[i]['to_voice'];

            applied_constraints.push(constraint(starting_position+offset,
                                                from_voice,
                                                starting_position+second_offset,
                                                to_voice));
        }
        return applied_constraints;
    }
  
//});
