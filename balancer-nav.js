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
		this.presetsNav = model.root.querySelector(".balancer-nav-presets");
		this.settingsNav = model.root.querySelector(".balancer-nav-settings");
		this.aboutNav = model.root.querySelector(".balancer-nav-about");

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

		// TODO: clicking the log button should reset to current time and history list

		this.logNav.addEventListener("click", this.onChangeView.bind(this, "log"));
		this.presetsNav.addEventListener("click", this.onChangeView.bind(this, "presets"));
		this.settingsNav.addEventListener("click", this.onChangeView.bind(this, "settings"));
		this.aboutNav.addEventListener("click", this.onChangeView.bind(this, "about"));

	};

})();
