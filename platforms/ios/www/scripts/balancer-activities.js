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
		this.activityLabels = this.element.querySelectorAll(".balancer-log-activity span");

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

		this.onPresetActivity = function(value) {
			// preset the value
			this.activityInput.value = value;
			// trigger the change
			this.onChangeActivity();
		};

		// events
		this.activityInput.addEventListener("change", this.onChangeActivity.bind(this));
		this.activityLabels[0].addEventListener("click", this.onPresetActivity.bind(this, model.minActivity));
		this.activityLabels[1].addEventListener("click", this.onPresetActivity.bind(this, (model.maxActivity - model.minActivity) / 2 + model.minActivity));
		this.activityLabels[2].addEventListener("click", this.onPresetActivity.bind(this, model.maxActivity));

	};

})();
