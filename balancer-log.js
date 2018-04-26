// balancer-diet.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Log = function(parent, model) {

		// properties
		this.element = model.root.querySelector(".balancer-log");
		this.logMealButton = this.element.querySelector(".balancer-log-add-meal");
		this.logActivityButton = this.element.querySelector(".balancer-log-add-activity");
		this.timeInput = this.element.querySelector(".balancer-log-time input[name=time]");
		this.dateInput = this.element.querySelector(".balancer-log-time input[name=date]");
		this.timeLabel = this.element.querySelector(".balancer-log-time time:nth-child(1)");
		this.dateLabel = this.element.querySelector(".balancer-log-time time:nth-child(2)");
		this.historyTable = this.element.querySelector(".balancer-log-history table");
		this.hourValue = this.element.querySelector(".balancer-log-meal b");
		this.labelInput = this.element.querySelector(".balancer-log-meal input[name=label]");
		this.valueInput = this.element.querySelector(".balancer-log-meal input[name=value]");
		this.addMealButton = this.element.querySelector(".balancer-log-meal button");
		// TODO: set the min and max interval programatically
		this.activityInput = this.element.querySelector(".balancer-log-activity input[name=activity]");
		this.addActivityButton = this.element.querySelector(".balancer-log-activity button");
		this.presetMeals = this.element.querySelector(".balancer-log-meals");
		this.presetActivities = this.element.querySelector(".balancer-log-activities");

		// methods
		this.update = function() {
			// redraw the components
			this.reset();
			this.redraw();
		};

		this.reset = function() {
			// clear the activities presets
			this.presetActivities.innerHTML = "";
			// clear the meals presets
			this.presetMeals.innerHTML = "";
			// clear the history list
			this.historyTable.innerHTML = "";
		};

		this.redraw = function() {
			// set the date and time labels
			this.updateTime();
			// fill the history with meals
			this.drawHistory(
				this.planHistory()
			);
			// fill the presets with options
			this.drawPresetMeals();
			this.drawPresetActivities();
			// check the input fields
			this.onCheckValues();
		};

		this.updateTime = function() {
			// update the time to the current time or use the focussed time
			var date = model.focus || new Date();
			// set the label values
			this.timeLabel.innerHTML = date.toLocaleTimeString([], {hour: "numeric", minute: "numeric", hour12: true}).replace(/\s/g, "");
			this.dateLabel.innerHTML = date.toLocaleDateString();
			// set the input elements
			var year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
			this.timeInput.value = date.toLocaleTimeString([], {hour: "numeric", minute: "numeric", hour12: false});
			this.dateInput.value = year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
		};

		this.planHistory = function() {
			// from the start date to the current date
			var historyItems = [];
			var currentMeals = [];
			// extend the dates to the end of the day
			var startDate = new Date(new Date(new Date(model.start).setHours(0)).setMinutes(1));
			var endDate = new Date(new Date(new Date(model.end).setHours(23)).setMinutes(59));
			// from the start to the end date
			while(startDate < endDate) {
				// get the current day's diet entries
				currentMeals = parent.getTimeline(startDate);
				// add a list entry for each diet entry
				currentMeals.diet.map(function(entry) {
					historyItems.push({
						label: entry.label,
						value: entry.value,
						date: new Date(startDate)
					});
				});
				// add history items with an sufficiant activity as well
				if (currentMeals.activity > 1) {
					var activityName;
					// TODO: this is now a float pick intervals differently
					switch(currentMeals.activity){
						case 1: activityName = "Moderate activity"; break;
						case 2: activityName = "Strenuous activity"; break;
						default : activityName = "Sedentary activity";
					}
					historyItems.push({
						label: activityName,
						activity: currentMeals.activity,
						date: new Date(startDate)
					});
				}
				// increment the hours
				startDate.setHours(startDate.getHours() + 1);
			}
			// pass back the prepared hisory items
			return historyItems;
		};

		this.drawHistory = function(historyItems) {
			// limit the length of the history to a managable size
			var maxItems = Math.min(historyItems.length, 1000);
			historyItems = historyItems.slice(historyItems.length - maxItems, historyItems.length);
			// add N elements of the chart to the DOM
			var historyRow, historyDate, historyLabel, historyValue, historyControls, historyButton;
			for (var a = 0, b = historyItems.length; a < b; a += 1) {
				// construct the history item
				historyRow = document.createElement("tr");
				historyDate = document.createElement("th");
				historyDate.innerHTML = historyItems[a].date.toLocaleTimeString([], {hour: "numeric", hour12: true}).replace(/\s/g, "");
				historyLabel = document.createElement("td");
				historyLabel.innerHTML = historyItems[a].label;
				historyValue = document.createElement("td");
				historyValue.innerHTML = (historyItems[a].value) ? historyItems[a].value + " kJ" : "";
				historyControls = document.createElement("td");
				historyButton = document.createElement("button");
				historyButton.innerHTML = "Remove";
				historyButton.onclick = (historyItems[a].value) ? this.onRemoveMeal.bind(this, historyItems[a]) : this.onRemoveActivity.bind(this, historyItems[a]);
				historyRow.appendChild(historyDate);
				historyRow.appendChild(historyLabel);
				historyRow.appendChild(historyValue);
				historyRow.appendChild(historyControls);
				historyControls.appendChild(historyButton);
				this.historyTable.appendChild(historyRow);
			}
		};

		this.drawPresetMeals = function() {
			// add the presets to the list
			var presetItem, presetButton;
			for (var a = 0, b = model.meals.length; a < b; a += 1) {
				// construct the preset item
				presetItem = document.createElement("li");
				presetButton = document.createElement("button");
				presetButton.innerHTML = model.meals[a].description;
				presetButton.className = "balancer-preset-" + model.meals[a].icon;
				presetButton.addEventListener("click", this.onFillPresetMeal.bind(this, model.meals[a]));
				presetItem.appendChild(presetButton);
				this.presetMeals.appendChild(presetItem);
			}
		};

		this.drawPresetActivities = function() {
			// add the presets to the list
			var presetItem, presetButton;
			for (var a = 0, b = model.activities.length; a < b; a += 1) {
				// construct the preset item
				presetItem = document.createElement("li");
				presetButton = document.createElement("button");
				presetButton.innerHTML = model.activities[a].description;
				presetButton.className = "balancer-preset-" + model.activities[a].icon;
				presetButton.addEventListener("click", this.onFillPresetActivity.bind(this, model.activities[a]));
				presetItem.appendChild(presetButton);
				this.presetActivities.appendChild(presetItem);
			}
		};

		this.getTimeStamp = function() {
			// figure out the time stamp
			var inputTime = this.timeInput.value.split(":");
			var inputDate = this.dateInput.value.split("-");
			var year = parseInt(inputDate[0]);
			var month = parseInt(inputDate[1]) - 1;
			var day = parseInt(inputDate[2]);
			var hours = inputTime[0];
			// return it as a date object
			return new Date(year, month, day, hours);
		}

		// events
		this.onLogOpened = function(mode, evt) {
			// cancel the click
			if (evt) evt.preventDefault();
			// toggle the panel state
			var allModes = new RegExp("-show-history|-show-meal|-show-activity");
			var currentMode = new RegExp("-show-" + mode);
			this.element.className = this.element.className.replace(allModes, currentMode.test(this.element.className) ? "-show-history" : "-show-" + mode);
		};

		this.onRemoveMeal = function(meal, evt) {
			// cancel the click
			evt.preventDefault();
			// retrieve the timeline entry for this hour
			var timelineEntry = parent.getTimeline(meal.date);
			// for all the diet items
			var wasFound = false, newDiet = [];
			timelineEntry.diet.map(function(entry) {
				// allow all but the first matching entry through
				if (meal.label !== entry.label || meal.value !== entry.value || wasFound) {
					newDiet.push(entry);
				} else {
					wasFound = true;
				}
			});
			// save the updated entry
			timelineEntry.diet = newDiet;
			parent.setTimeline(meal.date, timelineEntry);
		};

		this.onRemoveActivity = function(entry, evt) {
			// cancel the click
			evt.preventDefault();
			// update the activity level for this hour
			parent.setTimeline(entry.date, {activity: 0});
		};

		this.onCheckValues = function() {
			// update the hour value
			var timeValue = parseInt(this.timeInput.value.split(":")[0]);
			this.hourValue.innerHTML = !isNaN(timeValue) ? new Date(new Date().setHours(timeValue)).toLocaleString([], {hour: "numeric", hour12: true}).replace(/\s/g, "") : "";
			// update the activity level
			this.activityInput.min = model.minActivity;
			this.activityInput.max = model.maxActivity;
			this.activityInput.value = parent.getTimeline(this.getTimeStamp()).activity;
			// disable the button, if any of the values is invalid
			this.addMealButton.disabled = (
				isNaN(parseInt(this.timeInput.value))
				|| isNaN(parseInt(this.dateInput.value))
				|| isNaN(parseInt(this.valueInput.value))
				|| this.labelInput.value === ""
			);
		};

		this.onAddActivity = function(evt) {
			// set the activity level for this time
			parent.setTimeline(this.getTimeStamp(), {activity: parseInt(this.activityInput.value)});
		};

		this.onFillPresetActivity = function(preset, evt) {
			// cancel the click
			evt.preventDefault();
			// implement the values of the preset
			this.activityInput.value = preset.activity;
			// check the input fields
			this.onAddActivity();
		};

		this.onAddMeal = function(evt) {
			// cancel the click
			evt.preventDefault();
			// figure out the time stamp
			var date = this.getTimeStamp();
			// retrieve the timeline entry
			var timelineEntry = parent.getTimeline(date);
			// add this meal at the given time
			timelineEntry.diet.push({
				label: this.labelInput.value,
				value: parseInt(this.valueInput.value)
			});
			// store the timeline entry
			parent.setTimeline(date, timelineEntry);
			// return to the history list
			this.onLogOpened("history");
		};

		this.onFillPresetMeal = function(preset, evt) {
			// cancel the click
			evt.preventDefault();
			// implement the values of the preset
			this.labelInput.value = preset.description;
			this.valueInput.value = preset.value;
			// check the input fields
			this.onCheckValues();
		};

		this.onFocusTime = function(evt) {
			// set the time input as the focussed time
			var time = this.timeInput.value.split(":");
			var date = this.dateInput.value.split("-");
			var years = parseInt(date[0]);
			var months = parseInt(date[1]) - 1;
			var days = parseInt(date[2]);
			var hours = parseInt(time[0]);
			var minutes = parseInt(time[1]);
			var focusDate = new Date(years, months, days, hours, minutes);
			model.focus = (isNaN(focusDate.getTime())) ? null : focusDate;
			// reset the fields if the input gets mangled
			if (!model.focus) {
				var resetDate = new Date();
				this.timeInput.value = ("0" + resetDate.getHours()).slice(-2) + ":" + ("0" + resetDate.getMinutes()).slice(-2);
				this.dateInput.value = resetDate.getFullYear() + "-" + ("0" + (resetDate.getMonth() + 1)).slice(-2) + "-" + ("0" + resetDate.getDay()).slice(-2);
			}
		};

		this.element.addEventListener('submit', function (evt) { evt.preventDefault(); });
		this.logMealButton.addEventListener('click', this.onLogOpened.bind(this, "meal"));
		this.logActivityButton.addEventListener('click', this.onLogOpened.bind(this, "activity"));
		this.timeInput.addEventListener('change', this.onFocusTime.bind(this));
		this.dateInput.addEventListener('change', this.onFocusTime.bind(this));
		this.timeInput.addEventListener('change', this.onCheckValues.bind(this));
		this.dateInput.addEventListener('change', this.onCheckValues.bind(this));
		this.labelInput.addEventListener('change', this.onCheckValues.bind(this));
		this.labelInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('change', this.onCheckValues.bind(this));
		this.valueInput.addEventListener('keypress', this.onCheckValues.bind(this));
		this.addMealButton.addEventListener('click', this.onAddMeal.bind(this));
		this.activityInput.addEventListener('change', this.onAddActivity.bind(this));

	};

})();
