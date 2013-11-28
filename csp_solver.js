
//$(document).ready(function(){
//test code
/*
    var constraint_list = new Array();

    constraint_list.push(function(){
            var temp = Math.floor(Math.random()*2);
            if(temp < 1)
                return true;
            else
                return false;
        });

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


    alert(evaluate_matrix(matrix,constraint_list).toString());
    
*/
    function evaluate_matrix(env,matrix){
        

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
        function test_value(env,sm,i,j){
            if(!env['constraint_lookup_by_position'][i]) return true;
            var constraints = 
                env['constraint_lookup_by_position'][i][j];
            var constraint_lookup = 
                env['constraint_lookup'];
            //console.log("testing value for position : "+i+", "+j);
            for(var k = 0; k < constraints.length; k++){
                var constraint = constraint_lookup[constraints[k]];
                if(!constraint(sm)) return false;
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
            console.log("values left at position "+i+", "+j+"  : "+em[i][j].length);
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
            console.log("backtrack ("+i[0]+", "+j[0]+")"); 
            env['backtrack'].push([i[0],j[0]]);
            sm[i[0]][j[0]] = undefined;
            em[i[0]][j[0]] =  $.extend(true,[],m[i[0]][j[0]]);
            if(j[0]>0) j[0]--; else{j[0] = m[i[0]].length-1; i[0]--;}
            if(i[0]>=0) return true; else return false;
        }
 
        //main control loop
        while(!solution_complete && solution_may_exist){
            if(values_remain(elimination_matrix[i[0]][j[0]])){
                solution_matrix[i[0]][j[0]] = pick_value(elimination_matrix[i[0]][j[0]]);
                remove_value(solution_matrix,elimination_matrix,i[0],j[0]);
                if(test_value(env,solution_matrix,i[0],j[0])){
                    solution_complete = solution_found(solution_matrix,i[0],j[0]);
                    next_iteration(matrix,i,j);
                }
            }else{
                solution_may_exist = backtrack(solution_matrix,elimination_matrix,matrix,i,j)
            }
        }
        return solution_matrix;
    }
//});

