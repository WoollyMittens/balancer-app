// balancer-meals.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Meals = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-log");
		this.hourValue = this.element.querySelector(".balancer-log-meal b");
		this.labelInput = this.element.querySelector(".balancer-log-meal input[name=label]");
		this.valueInput = this.element.querySelector(".balancer-log-meal input[name=value]");
		this.addMealButton = this.element.querySelector(".balancer-log-meal button");
		this.presetMeals = this.element.querySelector(".balancer-log-meals");

		// methods
		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the meals presets
			this.presetMeals.innerHTML = "";
		};

		this.redraw = function() {
			// fill the presets with options
			this.drawPresetMeals();
			// check the input fields
			this.onCheckValues();
		};

		this.drawPresetMeals = function() {
			// add the presets to the list
			var presetItem, presetButton;
			for (var a = 0, b = model.presets.length; a < b; a += 1) {
				// construct the preset item
				presetItem = document.createElement("li");
				presetButton = document.createElement("button");
				presetButton.innerHTML = model.presets[a].description;
				presetButton.className = "balancer-preset-" + model.presets[a].icon;
				presetButton.addEventListener("click", this.onFillPresetMeal.bind(this, model.presets[a]));
				presetItem.appendChild(presetButton);
				this.presetMeals.appendChild(presetItem);
			}
		};

		this.onCheckValues = function() {
			// update the hour value
			var timeValue = parseInt(parent.timeInput.value.split(":")[0]);
			this.hourValue.innerHTML = !isNaN(timeValue) ? new Date(new Date().setHours(timeValue)).toLocaleString([], {hour: "numeric", hour12: true}).replace(/\s/g, "") : "";
			// disable the button, if any of the values is invalid
			this.addMealButton.disabled = (
				isNaN(parseInt(parent.timeInput.value))
				|| isNaN(parseInt(parent.dateInput.value))
				|| isNaN(parseInt(this.valueInput.value))
				|| this.labelInput.value === ""
			);
		};

		this.onAddMeal = function(evt) {
			// cancel the click
			evt.preventDefault();
			// figure out the time stamp
			var date = parent.getTimeStamp();
			// retrieve the timeline entry
			var timelineEntry = parent.getTimeline(date);
			// add this meal at the given time
			timelineEntry.diet.push({
				label: this.labelInput.value,
				value: parseInt(this.valueInput.value)
			});
			// store the timeline entry
			parent.setTimeline(date, timelineEntry);
			// return to the history list
			parent.onLogOpened("history");
		};

		this.onFillPresetMeal = function(preset, evt) {
			// cancel the click
			evt.preventDefault();
			// implement the values of the preset
			this.labelInput.value = preset.description;
			this.valueInput.value = preset.value;
			// check the input fields
			this.onCheckValues();
		};

		// events
		this.labelInput.addEventListener('change', this.onCheckValues.bind(this));
		this.labelInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('change', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.addMealButton.addEventListener('click', this.onAddMeal.bind(this));

	};

})();
