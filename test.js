
//************************************************************
//
//      RULE TEMPLATE
//
//************************************************************
 
    //checks to see if argument is an array, and 
    //that it is of the correct length
    function valid_array(sequence_length, arr){
        if(arr instanceof Array){
            if(arr.length != sequence_length)
                return false;
            else
                return true;
        }
        arr = null;
        return true;
    }
    //checks the to see if the chord progression matches
    //the one required for the rule to be relevant 
    function check_chord_progession(chord_progression,
        chord_sequence,current_chord){
        if(!chord_sequence)
            return true;
        for(var i = 0; i < chord_sequence.length; i++){
            if(chord_progression[current_chord-i] != 
               chord_sequence[chord_sequence.length-1-i])
                return false;
        }
        return true;
    }
    
    //check to see if the voice seqeuences are valid
    function valid_voices(matrix,from_voices_sequence,to_voices_sequence){
        //iterate through voices and look for passed in voice
        function check_voices(voices){
            for(var i = 0; i < voices.length; i++){
                for(var j = 0; j < voices[i].length; j++){
                    if(voices[i][j] >= matrix[0].length || voices[i][j] < 0)
                        return false;
                }
            }
            return true;
        }
        //if sequences are null, return
        if(!from_voices_sequence || !to_voices_sequence){
            return false;
        }
        //check if the sequences contain valid values
        if(!check_voices(from_voices_sequence)){
            return false;
        }
        if(!check_voices(to_voices_sequence)){
            return false;
        }
        return true;
    }

    //checks to see if the voice passed into the rule
    //is in one of the sequence, if it is not, then the
    //rule is not relevant
    function voice_in_sequence (voice,voice_sequence){
        var sequence_contains_voice = true;
        for(var i = 0; i < voice_sequence.length; i++){
            var contains_voice = false;
            for(var j = 0; j < voice_sequence[i].length; j++){
                if(voice_sequence[i][j] == voice){
                    contains_voice = true;
                }
                sequence_contains_voice = 
                    sequence_contains_voice && contains_voice;
            }
        }
        return sequence_contains_voice;
    }

    //checks to see if a the note passed in has the correct interval between
    //it and one of the voices in the voices sequence
    function check_interval_sequence(rule_type,matrix,chord,voice,interval_sequence,
                from_voices_sequence,to_voices_sequence){
        
        function check_sequence(to_voices_sequence){
            //loops through all voices 
            for(var i = 0; i < to_voices_sequence.length; i++){
                var valid_sequence = true;
                //loop through the sequence in reverse, we do this in
                //reverse because we check the most recent values first
                for(var j = interval_sequence.length -1; j > -1; j--){

                    var chord_position = chord - (to_voices_sequence.length - 1 - j);
                    valid_sequence = 
                        check_interval(voice,to_voices_sequence[j][i],chord_position,
                                interval_sequence[j]);
                }
                if(valid_sequence)
                    return true;
            }
            return false;
        }
        //check the interval between two notes
        function check_interval(from_voice,to_voice,chord,intervals){
            
            //make sure the matrix positions being
            //checked have been assigned a value    
            if(!matrix[chord][from_voice])
                return rule_type;
            if(!matrix[chord][to_voice])
                return rule_type;

            //loop through all acceptable intervals
            for(var i = 0; i < intervals.length; i++){
                //calculate interval, and compare
                if(Math.abs(matrix[chord][to_voice] - 
                   matrix[chord][from_voice]) == intervals[i]){
                    return true;
                }
            }
            return false;
        }

        var valid_note = false;
        var from_voices_in_sequence = voice_in_sequence(voice, from_voices_sequence);
        var to_voices_in_sequence = voice_in_sequence(voice, to_voices_sequence);

        if(!from_voices_in_sequence && !to_voices_in_sequence){
            return rule_type;
        }

        if(from_voices_in_sequence)
            valid_note = check_sequence(to_voices_sequence);
        if(!valid_note && to_voices_in_sequence)
            valid_note = check_sequence(from_voices_sequence);
        
        return valid_note;
    }

    function check_note_sequence(rule_type,matrix,chord,voice,note_sequence,
                from_voices_sequence,to_voices_sequence){
        
        function check_sequence(){

            var valid_note = false;

            for(var i = note_sequence.length -1; i > -1; i--){
                valid_note = false;
                for(var j = 0; j < note_sequence[i].length; j++){
                    var chord_position = chord - (to_voices_sequence.length - 1 - j);
                    if(note_sequence[i][j] == matrix[chord_position][voice]){
                        valid_note = true;
                    }
                }
                if(!valid_note)
                    return valid_note;
            }
            return valid_note;
        }

        var from_voices_in_sequence = voice_in_sequence(voice, from_voices_sequence);
        var to_voices_in_sequence = voices_in_sequence(voice, to_voices_sequence);

        if(!from_voices_in_sequence && !to_voices_in_sequence)
            return rule_type;
        else
            return check_sequence();
        
    }

    function check_min_max_interval_sequence(rule_type,matrix,chord,voice,min_interval_sequence,
            max_interval_sequence){
 
        //should only check adjacent voices
        //make sure the note is within the valid ranges
        function check_min_max_interval(voice, chord, min_interval, max_interval){
            
            function check_interval(from_voice, to_voice){
                //make sure the matrix positions being
                //checked have been assigned a value
                if(!matrix[chord][to_voice])
                    return rule_type;
                if(!matrix[chord][from_voice])
                    return rule_type;

                var interval = matrix[chord][to_voice] - matrix[chord][from_voice];
                if(interval > max_interval)
                    return false;
                if(interval < min_interval)
                    return false;
                return true;
            }

            var valid_note = true;
            if(voice < matrix[0].length - 1)
                valid_note = valid_note && check_interval(voice,voice+1);
            if(voice > 0)
                valid_note = valid_note && check_interval(voice-1,voice);
            return valid_note;
        }

        var valid_note = true;
        for(var i = min_interval_sequence.length - 1; i > -1; i--){
            var chord_position = chord - (min_interval_sequence.length - 1 - i);
            valid_note = valid_note &&
                check_min_max_interval(voice,chord_position,
                    min_interval_sequence[i],max_interval_sequence[i]);
                
        }
        return valid_note;
    }

    function rule_template(rule_type, sequence_length,
        chord_sequence, interval_sequence, min_interval_sequence,
        max_interval_sequence, from_voices_sequence, to_voices_sequence,
        note_sequence){
    
        var identity_func = function(){ return function(){return true;} ;};

        if(!sequence_length)
            return identity_func;
        if(!valid_array(sequence_length, chord_sequence))
            return identity_func;
        if(!valid_array(sequence_length, interval_sequence))
            return identity_func;
        if(!valid_array(sequence_length, min_interval_sequence))
            return identity_func;
        if(!valid_array(sequence_length, max_interval_sequence))
            return identity_func;  
        if(!valid_array(sequence_length, from_voices_sequence))
            return identity_func;
        if(!valid_array(sequence_length, to_voices_sequence))
            return identity_func;
        if(!valid_array(sequence_length, note_sequence))
            return identity_func;

        return function(chord_progression){
            return function(matrix,current_chord,current_voice){

                var valid_note = true;

                if(!valid_voices(matrix,from_voices_sequence,to_voices_sequence)){
                    return valid_note;
                }
                if(current_chord < sequence_length-1)
                    return valid_note;
                if(!check_chord_progession(chord_progression,chord_sequence,current_chord))
                    return valid_note;
                if(interval_sequence){
                    valid_note = valid_note && check_interval_sequence(rule_type,matrix,current_chord,
                            current_voice,interval_sequence, from_voices_sequence,
                            to_voices_sequence);

                }
                if(note_sequence){
                    valid_note = valid_note && check_note_sequence(rule_type,matrix,current_chord,
                        current_voice,note_sequence,from_voices_sequence,to_voices_sequence);
                }
                if(min_interval_sequence && max_interval_sequence){
                    valid_note = valid_note && check_min_max_interval_sequence(rule_type,matrix,current_chord,
                            current_voice,min_interval_sequence,max_interval_sequence);
                }
 
                //console.log(valid_note == rule_type);

                if(valid_note == rule_type)
                    return true;
                else
                    return false;
            };
        };
    }


