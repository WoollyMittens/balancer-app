// balancer-settings.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Settings = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-settings");
		this.weight = this.element.querySelector("input[name=weight]");
		this.age = this.element.querySelector("input[name=age]");
		this.height = this.element.querySelector("input[name=height]");
		this.gender = this.element.querySelector("select[name=gender]");

		// methods
		this.update = function() {
			// populate the input fields with the values
			this.weight.value = model.weight;
			this.age.value = model.age;
			this.height.value = model.height;
			this.gender.selectedIndex = model.gender;
		};

		// events
		this.onValueChanged = function(property, evt) {
			// retrieve the value from the field
			var number = parseInt(evt.target.value);
			model[property] = isNaN(number) ? evt.target.value : number;
			// update the property
			parent.update();
		};

		this.weight.addEventListener("change", this.onValueChanged.bind(this, "weight"));
		this.age.addEventListener("change", this.onValueChanged.bind(this, "age"));
		this.height.addEventListener("change", this.onValueChanged.bind(this, "height"));
		this.gender.addEventListener("change", this.onValueChanged.bind(this, "gender"));

		// TODO: graph length setting: 1 day, 7 days, Full history

	};

})();
