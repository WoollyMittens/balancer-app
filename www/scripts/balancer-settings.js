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
		this.timespan = this.element.querySelector("select[name=timespan]");
		this.backup = this.element.querySelector("textarea[name=backup]");
		this.reset = this.element.querySelector("button[name=reset]");
		this.confirm = this.element.querySelector("button[name=confirm]");

		// methods
		this.update = function() {
			// populate the input fields with the values
			this.weight.value = model.weight;
			this.age.value = model.age;
			this.height.value = model.height;
			this.gender.value = model.gender;
			this.timespan.value = model.timespan;
			// update the backup
			this.backup.value = JSON.stringify(model);
		};

		this.onValueChanged = function(property, evt) {
			// retrieve the value from the field
			var number = parseInt(evt.target.value);
			model[property] = isNaN(number) ? evt.target.value : number;
			// update the property
			parent.update();
			// save the state
			parent.saveState();
		};

		this.onRestoreBackup = function() {
			try {
				var backup = JSON.parse(this.backup.value);
				parent.restoreState(this.backup.value);
			} catch (e) {
				console.log("onRestoreBackup", e);
			}
		};

		this.onResetHistory = function(evt) {
			// cancel the click
			evt.preventDefault();
			// unlock the confirm button temprarily
			var confirm = this.confirm;
			confirm.disabled = false;
			setTimeout(function() { confirm.disabled = true; }, 4000);
		};

		this.onConfirmReset = function(evt) {
			// cancel the click
			evt.preventDefault();
			// wipe out the stored history
			model.timeline = {};
			parent.saveState();
			parent.update();
			// lock the confirm button
			this.confirm.disabled = true;
		};

		// events
		this.weight.addEventListener("change", this.onValueChanged.bind(this, "weight"));
		this.age.addEventListener("change", this.onValueChanged.bind(this, "age"));
		this.height.addEventListener("change", this.onValueChanged.bind(this, "height"));
		this.gender.addEventListener("change", this.onValueChanged.bind(this, "gender"));
		this.timespan.addEventListener("change", this.onValueChanged.bind(this, "timespan"));
		this.backup.addEventListener("change", this.onRestoreBackup.bind(this, "backup"));
		this.reset.addEventListener("click", this.onResetHistory.bind(this));
		this.confirm.addEventListener("click", this.onConfirmReset.bind(this));

	};

})();