//************************************************************
//
//      MATRIX CREATOR
//
//************************************************************
    
    //voicing rules
    //  number of voices
    //  int voice number
    //  int low_note
    //  int high_note
    //  boolean voice_crossing
    //  boolean unison

    //chord progression
    //  array of strings

    //chord_list
    //  string : int array
    
    

    function create_matrix(voicing_rules,chord_progression,chord_list){
        
        var matrix = new Array();

        //foe each chord in the progression
        for(var i = 0; i < chord_progression.length; i++){
            
            //check if that chord is defined 
            if(chord_progression[i] in chord_list){
                //get all notes from that chord within the range of a given voice
                matrix[i] = find_valid_notes(voicing_rules,chord_list[chord_progression[i]]);
            }else{
                alert("error, chord "+chord_progression[i]+" not defined");
            }
        }
 
        function find_valid_notes(voicing_rules,chord){
            var valid_notes_array = new Array();
            //for each voice
            for(var i = 0; i < voicing_rules.length; i++){
                var voice = voicing_rules[i];
                var valid_notes = new Array();
                //for each note in the chord
                for(var j = 0; j < chord.length; j++){
                    var midi_note = chord[j]%12;
                    //while the note is a valid midi note
                    while(midi_note <= 127)
                    {
                        //check if the note is within range of the voice
                        if(midi_note >= voice['low_note'] && midi_note <= voice['high_note']){
                            valid_notes.push(midi_note);
                        }
                        midi_note += 12;
                   }
                }
                valid_notes_array[i] = (valid_notes);
            }
            return valid_notes_array;
        }

        return matrix;
    }


