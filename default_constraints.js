//TODO: add the rest of the constraints with the same format


//Application functions

function apply_constraint_to_all_voices(){
    return function(env, overall_context, constraint){
        var context = [{},{}]; 
        context[0]['offset'] = 0;
        context[0]['second_offset'] = 0;
        context[1]['offset'] = 1;
        context[1]['second_offset'] = 1;

        var num_voices = env['matrix'][0].length;
        for(var i = 0; i < num_voices; i++){
            for(var j = i+1; j < num_voices; j++){
                if(i != j){
                    context[0]['from_voice'] = i;
                    context[0]['to_voice'] = j;
                    context[1]['from_voice'] = i;
                    context[1]['to_voice'] = j;
                    constraint(env,overall_context,context);
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
        context[1]['offset'] = 1;
        context[1]['second_offset'] = 1;
        
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

function empty_simple_constraint_info(){
    var simple_constraint_info = {};
    simple_constraint_info['options'] = {};
    return simple_constraint_info;
}

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
        application_function(env, constraint['context'], compound_constraint);
}


//Default constraints

function parallel_fifths(){
    var parallel_fifths = empty_compound_constraint_info(2);
    parallel_fifths['simple_constraints'][0]['name'] = "fifths";
    parallel_fifths['simple_constraints'][0]['intervals'] = [6,7];
    parallel_fifths['simple_constraints'][0]['options']['eval_function'] =
         function(interval,intervals,options){
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
    parallel_fifths['simple_constraints'][1] = parallel_fifths['simple_constraints'][0];
    parallel_fifths['name'] = 'parallel_fifths';
    parallel_fifths['options']['rule_type'] = false;
    parallel_fifths['context']['properties']['length'] = 2;
    parallel_fifths['context']['comparison_functions']['length'] = 
        function(env,i,env_property,context_property){
            if(i+(context_property)-1 < env_property)
                return true;
            else
                return false; 
        };

    parallel_fifths['constraint_application_function'] = apply_constraint_to_all_voices();
    return parallel_fifths;
}

function max_distance(){
    var max_distance = empty_compound_constraint_info(1);
    max_distance['simple_constraints'][0]['name'] = "max_distance";
    max_distance['simple_constraints'][0]['intervals'] = [12];
    max_distance['simple_constraints'][0]['options']['eval_function'] =
         function(interval,intervals,options){ 
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
