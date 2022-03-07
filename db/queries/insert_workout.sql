INSERT INTO workout
    (workout_name,
    workout_type,
    workout_mdy,
    workout_length)
VALUES
    (?,
    ?,
    STR_TO_DATE(?, '%m-%d-%Y %h:%i %p'),
    ?,)