// polyfill cordova
if (!window.cordova) {
	var onDeviceReady = new Event("deviceready");
	setTimeout(function() {
		document.dispatchEvent(onDeviceReady);
	}, 0);
};

// wait for the device to become ready
document.addEventListener('deviceready', function() {
	// start a new instance of the class
	var balancer = new Balancer().init({
		// root DOM object
		root: document.getElementById("balancer"),
		// energy density of body fat (kJ/kg)
		density: 37000,
		// female or male (index)
		gender: 1,
		// (cm)
		height: 187,
		// (kg)
		weight: 82,
		// (years)
		age: 42,
		// desired weightloss (kg)
		weightloss: 0,
		// collection of activity and diet events
		timeline: {},
		// collection of preset diet items
		// TODO: fill in reasonable selection of presets
		presets: [
			{
				icon: "burger_1",
				description: "Big Mac",
				value: 2100
			}, {
				icon: "burger_2",
				description: "Whopper",
				value: 2800
			}
		],
		// minimum metabolic multiplier
		minActivity: 1,
		// maximum metabolic multiplier
		maxActivity: 7,
		// graph scale day/week/month/year
		scale: 0,
		// max graph length in days
		timespan: 0,
		// start day
		start: new Date(),
		// focussed day
		focus: null,
		// end day
		end: new Date(),
		// logging mode
		log: "history"
	});
}, false);
