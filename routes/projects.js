var express = require('express');
var router = express.Router();

const projects_data = require('../data/dummy_projects')

/* GET projects page. */
router.get('/', function(req, res, next) {
  res.render('projects', { title: 'projects', style: "tables", projects : projects_data});
});

router.get('/create', function(req, res, next) {
  res.render('projectform', {title: 'Create New project', style: "newproject"})
})

router.get('/modify/:project_id', function(req, res, next) {
  let project_id = req.params.project_id;
  // let project;
  // for(int i = 0; i < projects_data.length; i++) {
  //   if (projects_data[i].project_id === project_id)
  //     project = projects_data[i];
  // }
  //alternatively
  let project = projects_data.find(function(proj){ return proj.project_id == project_id});
  if (project === undefined ){
    next(); //pass along, send 404
  }
  else {
    res.render('projectform', { title: 'Modify project', style: "newproject", project: project});
  }

})

router.get('/:project_id', function(req, res, next) {
  let project_id = req.params.project_id;
  // let project;
  // for(int i = 0; i < projects_data.length; i++) {
  //   if (projects_data[i].project_id === project_id)
  //     project = projects_data[i];
  // }
  //alternatively
  let project = projects_data.find(function(proj){ return proj.project_id == project_id});
  if (project === undefined ){
    next(); //pass along, send 404
  }
  else {
    res.render('project', { title: project.project_name, style: "tables", project: project});
  }
});

module.exports = router;
