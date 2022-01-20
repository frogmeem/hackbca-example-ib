var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

// const events_data = require('../data/dummy_events_v2')
const db = require("../db/db");

const select_all_events_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_all_events.sql"), "utf-8")

/* GET events page. */
router.get('/', async function(req, res, next) {
  try {
    let events_data = await db.queryPromise(select_all_events_sql);
    res.render('events', { title: 'Events', style: "tables", events : events_data});
  } catch (err) {
    next(err);
  }

});


const select_event_types_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_event_types.sql"), "utf-8")
const select_event_locations_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_event_locations.sql"), "utf-8")

router.get('/create', async function(req, res, next) {
  try {
    let event_types = await db.queryPromise(select_event_types_sql);
    let event_locations = await db.queryPromise(select_event_locations_sql);
    
    res.render('eventform', {title: 'Create New Event', 
                              style: "newevent", 
                              event_types: event_types,
                            event_locations: event_locations})
  } catch(err) {
    next(err);
  }

})

const select_single_event_for_form_sql = fs.readFileSync(path.join(__dirname, "../db/queries/select_single_event_for_form.sql"), "utf-8")

router.get('/modify/:event_id', async function(req, res, next) {
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
  let event_id = req.params.event_id;

  try {
    let event_types = await db.queryPromise(select_event_types_sql);
    let event_locations = await db.queryPromise(select_event_locations_sql);
    let results = await db.queryPromise(select_single_event_for_form_sql, [event_id]);
    let event = results[0];
    res.render('eventform', {title: 'Modify Event', 
                              style: "newevent", 
                              event_types: event_types,
                              event: event,
                            event_locations: event_locations})
  } catch(err) {
    next(err);
  }


})

const select_single_event_sql = fs.readFileSync(path.join(__dirname,"../db/queries/select_single_event.sql"), "utf-8")

router.get('/:event_id', async function(req, res, next) {
  let event_id = req.params.event_id;
  let events_data = await db.queryPromise(select_single_event_sql, [event_id]);
  let event = events_data[0];

  if (event === undefined ){
    next(); //pass along, send 404
  }
  else {
    res.render('event', { title: event.event_name, style: "tables", event: event});
  }
});

const insert_event_sql = fs.readFileSync(path.join(__dirname,"../db/queries/insert_event.sql"), "utf-8")
const update_event_sql = fs.readFileSync(path.join(__dirname,"../db/queries/update_event.sql"), "utf-8")

router.post("/", async function(req, res, next) {
  try {
    
    let new_event_data = req.body;
    // Check the value of the hidden input for event_id
    if (new_event_data.event_id === "0") {

      // INSERT the new event data into our database
      let results = await db.queryPromise(insert_event_sql, [
        new_event_data.event_name,
        new_event_data.event_type,
        new_event_data.event_location,
        `${new_event_data.event_date} ${new_event_data.event_time}`,
        new_event_data.event_duration,
        new_event_data.event_description
      ])
      
      // Get the id of the newly inserted row
      let event_id = results.insertId;

      res.redirect(`/events/${event_id}`);
    } else {
      // UPDATE the existing event data in our database
      let results = await db.queryPromise(update_event_sql, [
        new_event_data.event_name,
        new_event_data.event_location,
        new_event_data.event_type,
        `${new_event_data.event_date} ${new_event_data.event_time}`,
        new_event_data.event_duration,
        new_event_data.event_description,
        new_event_data.event_id
      ]);

      res.redirect(`/events/${new_event_data.event_id}`);

    }


  } catch (err) {
    next(err);
  }

})

module.exports = router;
