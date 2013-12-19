
//creates an unapplied compound_constraint
function create_compound_constraint(env,name,constraint_names,options){
    compound_constraint_lookup_by_name = 
        env['compound_constraint_lookup_by_name'];
    
    //function to apply compound_constraint to a given position
    compound_constraint_lookup_by_name[name] = 
        function(env,overall_context,context){
            
            var next_id = env['next_id'];
            var constraint_lookup = env['constraint_lookup'];
            var compound_constraint_lookup = env['compound_constraint_lookup'];
            var reverse_constraint_lookup = env['reverse_constraint_lookup'];

            //get all the base positions to apply the constraints to
            var constraint_positions = get_relevant_positions(env,overall_context); 

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
                compound_constraint_lookup[compound_constraint_id] = 
                    check_compound_constraint(env,constraint_id_list);
            }
        };

        function check_compound_constraint(env,constraint_id_list){
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
function get_relevant_positions(env,overall_context){
    
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
