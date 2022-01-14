var express = require('express');
var router = express.Router();

// const events_data = require('../data/dummy_events_v2')
const db = require("../db/db");

const select_all_events_sql = `
SELECT 
	event.event_id as event_id, 
    event_name, 
    event_location, 
    event_type, 
    DATE_FORMAT(event_dt, '%Y-%m-%d') as event_date_ymd, 
    DATE_FORMAT(event_dt, '%b %d (%a)') as event_date, 
    DATE_FORMAT(event_dt, '%l:%i %p') as event_time, 
    event_duration, 
    0 as event_interest
FROM 
	event, event_location, event_type
WHERE
    event.event_location_id = event_location.event_location_id
    and event.event_type_id = event_type.event_type_id
ORDER BY event_dt
`

/* GET events page. */
router.get('/', async function(req, res, next) {
  try {
    let events_data = await db.queryPromise(select_all_events_sql);
    res.render('events', { title: 'Events', style: "tables", events : events_data});
  } catch (err) {
    next(err);
  }

});

//npm install mysql dotenv

router.get('/create', function(req, res, next) {
  res.render('eventform', {title: 'Create New Event', style: "newevent"})
})

router.get('/modify/:event_id', function(req, res, next) {
  let event_id = req.params.event_id;
  // let event;
  // for(int i = 0; i < events_data.length; i++) {
  //   if (events_data[i].event_id === event_id)
  //     event = events_data[i];
  // }
  //alternatively
  let event = events_data.find(function(evt){ return evt.event_id == event_id});
  if (event === undefined ){
    next(); //pass along, send 404
  }
  else {
    res.render('eventform', { title: 'Modify Event', style: "newevent", event: event});
  }

})

const select_single_event_sql = `
SELECT 
	event.event_id as event_id, 
    event_name, 
    event_location, 
    event_type, 
    DATE_FORMAT(event_dt, '%Y-%m-%d') as event_date_ymd, 
    DATE_FORMAT(event_dt, '%b %d (%a)') as event_date, 
    DATE_FORMAT(event_dt, '%l:%i %p') as event_time, 
    event_duration, 
    0 as event_interest,
    event_description
FROM 
	event, event_location, event_type
WHERE
   	event.event_id = ?
    and event.event_location_id = event_location.event_location_id
    and event.event_type_id = event_type.event_type_id
ORDER BY event_dt
LIMIT 1
`

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

module.exports = router;
