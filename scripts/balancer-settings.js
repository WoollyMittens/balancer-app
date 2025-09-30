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
		this.weightPounds = this.element.querySelector("input[name=weightPounds]");
		this.weightStone = this.element.querySelector("input[name=weightStone]");
		this.weightUnits = this.element.querySelector("select[name=weightUnits]");
		this.age = this.element.querySelector("input[name=age]");
		this.height = this.element.querySelector("input[name=height]");
		this.heightFeet = this.element.querySelector("input[name=heightFeet]");
		this.heightInches = this.element.querySelector("input[name=heightInches]");
		this.heightUnits = this.element.querySelector("select[name=heightUnits]");
		this.energyUnits = this.element.querySelector("select[name=energyUnits]");
		this.gender = this.element.querySelector("select[name=gender]");
		this.adjustment = this.element.querySelector("input[name=adjustment]");
		this.timespan = this.element.querySelector("select[name=timespan]");
		this.backup = this.element.querySelector("textarea[name=backup]");
		this.reset = this.element.querySelector("button[name=reset]");
		this.confirm = this.element.querySelector("button[name=confirm]");

		// methods
		this.update = function() {
			var feetHeight = model.height * 0.032808;
			// populate the input fields with the values
			this.weight.value = model.weight.toFixed(0);
			this.weightPounds.value = (model.weight * 2.20462).toFixed(0);
			this.weightStone.value = (model.weight * 0.157473).toFixed(1);
			this.age.value = model.age.toFixed(0);
			this.height.value = model.height.toFixed(0);
			this.heightFeet.value = parseInt(feetHeight);
			this.heightInches.value = ((feetHeight - parseInt(feetHeight)) * 12).toFixed(0);
			this.gender.value = model.gender;
			this.adjustment.value = model.adjustment;
			this.timespan.value = model.timespan;
			// display the configured units
			this.heightUnits.selectedIndex = model.heightUnits;
			this.weightUnits.selectedIndex = model.weightUnits;
			this.energyUnits.selectedIndex = model.energyUnits;
			this.onUnitsChanged();
			// update the backup
			this.backup.value = JSON.stringify(model);
		};

		this.onValueChanged = function(property, evt) {
			// retrieve the value from the field
			var number = parseFloat(evt.target.value);
			model[property] = isNaN(number) ? evt.target.value : number;
			// update the property
			parent.update();
			// save the state
			parent.saveState();
		};

		this.onImperialChanged = function(property, evt) {
			console.log("onImperialChanged", arguments);
			var metricProperty, metricValue;
			var imperialValue = parseFloat(evt.target.value);
			// conver to to the metric values
			switch (property) {
				case "weightPounds":
					metricProperty = "weight";
					metricValue = imperialValue / 2.20462;
					break;
				case "weightStone":
					metricProperty = "weight";
					metricValue = imperialValue / 0.157473;
					break;
				case "heightFeet":
					metricProperty = "height";
					metricValue = imperialValue / 0.032808;
					metricValue += parseFloat(this.heightInches.value) / 12 / 0.032808;
					break;
				case "heightInches":
					metricProperty = "height";
					metricValue = imperialValue * 2.54;
					metricValue += parseFloat(this.heightFeet.value) * 12 * 2.54;
					break;
				default:
					break;
			}
			// fill the metric unit by proxy
			this.onValueChanged(metricProperty, {"target": {"value": metricValue}});
		};

		this.onUnitsChanged = function() {
			// show centimeter or inches
			this.height.parentNode.style.display = (this.heightUnits.selectedIndex === 0) ? "block" : "none";
			this.heightFeet.parentNode.style.display = (this.heightUnits.selectedIndex === 1) ? "block" : "none";
			this.heightInches.parentNode.style.display = (this.heightUnits.selectedIndex === 1) ? "block" : "none";
			// show kilos or pounds or stones
			this.weight.parentNode.style.display = (this.weightUnits.selectedIndex === 0) ? "block" : "none";
			this.weightPounds.parentNode.style.display = (this.weightUnits.selectedIndex === 1) ? "block" : "none";
			this.weightStone.parentNode.style.display = (this.weightUnits.selectedIndex === 2) ? "block" : "none";
			// store in model
			model.heightUnits = this.heightUnits.selectedIndex;
			model.weightUnits = this.weightUnits.selectedIndex;
			model.energyUnits = this.energyUnits.selectedIndex;
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
		this.weightPounds.addEventListener("change", this.onImperialChanged.bind(this, "weightPounds"));
		this.weightStone.addEventListener("change", this.onImperialChanged.bind(this, "weightStone"));
		this.age.addEventListener("change", this.onValueChanged.bind(this, "age"));
		this.height.addEventListener("change", this.onValueChanged.bind(this, "height"));
		this.heightFeet.addEventListener("change", this.onImperialChanged.bind(this, "heightFeet"));
		this.heightInches.addEventListener("change", this.onImperialChanged.bind(this, "heightInches"));
		this.gender.addEventListener("change", this.onValueChanged.bind(this, "gender"));
		this.adjustment.addEventListener("change", this.onValueChanged.bind(this, "adjustment"));
		this.timespan.addEventListener("change", this.onValueChanged.bind(this, "timespan"));
		this.backup.addEventListener("change", this.onRestoreBackup.bind(this, "backup"));
		this.reset.addEventListener("click", this.onResetHistory.bind(this));
		this.confirm.addEventListener("click", this.onConfirmReset.bind(this));
		this.weightUnits.addEventListener("change", this.onUnitsChanged.bind(this));
		this.heightUnits.addEventListener("change", this.onUnitsChanged.bind(this));
		this.energyUnits.addEventListener("change", this.onUnitsChanged.bind(this));

	};

})();
