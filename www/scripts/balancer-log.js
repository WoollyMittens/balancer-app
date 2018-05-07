// balancer-diet.js

(function() {

	// opt in to a restricted variant of JavaScript
	"use strict";

	// use the existing parent class, or create a new one
	window.Balancer = window.Balancer || function() {};

	// add this sub-class to the parent class
	Balancer.prototype.Log = function(parent, model) {

		// properties
		this.setTimeline = parent.setTimeline.bind(parent);
		this.getTimeline = parent.getTimeline.bind(parent);
		this.element = model.root.querySelector(".balancer-log");
		this.logHistoryButton = this.element.querySelector(".balancer-log-add-history");
		this.logMealButton = this.element.querySelector(".balancer-log-add-meal");
		this.logActivityButton = this.element.querySelector(".balancer-log-add-activity");
		this.timeForm = this.element.querySelector(".balancer-log-time");
		this.timeInput = this.element.querySelector(".balancer-log-time input[name=time]");
		this.dateInput = this.element.querySelector(".balancer-log-time input[name=date]");

		// methods
		this.update = function() {
			// set the date and time labels
			this.updateTime();
			// reset the logging mode
			this.onLogOpened(model.log);
			// update the child components
			this.history.update();
			this.meals.update();
			this.activities.update();
		};

		this.updateTime = function() {
			// update the time to the current time or use the focussed time
			var date = model.focus || new Date();
			// set the input elements
			var year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
			this.timeInput.value = date.toLocaleTimeString([], {hour: "numeric", minute: "numeric", hour12: false});
			this.dateInput.value = year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);
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

		this.onLogOpened = function(mode, evt) {
			// cancel the click
			if (evt) evt.preventDefault();
			// store the requested mode
			model.log = mode;
			parent.saveState();
			// toggle the panel state
			this.element.className = this.element.className.replace(/-show-history|-show-meal|-show-activity/, "-show-" + model.log);
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
			model.focus = isNaN(focusDate.getTime()) ? null : focusDate;
			// if the focus is not on today, update the dates
			model.start = new Date(new Date(new Date(new Date(model.start).setYear(years)).setMonth(months)).setDate(days));
			model.end = new Date(new Date(new Date(new Date(model.end).setYear(years)).setMonth(months)).setDate(days));
			// reset the fields if the input gets mangled
			if (!model.focus) {
				var resetDate = new Date();
				this.timeInput.value = ("0" + resetDate.getHours()).slice(-2) + ":" + ("0" + resetDate.getMinutes()).slice(-2);
				this.dateInput.value = resetDate.getFullYear() + "-" + ("0" + (resetDate.getMonth() + 1)).slice(-2) + "-" + ("0" + resetDate.getDay()).slice(-2);
			}
			// update the app
			parent.update();
		};

		// classes
		this.history = new parent.History(this, model);
		this.meals = new parent.Meals(this, model);
		this.activities = new parent.Activities(this, model);

		// events
		this.logHistoryButton.addEventListener('click', this.onLogOpened.bind(this, "history"));
		this.logMealButton.addEventListener('click', this.onLogOpened.bind(this, "meal"));
		this.logActivityButton.addEventListener('click', this.onLogOpened.bind(this, "activity"));
		this.timeInput.addEventListener('change', this.onFocusTime.bind(this));
		this.dateInput.addEventListener('change', this.onFocusTime.bind(this));
		this.timeForm.addEventListener('submit', this.onFocusTime.bind(this));

	};

})();
