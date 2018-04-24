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
			// TODO: restore the state of the app
		};

		this.saveState = function() {
			// TODO: save the state of the app
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
		};

		this.resetTimeline = function(date) {
			// TODO: remove anything older than the date from the timeline
		};

		// events
		this.update();
	};

})();
