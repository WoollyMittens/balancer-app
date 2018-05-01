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
				presetIcon.innerHTML = "<span class=\"balancer-preset-" + preset.icon + "\"></span>";
				presetDescription = document.createElement("td");
				presetDescription.innerHTML = preset.description;
				presetValue = document.createElement("td");
				presetValue.innerHTML = preset.value + "kJ";
				presetRemove = document.createElement("td");
				presetButton = document.createElement("button");
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

		// events

	};

})();
