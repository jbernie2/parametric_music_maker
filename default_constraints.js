
//Application functions

function apply_constraint_to_all_voices(){
    return function(env, overall_context, constraint, length){
        var context = [];
        context[0] = {};
        context[1] = {};
        var num_voices = env['matrix'][0].length;

        for(var i = 0; i < num_voices; i++){
            for(var j = i+1; j < num_voices; j++){
                if(i != j){
                    context[0]['from_voice'] = i;
                    context[0]['to_voice'] = j;
                    context[1]['from_voice'] = i;
                    context[1]['to_voice'] = j;

                    for(var k = 0; k < length; k++){
                        context[0]['offset'] = k;
                        context[0]['second_offset'] = k;
                        context[1]['offset'] = k + 1;
                        context[1]['second_offset'] = k + 1;
                        
                        constraint(env,overall_context,context);
                    }
                }
            }
        }
    };
}

function apply_constraint_to_adjacent_voices(){
    return function(env, overall_context, constraint){
        var context = [{},{}]; 
        context[0]['offset'] = 0;
        context[0]['second_offset'] = 0;
        
        var num_voices = env['matrix'][0].length;
        for(var i = 0; i < num_voices; i++){
            if(i < num_voices-1){
                context[0]['from_voice'] = i;
                context[0]['to_voice'] = i+1;
                constraint(env,overall_context,context);
            }
        }
    };
}

function apply_constraint_horizontally(){
    return function(env, overall_context, constraint, length){
        var num_voices = env['matrix'][0].length;
        for(var i = 0; i < num_voices; i++){
            context = [];
            for(var j = 0; j < length-1; j++){
                context[j] = {};
                context[j]['offset'] = j;
                context[j]['second_offset'] = j + 1;
                context[j]['from_voice'] = i;
                context[j]['to_voice'] = i;
            }
            constraint(env,overall_context,context);
        }
    };
}

//a constraint needs to be given the following information to be created
//  name : a name that describes the purpose of the constraint in a
//      word or two
//  intervals : an array that contains the intervals which are relevant to
//      the constraint's evalutaion function
//  options : this might get removed, currently only contains the evalutaion
//      function
//  eval_function : the function that is run to determine the truth value of
//      the constraint
function empty_simple_constraint_info(){
    var simple_constraint_info = {};
    simple_constraint_info['options'] = {};
    return simple_constraint_info;
}

//a compound constraint needs the following information to be created
//  options : might get removed currently only contains rule_type
//  rule_type : either true or false, this is the value which the
//      the conjunction of the compound_constraint's simple constraints
//      must reach for the compound_constraint to return true
//  context : contains information about the context under which the 
//      the compound constraint should be applied
//  properties : field in context, can contain various types of information
//      about where to apply the constraint, be it only for certain chords,
//      or only at certain position in the matrix
//  comparison_functions : field in context. Each property must have a 
//      comparison function so that it can be checked against the properties
//      of the matrix
//  constraint_application_function : after the context under which to apply
//      the constraint is found, this function goes and actually calls the
//      necessary function to apply it. some of the default application
//      function apply the simple constraint to all pairs of voices, some
//      apply only to adjacent voices.

function empty_compound_constraint_info(num_constraints){
    var compound_constraint_info = {};
    compound_constraint_info['options'] = {};
    compound_constraint_info['context'] = {};
    compound_constraint_info['context']['properties'] = {};
    compound_constraint_info['context']['comparison_functions'] = {};
    compound_constraint_info['simple_constraints'] = [];
    for(var i = 0; i < num_constraints; i++){
        compound_constraint_info['simple_constraints'][i] = empty_simple_constraint_info();
    }
    return compound_constraint_info;
}

function apply_default_constraint(env,constraint){
       
        var simple_constraint_names = [];
        for(var i = 0; i < constraint['simple_constraints'].length; i++){
		    create_simple_constraint(env,
                constraint['simple_constraints'][i]['name'],
                constraint['simple_constraints'][i]['intervals'],
                constraint['simple_constraints'][i]['options']);
            simple_constraint_names[i] = constraint['simple_constraints'][i]['name'];
        }

        create_compound_constraint(env,
            constraint['name'],
            simple_constraint_names,
            constraint['options']);

        var compound_constraint = env['compound_constraint_lookup_by_name'][constraint['name']];
        var application_function = constraint['constraint_application_function'];
        application_function(env, 
            constraint['context'], 
            compound_constraint,
            constraint['context']['properties']['length']);

}


//Default constraints

