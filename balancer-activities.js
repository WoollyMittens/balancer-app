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
		this.presetActivities = this.element.querySelector(".balancer-log-activities");

		// methods
		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the activities presets
			this.presetActivities.innerHTML = "";
		};

		this.redraw = function() {
			// update the activity level
			this.activityInput.min = model.minActivity;
			this.activityInput.max = model.maxActivity;
			this.activityInput.value = parent.getTimeline(parent.getTimeStamp()).activity;
			// fill the presets with options
			this.drawPresetActivities();
		};

		this.drawPresetActivities = function() {
			// add the presets to the list
			var presetItem, presetButton;
			for (var a = 0, b = model.activities.length; a < b; a += 1) {
				// construct the preset item
				presetItem = document.createElement("li");
				presetButton = document.createElement("button");
				presetButton.innerHTML = model.activities[a].description;
				presetButton.className = "balancer-preset-" + model.activities[a].icon;
				presetButton.addEventListener("click", this.onFillPresetActivity.bind(this, model.activities[a]));
				presetItem.appendChild(presetButton);
				this.presetActivities.appendChild(presetItem);
			}
		};

		this.onChangeActivity = function(evt) {
			// set the activity level for this time
			parent.setTimeline(parent.getTimeStamp(), {activity: parseInt(this.activityInput.value)});
		};

		this.onFillPresetActivity = function(preset, evt) {
			// cancel the click
			evt.preventDefault();
			// implement the values of the preset
			this.activityInput.value = preset.activity;
			// check the input fields
			this.onChangeActivity();
		};

		// events
		this.activityInput.addEventListener('change', this.onChangeActivity.bind(this));

	};

})();