//************************************************************
//
//      CSP SOLVER
//
//************************************************************

    function evaluate_matrix(matrix,constraint_list){
        

        //array of a single number, allows them to be modified by reference
        var i = [0], j = [0];

        //make a deep copy of matrix
        var elimination_matrix = $.extend(true,[],matrix);

        var solution_matrix = createArray(matrix.length,matrix[0].length);
        
        var solution_complete = false, solution_may_exist = true;

        //intializes an array to a given size, works with any dimensions
        function createArray(length) {
            var arr = new Array(length || 0),
            i = length;
            if (arguments.length > 1) {
                var args = Array.prototype.slice.call(arguments, 1);
                while(i--) arr[length-1 - i] = createArray.apply(this, args);
            }
            return arr;
        }
        
        //check if variable's domain is non-empty
        function values_remain(m){
            if(m.length > 0) return true; else return false;
        }
        //pick a value from a variable's domain
        function pick_value(m){
            return m[Math.floor(Math.random()*m.length)];
        }
        //test the variable against all constraints
        function test_value(sm,cl,i,j){
            for(var k = 0; k < cl.length; k++){
                var constraint = cl[k];
                if(!constraint(sm,i,j)) return false;
            }
            return true;
        }
        //checks if a solution has be found
        function solution_found(m,i,j){
            if((i+1) >= m.length && (j+1) >= m[i].length)
                return true; else return false;
        }
        //remove value from a variable's domain
        function remove_value(sm,em,i,j){
            for(var k = 0; k < em[i][j].length; k++){
                if(sm[i][j] == em[i][j][k]) 
                    em[i][j].splice(k,1);
            }
        }
        //move to the next variable in the matrix
        function next_iteration(m,i,j){
            if(j[0] < m[i].length-1){
                j[0]++;
            }else{
                i[0]++;
                j[0] = 0;
            }
        }
        //step back and try a new value for a variable that has already
        //been assigned a value
        function backtrack(sm,em,m,i,j){
            sm[i[0]][j[0]] = undefined;
            em[i[0]][j[0]] =  $.extend(true,[],matrix[i[0]][j[0]]);
            if(j[0]>0) j[0]--; else{j[0] = m[i[0]].length-1; i[0]--;}
            if(i[0]>=0) return true; else return false;
            }
 
        //main control loop
        while(!solution_complete && solution_may_exist){
            if(values_remain(elimination_matrix[i[0]][j[0]])){
                solution_matrix[i[0]][j[0]] = pick_value(elimination_matrix[i[0]][j[0]]);
                remove_value(solution_matrix,elimination_matrix,i[0],j[0]);
                if(test_value(solution_matrix,constraint_list,i[0],j[0])){
                    solution_complete = solution_found(solution_matrix,i[0],j[0]);
                    next_iteration(matrix,i,j);
                }
            }else{
                solution_may_exist = backtrack(solution_matrix,elimination_matrix,matrix,i,j)
            }
        }
        return solution_matrix;
    }


