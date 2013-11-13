//TODO: TEST EVERYTHING!!!!!



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
        var next_id = 0;
        return function(){
            return "id_"+(++id);
        }
    }

    function check_interval(env,intervals,options)
    {
        return function(chord1,voice1,chord2,voice2){
            return function(id){
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
                        for(var i = 0; i <= last_voice; i++)
                        {
                            reset_constraints(
                                constraint_lookup_by_position[last_chord][i]);
                        }
                    }else if(last_voice > voice){
                        for(var i = voice+1; i <= last_voice; i++)
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
            };
        };
    }
  
    function create_constraint_template(env,name,intervals,options){

        var constraint_lookup_by_name = 
            env['constraint_lookup_by_name'];

        if(options['constraint_type'] == "check_interval"){
            constraint_lookup_by_name[name] = check_interval(env,intervals,options);
        }
    }
 
    function create_compound_constraint_template(env,name,constraint_names){
        compound_constraint_lookup_by_name = 
            env['compound_constraint_lookup_by_name'];
        
        compound_constraint_lookup_by_name[name] = 
            function(env,overall_context,context){
                
                var next_id = env['next_id'];
                var constraint_lookup = env['constraint_lookup'];
                var compound_constraint_lookup = env['compound_constraint_lookup'];
                var reverse_constraint_lookup = env['reverse_constraint_lookup'];
                var constraint_id_list = new Array();
                var compound_constraint_id = next_id();

                //get all the base positions to apply the constraints to
                var constraint_application_environment = apply_contraints(env,overall_context); 

                //for each constraint
                for(var i = 0; i < constraint_names.length; i++){
                    var constraint = constraint_names[i];

                    //apply the constraint to the positions found, this results
                    //in a list of applied constraints
                    var applied_constraints = 
                        constraint_application_environment(env,context[i],constraint);

                    //take the list of applied constraints and give each constraint an
                    //id and place it in the lookup tables
                    for(var j = 0; j < applied_constraints.length; j++){
                        var constraint_id = next_id();
                        constraint_lookup[constraint_id] = applied_constraints[j]; 
                        constraint_id_list.push(constraint_id);
                        reverse_constraint_lookup[constraint_id] = compound_constraint_id;
                    }
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

    //finds the appropraite places to apply a constraint to, then returns ta function
    //that the constraint(s) can then be passed into to be applied to those positions.
    //since the postions found are only the first position in the sequence of valid positions,
    //each constraint applied must be passed in with an offset from the first position.
    function apply_constraint(env,overall_context){
    
        var relevant_positions;

        //the solution matrix can have any number of properties describing various things
        //about its contents, this function takes a property of the matrix and a specific
        //instance of that property and sees if that particular instance occurs within the 
        //matrix, this can be used to apply rules to very specific situations
        function get_all_positions(env_property, context_property, comparison_function){
            

            //default comparison function if none is provided, just checks for equality
            //of the two properties passed in 
            function check_positions(env_property,context_property){
                if((env_property == typeof Array && context_property == typeof Array)&&
                    env_property.length == context_property.length){
                    var result = true;
                    for(var i = 0; i < env_property.length; i++){
                        if(!check_positions(env_property[i], context_property[i]))
                            result = false;
                    }
                    return result;
                }
                else if((typeof env_property) == (typeof context_property))
                    return (env_property == context_property);
                else
                    return false;
            }
            
            var positions = new Array();
            if(env_property == typeof Array && context_property == typeof Array){
                for(var i = 0; i < env_property.length; i++){
                    valid_position = true;
                    if(env_property.length-i  > context_property){
                        for(var j = 0; j < context_property.length; j++){
                            var result;
                            if(comparison_function != undefined)
                                result = comparison_function(env_property[i],context_property[j]);
                            else 
                                result = check_positions(env_property[i],context_property[j]);
                            
                            if(!result)
                                valid_position = false;
                        }
                    }
                    if(result)
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
                    relevent_postions.push(
                        get_all_positions(env[env_key],
                                              properties[property_key],
                                              comparison_functions[property_key]));
                }
            }
        }

        relevant_positions = find_universal_positions();


        //apply a constraint to all the positions that were found to match the
        //the constraint's properties, this returns a list of the applied constraints
        return function(env,context,constraint){
            var offset = context['offset'];
            var second_offset = context['second_offset'];
            var from_voice = context['from_voice'];
            var to_voice = context['to_voice'];
            var applied_constraints = new Array();
 
            for(var i = 0; i < relevant_positions.length; i++){
                var position = relevant_positions[i]; 
                applied_constraints.push(constraint(position+offset,
                                                    position+offset+second_offset,
                                                    from_voice,to_voice));
            }
            return applied_constraints;
        };
    }  
//});
