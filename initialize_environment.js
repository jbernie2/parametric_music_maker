function initialize_environment(){
        var env = {};
        env['next_id'] = generate_id();
        env['backtrack'] = [];
        env['constraint_matrix'] = {};  
        env['constraint_lookup'] = {};
        env['constraint_lookup_by_name'] = {};
        env['constraint_lookup_by_position'] = [];
        env['reverse_constraint_lookup'] = {};
        env['constraint_result_lookup'] = {};
        env['compound_constraint_lookup_by_name'] = {};
        env['compound_constraint_lookup'] = {};
        return env;
}
function generate_id(){
    var id = 0;
    return function(){
        return "id_"+(++id);
    }
}


