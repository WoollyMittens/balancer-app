// balancer.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// initialise the components
	Balancer.prototype.init = function(model) {

		// properties
		this.settings = new this.Settings(this, model);
		this.graph = new this.Graph(this, model);
		this.log = new this.Log(this, model);

		// methods
		this.update = function() {
			// update each sub-class
			this.settings.update();
			this.graph.update();
			this.log.update();
		};

		this.restoreState = function() {
			// load the previous state from localstorage
			var saved = localStorage.getItem("state");
			// if it seems intact
			if (saved) {
				// parse the json
				saved = JSON.parse(saved);
				// transplant transcient values
				saved.root = model.root;
				saved.start = new Date(model.start);
				saved.focus = null;
				saved.end = new Date(model.end);
				// replace the model with the imported state
				model = saved;
			}
			// redraw the app
			this.update();
		};

		this.saveState = function() {
			// save the state of the app as json
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

		this.resetTimeline = function(date) {
			// TODO: remove anything older than the date from the timeline
		};

		// events
		this.restoreState();

	};

})();
