UPDATE workout
SET 
    workout_name = ?,
    workout_type = ?,
    workout_mdy = STR_TO_DATE(?, "%m-%d-%Y %h:%i %p"),
    workout_length = ?
WHERE
    workout_id = ?