// balancer-diet.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Diet = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-diet");
		this.opener = this.element.querySelector(".balancer-diet-add");

		// methods
		this.update = function() {

		};
		
		this.onOpened = function(evt) {
			// cancel the click
			evt.preventDefault();
			// toggle the panel state
			this.element.className = this.element.className.replace(/-open|-closed/, /-open/.test(this.element.className) ? "-closed" : "-open");
		};

		// events
		this.opener.addEventListener('click', this.onOpened.bind(this));

	};

})();