function parallel_intervals(name,intervals,sequence_length){
    var parallel_intervals = empty_compound_constraint_info(sequence_length);
    parallel_intervals['simple_constraints'][0]['name'] = name;
    parallel_intervals['simple_constraints'][0]['intervals'] = intervals;
    parallel_intervals['simple_constraints'][0]['options']['eval_function'] =
         function(env,note1,note2,interval,intervals,options){
            if(interval == undefined)
                return false;           
            var result = false;
            interval = Math.abs(interval);
            for(var i = 0; i < intervals.length; i++){
                if(interval == intervals[i])
                    result = true;
            }
            return result;
        };
    for(var i = 1; i < sequence_length; i++){
        parallel_intervals['simple_constraints'][i] = parallel_intervals['simple_constraints'][0];
    }
    parallel_intervals['name'] = name;
    parallel_intervals['options']['rule_type'] = false;
    parallel_intervals['context']['properties']['length'] = sequence_length;
    parallel_intervals['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    parallel_intervals['constraint_application_function'] = apply_constraint_to_all_voices();
    return parallel_intervals;
}

function max_distance(distance){
    var max_distance = empty_compound_constraint_info(1);
    max_distance['simple_constraints'][0]['name'] = "max_distance";
    max_distance['simple_constraints'][0]['intervals'] = distance;
    max_distance['simple_constraints'][0]['options']['eval_function'] =
         function(env,note1,note2,interval,intervals,options){ 
            if(interval == undefined)
                return true;
            var result = false;
            interval = Math.abs(interval);
            for(var i = 0; i < intervals.length; i++){
                if(interval <= intervals[i])
                    result = true;
                }
            return result;
        };
    max_distance['name'] = 'max_distance';
    max_distance['options']['rule_type'] = true;
    max_distance['context']['properties']['length'] = 1;
    max_distance['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    max_distance['constraint_application_function'] = apply_constraint_to_adjacent_voices();
    return max_distance;
}

function min_distance(distance){
    var min_distance = empty_compound_constraint_info(1);
    min_distance['simple_constraints'][0]['name'] = "min_distance";
    min_distance['simple_constraints'][0]['intervals'] = distance;
    min_distance['simple_constraints'][0]['options']['eval_function'] =
        function(env,note1,note2,interval,intervals,options){ 
            if(interval == undefined)
                return true;
            var result = false;
            interval = Math.abs(interval);
            for(var i = 0; i < intervals.length; i++){
                if(interval >= intervals[i])
                    result = true;
            }
            return result;
       };
 
    min_distance['name'] = 'min_distance';
    min_distance['options']['rule_type'] = true;
    min_distance['context']['properties']['length'] = 1;
    min_distance['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    min_distance['constraint_application_function'] = apply_constraint_to_adjacent_voices();
    return min_distance;
}

function upward_leap_recovery(leap_interval,recovery_interval){
    var upward_leap_recovery = empty_compound_constraint_info(2);
    upward_leap_recovery['simple_constraints'][0]['name'] = "upward_leap";
    upward_leap_recovery['simple_constraints'][0]['intervals'] = leap_interval;
    upward_leap_recovery['simple_constraints'][0]['options']['eval_function'] =
        function(env,note1,note2,interval,intervals,options){ 
            if(interval == undefined)
                return false;     
            var result = false;
            for(var i = 0; i < intervals.length; i++){
                if(interval >= intervals[i])
                    result = true;
                }
            return result;
        };
       
    upward_leap_recovery['simple_constraints'][1]['name'] = "recover_down";
    upward_leap_recovery['simple_constraints'][1]['intervals'] = recovery_interval;
    upward_leap_recovery['simple_constraints'][1]['options']['eval_function'] =
        function(env,note1,note2,interval,intervals,options){ 

            if(interval == undefined)
                return false;
            
            var result = false;
            for(var i = 0; i < intervals.length; i++){
                if(interval <= intervals[i] || interval >= 0)
                    result = true;
                }
            return result;
        };


    upward_leap_recovery['name'] = 'upward_leap_recovery';
    upward_leap_recovery['options']['rule_type'] = false;
    upward_leap_recovery['context']['properties']['length'] = 3;
    upward_leap_recovery['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    upward_leap_recovery['constraint_application_function'] = apply_constraint_horizontally();
    return upward_leap_recovery;
}

function downward_leap_recovery(leap_interval, recovery_interval){
    var downward_leap_recovery = empty_compound_constraint_info(2);
    downward_leap_recovery['simple_constraints'][0]['name'] = "downward_leap";
    downward_leap_recovery['simple_constraints'][0]['intervals'] = leap_interval;
    downward_leap_recovery['simple_constraints'][0]['options']['eval_function'] =
         function(env,note1,note2,interval,intervals,options){ 

            if(interval == undefined)
                return false;
            
            var result = false;
            for(var i = 0; i < intervals.length; i++){
                if(interval <= intervals[i])
                    result = true;
                }
            return result;
        };
       
    downward_leap_recovery['simple_constraints'][1]['name'] = "recover_up";
    downward_leap_recovery['simple_constraints'][1]['intervals'] = recovery_interval;
    downward_leap_recovery['simple_constraints'][1]['options']['eval_function'] =
         function(env,note1,note2,interval,intervals,options){ 

            if(interval == undefined)
                return false;
            
            var result = false;
            for(var i = 0; i < intervals.length; i++){
                if(interval > intervals[i] || interval <= 0 )
                    result = true;
                }
            return result;
        };

    downward_leap_recovery['name'] = 'downward_leap_recovery';
    downward_leap_recovery['options']['rule_type'] = false;
    downward_leap_recovery['context']['properties']['length'] = 3;
    downward_leap_recovery['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    downward_leap_recovery['constraint_application_function'] = apply_constraint_horizontally();
    return downward_leap_recovery;
}

