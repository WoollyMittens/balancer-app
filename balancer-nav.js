// balancer-settings.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Nav = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-nav");
		this.logNav = model.root.querySelector(".balancer-nav-log");
		this.settingsNav = model.root.querySelector(".balancer-nav-settings");

		// methods
		this.update = function() {

		};

		this.onChangeView = function(name, evt) {
			// change the view
			model.root.className = model.root.className.replace(/balancer-show-.*$/g, "balancer-show-" + name);
			// update the property
			parent.update();
		};

		// events

		this.logNav.addEventListener("click", this.onChangeView.bind(this, "log"));
		this.settingsNav.addEventListener("click", this.onChangeView.bind(this, "settings"));

	};

})();
