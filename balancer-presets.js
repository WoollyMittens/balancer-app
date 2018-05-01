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
		this.presetsList = this.element.querySelector(".balancer-presets-meals");

		// methods
		this.update = function() {

		};

		// events

	};

})();
