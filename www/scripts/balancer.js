// balancer.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// initialise the components
	Balancer.prototype.init = function(model) {

		// properties
		this.model = model;

		// methods
		this.update = function() {
			// update the clock
			this.updateTimespan();
			// update the timespan
			this.resetTimespan();
			// update each sub-class
			this.settings.update();
			this.graph.update();
			this.log.update();
			this.presets.update();
			this.about.update();
			this.nav.update();
		};

		this.restoreState = function(backup) {
			// load the previous state from localstorage
			var saved = backup || localStorage.getItem("state");
			// if it seems intact
			if (saved) {
				// parse the json
				saved = JSON.parse(saved);
				// override the transcient values
				saved.root = model.root;
				saved.start = new Date(model.start);
				saved.focus = null;
				saved.end = new Date(model.end);
				// update the model with the imported state
				Object.keys(saved).map(function(key) {
					model[key] = saved[key];
				});
			}
			// redraw the app
			this.update();
		};

		this.saveState = function() {
			// save the state of the app as json
			console.log("saveState", JSON.stringify(model));
			localStorage.setItem("state", JSON.stringify(model));
		};

		this.getTimeline = function(date) {
			// create a key to for the timeline object
			var key = date.getFullYear() + "_" + (date.getMonth() + 1) + "_"	+ date.getDate() + "_" + date.getHours();
			// retrieve the key or an empty dummy
			return model.timeline[key] || {activity: 1, diet: []};
		};

		this.setTimeline = function(date, obj) {
			// create a key to for the timeline object
			var key = date.getFullYear() + "_" + (date.getMonth() + 1) + "_"	+ date.getDate() + "_" + date.getHours();
			// merge the changes into the timeline object
			model.timeline[key] = Object.assign(this.getTimeline(date), obj);
			// update the app, since the model has changed
			this.update();
			// save the updated model
			this.saveState();
		};

		this.getEarliest = function() {
			// find the earliest history key
			var fragments, current, earliest = new Date();
			Object.keys(model.timeline).map(function(key) {
				fragments = key.split("_");
				current = new Date(parseInt(fragments[0]), parseInt(fragments[1]) - 1, parseInt(fragments[2]));
				earliest = (current < earliest) ? current : earliest;
			});
			return earliest;
		};

		this.updateTimespan = function() {
			// keep the current day active unless the focus is elsewhere
			if (!model.focus && model.end.getDate() !== new Date().getDate()) {
				model.end = new Date();
			}
		};

		this.resetTimespan = function() {
			// calculate the new start date
			var start = new Date(model.end.getTime() - (parseInt(model.timespan) * 1000 * 60 * 60 * 24));
			// limit the start date to recorded history
			var earliest = this.getEarliest();
			start = Math.max(start, earliest);
			// update the start date
			model.start = start;
		};

		// classes
		this.settings = new this.Settings(this, this.model);
		this.graph = new this.Graph(this, this.model);
		this.log = new this.Log(this, this.model);
		this.presets = new this.Presets(this, this.model);
		this.about = new this.About(this, this.model);
		this.nav = new this.Nav(this, this.model);

		// events
		this.refreshCycle = setInterval(this.updateTimespan.bind(this), 1000 * 60);
		this.restoreState();

	};

})();
