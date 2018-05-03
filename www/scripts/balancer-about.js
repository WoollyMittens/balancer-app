// balancer-settings.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.About = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-about");

		// methods
		this.update = function() {

		};

		// events

	};

})();
