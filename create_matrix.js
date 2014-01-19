
function create_matrix(voicing_rules,chord_progression,chord_list){
    
    var matrix = new Array();

    //for each chord in the progression
    for(var i = 0; i < chord_progression.length; i++){
        
        //check if that chord is defined 
        if(chord_progression[i] in chord_list){
            //get all notes from that chord within the range of a given voice
            matrix[i] = find_valid_notes(voicing_rules,chord_list[chord_progression[i]]);
        }else{
            console.log("error : chord "+chord_progression[i]+" not defined");
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
