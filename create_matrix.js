
$(document).ready(function(){
    
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
    
    function make_voice(ln,hn,vc,u){
        return {
            low_note:ln,
            high_note:hn,
            voice_crossing:vc,
            unison:u
        };
    }

    var voicing_rules = [make_voice(30,49,false,true),
                         make_voice(42,61,false,true),
                         make_voice(54,73,false,true),
                         make_voice(66,85,false,true)];
    
    chord_progression = ["I","IV","V","I"];
    
    function make_chord_list(){
        this.I=[0,4,7];
        this.IV=[5,9,0];
        this.V=[7,11,2];
    }
    var chord_list = {I:[0,4,7],IV:[5,9,0],V:[7,11,2]};

    alert(create_matrix(voicing_rules,chord_progression,chord_list)[0][0]);

    function create_matrix(voicing_rules,chord_progression,chord_list){
        
        var matrix = new Array();

        //foe each chord in the progression
        for(var i = 0; i < chord_progression.length; i++){
            
            //check if that chord is defined 
            if(chord_progression[i] in chord_list){
                //get all notes from that chord within the range of a given voice
                matrix[i] = find_valid_notes(voicing_rules,chord_list[chord_progression[i]]);
            }else{
                alert("error chord "+chord_progression[i]+" not defined");
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
});
