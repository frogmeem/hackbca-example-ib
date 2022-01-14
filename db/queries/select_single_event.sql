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