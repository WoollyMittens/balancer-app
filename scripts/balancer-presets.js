// balancer-preset.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Presets = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-presets");
		this.iconButton = this.element.querySelector(".balancer-presets-meal button[name=icon]");
		this.descriptionInput = this.element.querySelector(".balancer-presets-meal input[name=description]");
		this.valueInput = this.element.querySelector(".balancer-presets-meal input[name=value]");
		this.addButton = this.element.querySelector(".balancer-presets-meal button[name=add]");
		this.iconPicker = this.element.querySelector(".balancer-presets-picker");
		this.presetsTable = this.element.querySelector(".balancer-presets-meals");

		// methods
		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// close the icon picker
			this.closeIconPicker();
			// clear the history list
			this.presetsTable.innerHTML = "";
		};

		this.redraw = function() {
			// fill the list with presets
			var _this = this, presetRow, presetIcon, presetDescription, presetValue, presetRemove, presetButton;
			model.presets.map(function(preset) {
				// construct a row for this preset
				presetRow = document.createElement("tr");
				presetIcon = document.createElement("th");
				presetIcon.innerHTML = "<span class=\"balancer-preset balancer-preset-" + preset.icon + "\"></span>";
				presetDescription = document.createElement("td");
				presetDescription.innerHTML = preset.description;
				presetValue = document.createElement("td");
				presetValue.innerHTML = preset.value + " kJ";
				presetRemove = document.createElement("td");
				presetButton = document.createElement("button");
				presetButton.name = "remove";
				presetButton.innerHTML = "Remove";
				presetButton.addEventListener("click", _this.removePreset.bind(_this, preset));
				// add a row for this preset to the table
				presetRow.appendChild(presetIcon);
				presetRow.appendChild(presetDescription);
				presetRow.appendChild(presetValue);
				presetRemove.appendChild(presetButton);
				presetRow.appendChild(presetRemove);
				_this.presetsTable.appendChild(presetRow);
			});
		};

		this.removePreset = function(remove, evt) {
			// cancel the click
			evt.preventDefault();
			// remove this preset from the model
			var presets = [];
			model.presets.map(function(preset) {
				if (preset !== remove) presets.push(preset);
			});
			model.presets = presets;
			// redraw the view
			parent.saveState();
			parent.update();
		};

		this.addPreset = function(evt) {
			// cancel the click
			evt.preventDefault();
			// add the preset to the front of the list
			model.presets.reverse();
			model.presets.push({
				icon: this.iconButton.className.replace(/balancer-preset-/g, ""),
				description: this.descriptionInput.value,
				value: parseInt(this.valueInput.value)
			});
			model.presets.reverse();
			// reset the input fields
			this.iconButton.className = "balancer-preset-plate_1";
			this.descriptionInput.value = "";
			this.valueInput.value = "";
			// redraw the view
			parent.saveState();
			parent.update();
		};

		this.checkValues = function(evt) {
			// disable the button until enough has been filled in
			this.addButton.disabled = (this.descriptionInput.value === "" || isNaN(parseInt(this.valueInput.value)));
		};

		this.cancelSubmit = function(evt) {
			// cancel the submit
			evt.preventDefault();
		};

		this.openIconPicker = function(evt) {
			// cancel the submit
			if (evt) evt.preventDefault();
			// show the list of icons
			this.iconPicker.className += " balancer-presets-picker-open";
		};

		this.closeIconPicker = function(evt) {
			// cancel the submit
			if (evt) evt.preventDefault();
			// hide the list of icons
			this.iconPicker.className = this.iconPicker.className.replace(/ balancer-presets-picker-open/g, "");
		};

		this.pickIcon = function(evt) {
			// cancel the submit
			if (evt) evt.preventDefault();
			// set the icon
			if (/button/i.test(evt.target.nodeName)) this.iconButton.className = evt.target.className;
			// close the picker
			this.closeIconPicker();
		};

		// events
		this.element.addEventListener("submit", this.cancelSubmit.bind(this));
		this.iconButton.addEventListener("click", this.openIconPicker.bind(this));
		this.descriptionInput.addEventListener("change", this.checkValues.bind(this));
		this.descriptionInput.addEventListener("keypress", this.checkValues.bind(this));
		this.valueInput.addEventListener("change", this.checkValues.bind(this));
		this.valueInput.addEventListener("keypress", this.checkValues.bind(this));
		this.addButton.addEventListener("click", this.addPreset.bind(this));
		this.iconPicker.addEventListener("click", this.pickIcon.bind(this));

	};

})();
