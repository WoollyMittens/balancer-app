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
		this.diet = new this.Diet(this, model);

		// methods
		this.update = function() {
			// update each sub-class
			this.settings.update();
			this.graph.update();
			this.diet.update();
		};

		this.restoreState = function() {
			// load the previous state from localstorage
			var state = localStorage.getItem("state");
			// if it seems intact
			if (state) {
				// parse the json
				state = JSON.parse(state);
				// transplant transcient values
				state.root = model.root;
				state.start = model.start;
				state.end = model.end;
				// replace the model with the imported state
				model = state;
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
			// retrieve the key or an empty dummy {label: "Lorem ipsum", value: 100}, {label: "Dolor Sit Amet", value: 200}
			return model.timeline[key] || {activity: 0, diet: []};
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
