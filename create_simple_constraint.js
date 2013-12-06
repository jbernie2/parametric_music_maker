function create_simple_constraint(env,name,intervals,options){
    var constraint_lookup_by_name = env['constraint_lookup_by_name'];
    constraint_lookup_by_name[name] = 
        function(chord1,voice1,chord2,voice2){
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

