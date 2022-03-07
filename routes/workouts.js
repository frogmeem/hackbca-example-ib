var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

// const events_data = require('../data/dummy_events_v2')
const db = require("../db/db");

const select_all_workouts_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_all_workouts.sql"), "utf-8")

/* GET events page. */
router.get('/', async function(req, res, next) {
  try {
    let workouts_data = await db.queryPromise(select_all_workouts_sql);
    res.render('workouts', { title: 'Workouts', style: "tables", workouts : workouts_data});
  } catch (err) {
    next(err);
  }

});



router.get('/create', async function(req, res, next) {
  try {
    let workout_types = await db.queryPromise(select_workout_types_sql);
    
    res.render('workoutform', {title: 'Create New Workout', 
                              style: "newworkout", 
                              workout_types: workout_types,
                            workout_locations: workout_locations})
  } catch(err) {
    next(err);
  }

})

const select_single_workout_for_form_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_single_workout_for_form.sql"), "utf-8")

router.get('/modify/:workout_id', async function(req, res, next) {
  // let event;
  // for(int i = 0; i < events_data.length; i++) {
  //   if (events_data[i].event_id === event_id)
  //     event = events_data[i];
  // }
  //alternatively
  // let event = events_data.find(function(evt){ return evt.event_id == event_id});
  // if (event === undefined ){
  //   next(); //pass along, send 404
  // }
  // else {
  //   res.render('eventform', { title: 'Modify Event', style: "newevent", event: event});
  // }
  let workout_id = req.params.workout_id;

  try {
    let workout_types = await db.queryPromise(select_workout_types_sql);
    let workout_locations = await db.queryPromise(select_workout_locations_sql);
    let results = await db.queryPromise(select_single_workout_for_form_sql, [workout_id]);
    let workout = results[0];
    res.render('workoutform', {title: 'Modify Workout', 
                              style: "newworkout", 
                              workout_types: workout_types,
                              workout: workout,
                            workout_locations: workout_locations})
  } catch(err) {
    next(err);
  }


})

const select_single_workout_sql = fs.readFileSync(path.join(__dirname,"../db/queries/select_single_workout.sql"), "utf-8")

router.get('/:workout_id', async function(req, res, next) {
  let workout_id = req.params.workout_id;
  let workouts_data = await db.queryPromise(select_single_workout_sql, [workout_id]);
  let workout = workouts_data[0];

  if (workout === undefined ){
    next(); //pass along, send 404
  }
  else {
    res.render('workout', { title: workout.workout_name, style: "tables", workout: workout});
  }
});

const insert_workout_sql = fs.readFileSync(path.join(__dirname,"../db/queries/insert_workout.sql"), "utf-8")
const update_workout_sql = fs.readFileSync(path.join(__dirname,"../db/queries/update_workout.sql"), "utf-8")

router.post("/", async function(req, res, next) {
  try {
    
    let new_workout_data = req.body;
    // Check the value of the hidden input for workout_id
    if (new_workout_data.workout_id === "0") {

      // INSERT the new workout data into our database
      let results = await db.queryPromise(insert_workout_sql, [
        new_workout_data.workout_name,
        new_workout_data.workout_type,
        `${new_workout_data.workout_date} ${new_workout_data.workout_time}`,
      ])
      
      // Get the id of the newly inserted row
      let workout_id = results.insertId;

      res.redirect(`/workouts/${workout_id}`);
    } else {
      // UPDATE the existing workout data in our database
      let results = await db.queryPromise(update_workout_sql, [
        new_workout_data.workout_name,
        new_workout_data.workout_type,
        `${new_workout_data.workout_date} ${new_workout_data.workout_time}`,
        new_workout_data.workout_id
      ]);

      res.redirect(`/workouts/${new_workout_data.workout_id}`);

    }


  } catch (err) {
    next(err);
  }

})

let delete_workout_sql = `
DELETE
FROM workout
WHERE 
    workout_id = ?
`
router.get("/:workout_id/delete", async function(req, res, next) {
  try {
    let workout_id = req.params.workout_id;

    let results = await db.queryPromise(delete_workout_sql, [workout_id])
  
    res.redirect("/workouts");
  } catch(err) {
    next(err);
  }
  

});

module.exports = router;
