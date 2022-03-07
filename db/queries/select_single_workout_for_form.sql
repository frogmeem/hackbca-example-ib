SELECT 
	workout.workout_id as workout_id, 
    workout_name, 
    workout_type, 
    DATE_FORMAT(workout_mdy, '%Y-%m-%d') as workout_mdy, 
    workout_length
FROM 
	workout
WHERE
   	workout.workout_id = ?
LIMIT 1