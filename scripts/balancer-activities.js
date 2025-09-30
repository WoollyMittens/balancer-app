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
		this.addActivityForm = this.element.querySelector(".balancer-log-activity");
		this.activityInput = this.element.querySelector(".balancer-log-activity input[name=activity]");
		this.activityLabels = this.element.querySelectorAll(".balancer-log-activity .balancer-preset");

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
			parent.setTimeline(parent.getTimeStamp(), {activity: this.activityInput.value});
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
		this.activityLabels[1].addEventListener("click", this.onPresetActivity.bind(this, model.maxActivity));
		this.addActivityForm.addEventListener("submit", this.onChangeActivity.bind(this));

	};

})();
