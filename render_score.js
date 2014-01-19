function render_score(matrix){
    var progression_length = matrix.length;
    var num_voices = matrix[0].length;
    var melodic_lines = [];
    var voices = [];

    for(var i = 0; i < num_voices; i++){
        var notes = [];
        for(var j = 0; j < progression_length; j++){

            notes[j] = 
                new Vex.Flow.StaveNote({ 
                    keys: [convert_midi_value_to_note(matrix[j][i])],
                    duration: "q" });
        }
        melodic_lines[i] = notes;
    }

    for(var i = 0; i < num_voices; i++){
        // Create a voice in 4/4
        voices[i] = new Vex.Flow.Voice({
          num_beats: progression_length,
          beat_value: 4,
          resolution: Vex.Flow.RESOLUTION
        });
        voices[i].addTickables(melodic_lines[i]);
    }

    //draw on canvas
    var canvas = $("canvas")[0];
    var renderer = new Vex.Flow.Renderer(canvas,
      Vex.Flow.Renderer.Backends.CANVAS);

    var ctx = renderer.getContext();
    var treble_stave = new Vex.Flow.Stave(10, 100, 500);
    treble_stave.addClef("treble").setContext(ctx).draw();
    //var bass__stave = new Vex.Flow.Stave(10, 0, 500);
    //treble_stave.addClef("treble").setContext(ctx).draw();


    for(var i = 0; i < num_voices; i++){
        // Format and justify the notes to 500 pixels
        var formatter = new Vex.Flow.Formatter().
        joinVoices([voices[i]]).format([voices[i]], 500);
        
        // Render voice
        voices[i].draw(ctx, treble_stave);
    }

/*
    // Create the notes
    var notes = [
        // A quarter-note C.
        new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q" }),

        // A quarter-note D.
        new Vex.Flow.StaveNote({ keys: ["d/4"], duration: "q" }),

        // A quarter-note rest. Note that the key (b/4) specifies the vertical
        // position of the rest.
        new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "qr" }),

        // A C-Major chord.
        new Vex.Flow.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
    ];

    // Add notes to voice
    voice.addTickables(notes);

    // Format and justify the notes to 500 pixels
    var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

    // Render voice
    voice.draw(ctx, stave);

    alert(convert_midi_value_to_note(36));
*/
    function convert_midi_value_to_note(midi_value){
        var octave = Math.floor(midi_value / 12);
        var note = midi_value % 12;

        switch(note){
            case 0:
                return create_note_string("c");
                break;
            case 1:
                return create_note_string("c#");
                break;
            case 2:
                return create_note_string("d");
                break;
            case 3:
                return create_note_string("d#");
                break;
            case 4:
                return create_note_string("e");
                break;
            case 5:
                return create_note_string("f");
                break;
            case 6:
                return create_note_string("f#");
                break;
            case 7:
                return create_note_string("g");
                break;
            case 8:
                return create_note_string("g#");
                break;
            case 9:
                return create_note_string("a");
                break;
            case 10:
                return create_note_string("a#");
                break;
            case 11:
                return create_note_string("b");
                break; 
        } 
        function create_note_string(note){
            return note+"/"+octave;
        }
    }    
}


