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
		this.addMealForm = this.element.querySelector(".balancer-log-meal");
		this.pickMealButton = this.element.querySelector(".balancer-log-meal button[name=icon]");
		this.labelInput = this.element.querySelector(".balancer-log-meal input[name=label]");
		this.valueInput = this.element.querySelector(".balancer-log-meal input[name=value]");
		this.addMealButton = this.element.querySelector(".balancer-log-meal button[name=add]");
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
			// reset the input fields
			this.pickMealButton.className = "balancer-preset-plate_1";
			this.labelInput.value = "";
			this.valueInput.value = "";
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
				presetButton.name = "icon";
				presetButton.innerHTML = model.presets[a].description;
				presetButton.className = "balancer-preset-" + model.presets[a].icon;
				presetButton.addEventListener("click", this.onFillPresetMeal.bind(this, model.presets[a]));
				presetItem.appendChild(presetButton);
				this.presetMeals.appendChild(presetItem);
			}
		};

		this.onCheckValues = function() {
			// check the values
			var hasFailed = (
				isNaN(parseInt(parent.timeInput.value))
				|| isNaN(parseInt(parent.dateInput.value))
				|| isNaN(parseInt(this.valueInput.value))
				|| this.labelInput.value === ""
			);
			// disable the button, if any of the values is invalid
			this.addMealButton.disabled = hasFailed;
			// return the value
			return !hasFailed;
		};

		this.onOpenPicker = function(evt) {
			// cancel the submit
			if (evt) evt.preventDefault();
			// show the list of icons
			this.presetMeals.className += " balancer-log-meals-open";
		};

		this.onClosePicker = function(evt) {
			// cancel the submit
			if (evt) evt.preventDefault();
			// hide the list of icons
			this.presetMeals.className = this.presetMeals.className.replace(/ balancer-log-meals-open/g, "");
		};

		this.onAddMeal = function(evt) {
			// cancel the click
			evt.preventDefault();
			// if the vlaues seem okay
			if (this.onCheckValues()) {
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
			}
		};

		this.onFillPresetMeal = function(preset, evt) {
			// cancel the click
			evt.preventDefault();
			// implement the values of the preset
			this.labelInput.value = preset.description;
			this.valueInput.value = preset.value;
			// set the icon
			this.pickMealButton.className = "balancer-preset-" + preset.icon;
			// close the picker
			this.onClosePicker();
			// check the input fields
			this.onCheckValues();
		};

		// events
		this.labelInput.addEventListener('change', this.onCheckValues.bind(this));
		this.labelInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('change', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.pickMealButton.addEventListener("click", this.onOpenPicker.bind(this));
		this.addMealButton.addEventListener('click', this.onAddMeal.bind(this));
		this.addMealForm.addEventListener("submit", this.onAddMeal.bind(this));

	};

})();
