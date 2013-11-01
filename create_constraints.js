//TODO : write apply_constraint, which takes a generalized rule or rules, and 
//applys them to the appropriate locations in the solution matrix


$(document).ready(function(){
 
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


    function generate_id(){
        var next_id = 0;
        return function(){
            return "id_"+(++id);
        }
    }

    function check_interval(env,intervals,options)
    {
        return function(id,chord1,voice1,chord2,voice2){

            var constraint_lookup_by_position = 
                env['constraint_lookup_by_position'];
            constraint_lookup_by_position[i][j].push(id);

            if(options['greater_than'] == true){
                return function(matrix){
                    detect_backtrack();
                    var interval = get_interval(matrix);
                    if(interval > intervals[0])
                        return check_compound_constraint(id,result);
                }
            }
            else if(options['less_than'] == true){
               return function(matrix){
                    detect_backtrack();
                    var interval = get_interval(matrix);
                    if(interval < intervals[0])
                        return check_compound_constraint(id,result);
                } 
            }
            else{
               return function(matrix){
                    detect_backtrack();
                    var interval = get_interval(matrix);
                    for(var i = 0; i < intervals.length; i++){
                        if(interval == intervals[i])
                            return check_compound_constraint(id,result);
                    }
                } 
            }
            function get_interval(matrix){
                return (abs(matrix[chord2][voice2] - matrix[chord1][voice1])) 
            }
            function detect_backtrack(){

                var constraint_result_lookup = env['constraint_lookup'];
                var last_chord = env['last_chord'];
                var last_voice = env['last_voice'];

                if(last_chord > chord){
                    for(var i = 0, i <= last_voice; i++)
                    {
                        reset_constraints(
                            constraint_lookup_by_position[last_chord][i]);
                    }
                }else if(last_voice > voice){
                    for(var i = voice+1, i <= last_voice; i++)
                    {
                        reset_constraints(
                            constraint_lookup_by_position[chord][i]);
                    }
                } 
                function reset_constraints(constraint_id_list){
                    for(var i = 0; i < constraint_id_list.length; i++){
                        var id = constraint_id_list[i];
                        constraint_result_lookup[i] = "true";
                    }
                }
            }
            function check_compound_constraint(constraint_id,result){
                var constraint_result_lookup = 
                    env['constraint_result_lookup'];
                var reverse_constraint_lookup = 
                    env['reverse_constraint_lookup'];
                var compound_constraint_lookup = 
                    env['compound_constraint_lookup'];
                var compound_constraints_ids = 
                    reverse_constraint_lookup[contraint_id];

                constraint_result_lookup[constraint_id] = result;
                
                for(var i = 0; i < compound_constraint_ids.length; i++){
                    compound_constraint = 
                        compound_constraint_lookup[compound_constraint_ids[i]];
                    result = result && compound_constraint();
                }
                return result;
            }    
        }
    }
  
    function create_constraint_template(env,name,intervals,options){

        var constraint_lookup_by_name = 
            env['constraint_lookup_by_name'];

        if(options['constraint_type'] == "check_interval"){
            contraint_lookup_by_name[name] = check_interval(env,intervals,options);
        }
    }
 
    function create_compound_constraint_template(env,name,constraint_names,options){
        compound_constraint_lookup_by_name = 
            env['compound_constraint_lookup_by_name'];
        
        compound_constraint_lookup_by_name[name] = 
            function(env,context){
                
                var next_id = env['next_id'];
                var constraint_lookup = env['constraint_lookup'];
                var compound_constraint_lookup = env['compound_constraint_lookup'];
                var reverse_constraint_lookup = env['reverse_constraint_lookup'];
                var constraint_id_list = new Array();
                var compound_constraint_id = next_id();

                

                for(var i = 0; i < constraint_names.length; i++){
                    var constraint = constraint_names[i];

                    var constraint_id = next_id();
                    constraint_lookup[constraint_id] = 
                        apply_constraint(env,context[i],constraint);
                    constraint_id_list.push(constraint_id);

                    reverse_constraint_lookup[constraint_id] = compound_constraint_id;
                }

                compound_constraint_lookup[compound_constraint_id] = function(){

                    var constraint_result_lookup = env['constraint_result_lookup'];
                    var rule_type = options['rule_type'];
                    var result = true;


                    for(var i = 0; i < constraint_id_list.length; i++){
                        constraint_result = constraint_result_lookup[constraint_id_list[i]];
                        if(constraint_result == undefined)
                            result = result && true;
                        else
                            result = result && constraint_result;
                    }
                    return (result == rule_type);
                };
            };
    }

    //THIS NEEDS A LOT OF WORK
    function apply_constraint(env,overall_context){
    
        var relevant_positions;
        function get_relevant_positions(env_property, context_property){
            relevant_positions = new Array();
            if(env_property typeof Array && context_property typeof Array){
                for(var i = 0; i < env_property.length; i++){
                    valid_position = true;
                    if(env_property.length-i  > context_property){
                        for(var j = 0; j < context_property.length; j++){
                           var result = get_relevant_positions(env_property[i],context_property[j])
                           if(result typeof Array)
                               relevant_positions.push(result);
                           else if(!result)
                               valid_position = false;
                        }
                    }
                }
                return relevant_positions;
            }
            else if((typeof env_property) == (typeof context_property))
                return (env_property == context_property);
            else
                return [];
        }

        for(var context_key in overall_context){
            for(var env_key in env){
                if(context_key == env_key){
                    relevent_postions.push(
                        get_relevant_postions(env[env_key],overall_context[context_key]));
                }
            }
        }

        return function(context,constraint){
            
        };
  
/*
        function get_relevant_positions(){

            var relevant_positions;

            var chord_progression = env['chord_progression'];
            var chord_sequence = overall_context['chord_sequence'];

            for(var i = 0; i < chord_progression.length; i++){
                var matching_chords = true;
                if(i + chord_sequence.length <= chord_progression.length){
                    for(var j = 0; j < chord_sequence.length && matching_chords; j++){
                        if(!chord_progression[i] == chord_sequence[j])
                            matching_chords = false;
                    }
                }
                if(matching_chords){
                    relevant_positions['chord_positions'] = i;
                }
            }  
        }
        var relevant_positions = get_relevant_postions();
*/
  }
}
