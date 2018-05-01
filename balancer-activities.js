// balancer-activities.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Activities = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-log");
		this.activityInput = this.element.querySelector(".balancer-log-activity input[name=activity]");

		// methods
		this.update = function() {
			// redraw the components
			this.redraw();
		};

		this.redraw = function() {
			// update the activity level
			this.activityInput.min = model.minActivity;
			this.activityInput.max = model.maxActivity;
			this.activityInput.value = parent.getTimeline(parent.getTimeStamp()).activity;
		};

		this.onChangeActivity = function(evt) {
			// set the activity level for this time
			parent.setTimeline(parent.getTimeStamp(), {activity: parseInt(this.activityInput.value)});
		};

		// events
		this.activityInput.addEventListener('change', this.onChangeActivity.bind(this));

	};

})();