//************************************************************
//
//      TEST CODE
//
//************************************************************
 

    function display_matrix_in_log(create_matrix){
        for(var i = 0; i < created_matrix[0].length; i++){
            var melodic_line = "";
            for(var j = 0; j < created_matrix.length; j++){
                var note = created_matrix[j][i][0];
                if(note < 10){
                    melodic_line += note + "   ";
                }else if(note < 100){
                    melodic_line += note + " ";
                }else{
                    melodic_line += note + "  ";
                }
            }
            console.log(melodic_line);
        }
    }
    function display_results_in_log(results){
        for(var i = results[0].length -1; i > -1; i--){
            var melodic_line = "";
            for(var j = 0; j < results.length; j++){
                var note = results[j][i];
                if(note < 10){
                    melodic_line += note + "   ";
                }else if(note < 100){
                    melodic_line += note + " ";
                }else{
                    melodic_line += note + "  ";
                }
            }
            console.log(melodic_line);
        }
    }

    function make_voice(ln,hn,vc,u){
        return {
            low_note:ln,
            high_note:hn,
            voice_crossing:vc,
            unison:u
        };
    }

//************************
// Testing create_matrix
//************************
    var voicing_rules = [make_voice(30,49,false,true),
                         make_voice(42,61,false,true),
                         make_voice(54,73,false,true),
                         make_voice(66,85,false,true)];
    
    chord_progression = ["I","IV","V","I"];
       
    var chord_list = {I:[0,4,7],IV:[5,9,0],V:[7,11,2]};

    created_matrix = create_matrix(voicing_rules,chord_progression,chord_list);
   
    //display_matrix_in_log(created_matrix);

//************************
// Testing csp_solver
//************************
    var constraint_list = new Array();
/*
    var matrix = [
                    [
                        [1,2],
                        [1,2]
                    ],
                    [
                        [1,2],
                        [1,2]
                    ]
                 ];

    constraint_list.push(function(){
        var temp = Math.floor(Math.random()*2);
        if(temp < 1)
            return true;
        else
            return false;
    });

    alert(evaluate_matrix(matrix,constraint_list).toString());  
*/

//************************
// Testing cpt_rules
//************************
 
    //TODO : check_interval_sequence working, start work on check_note_sequence

    var parallel_fifths = rule_template(false,2,null,
            [[6,7,18,19,30,31,42,43,54,55,66,67,78,79,90,91],
            [6,7,18,19,30,31,42,43,54,55,66,67,78,79,90,91]],
            null,null,[[0,1,2,3],[0,1,2,3]],[[0,1,2,3],[0,1,2,3]],null);

    var parallel_octaves = rule_template(false,2,null,
            [[12,24,36,48,60,72,84,96],
            [12,24,36,48,60,72,84,96]],
            null,null,[[0,1,2,3],[0,1,2,3]],[[0,1,2,3],[0,1,2,3]],null);

    var min_max_intervals = rule_template(true,1,null,null,[1],[13],[[0,1,2,3]],[[0,1,2,3]],null);
    
    constraint_list.push(parallel_fifths(chord_progression));
    constraint_list.push(parallel_octaves(chord_progression));
    constraint_list.push(min_max_intervals(chord_progression));

    display_results_in_log(evaluate_matrix(created_matrix,constraint_list));

    /*
    function rule_template(rule_type, sequence_length,
        chord_sequence, interval_sequence, min_interval_sequence,
        max_interval_sequence, from_voices_sequence, to_voices_sequence,
        from_note_sequence);
        
    return function(chord_progression){
            return function(matrix,current_chord,current_voice){

*/
