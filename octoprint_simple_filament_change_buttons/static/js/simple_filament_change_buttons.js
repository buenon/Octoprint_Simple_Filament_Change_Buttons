/*
 * View model for simple_filament_change_buttons
 *
 * Author: Gareth Martin
 * License: mit
 */
$(function () {
	const UNLOAD = 'filament-unload';
	const LOAD = 'filament-load';
	const IDLE_TEMP = 170;
	const materials = {
		"PLA": {
			hotend: 215,
			bed: 60
		},
		"PETG": {
			hotend: 230,
			bed: 85
		},
		"FLEX": {
			hotend: 240,
			bed: 50
		},
	};

	let selectedUnloadMaterial = "PLA";
	let selectedLoadMaterial = "PLA";

	function Simple_Filament_Change_Buttons_ViewModel(parameters) {
		var self = this;

		// assign the injected parameters
		self.controlViewModel = parameters[0];

		self.unloadFilament = function () {
			const [unloadMaterial, loadMaterial] = [materials[selectedUnloadMaterial], materials[selectedLoadMaterial]];

			cmds = [
				// Heat to specified temp
				"M104 S" + unloadMaterial.hotend,
				"M140 S" + loadMaterial.bed,
				"M109 S" + unloadMaterial.hotend,
				// Do unload
				"M702",
			]

			OctoPrint.control.sendGcode(cmds)
		}

		self.loadFilament = function () {
			const loadMaterial = materials[selectedLoadMaterial];

			cmds = [
				// Heat to specified temp
				"M104 S" + loadMaterial.hotend,
				"M140 S" + loadMaterial.bed,
				"M109 S" + loadMaterial.hotend,
				// Do load
				"M701",
				// Set hotend to 170
				"M104 S" + IDLE_TEMP
			]
			OctoPrint.control.sendGcode(cmds)
		}

		self.changeFilament = function () {
			const [unloadMaterial, loadMaterial] = [materials[selectedUnloadMaterial], materials[selectedLoadMaterial]];

			cmds = [
				// Heat to specified temp
				"M104 S" + unloadMaterial.hotend,
				"M140 S" + loadMaterial.bed,
				"M109 S" + unloadMaterial.hotend,
				// Do filament change
				"M600",
				// Cool hotend
				"M104 S" + IDLE_TEMP,
			]
			OctoPrint.control.sendGcode(cmds)
		}

		self.resume = function () {
			cmds = [
				'M108'
			]
			OctoPrint.control.sendGcode(cmds)
		}

		self.preheat = function () {
			const loadMaterial = materials[selectedLoadMaterial];

			cmds = [
				"M104 S" + IDLE_TEMP,
				"M140 S" + loadMaterial.bed,
			]
			OctoPrint.control.sendGcode(cmds)
		}

		self.cooldown = function () {
			cmds = [
				// Heat to specified temp
				"M104 S0",
				"M140 S0"
			]
			OctoPrint.control.sendGcode(cmds)
		}

		self.selectMaterial = function (op, type) {
			if (op === LOAD) {
				selectedLoadMaterial = type;
			} else {
				selectedUnloadMaterial = type;
			}

			const buttons = $(`button[class*='${op}']`)
			const buttonClass = `${op}-${type}`

			buttons.each(function () {
				if ($(this).hasClass(buttonClass)) {
					$(this).addClass('btn-primary');
				} else {
					$(this).removeClass('btn-primary');
				}
			});
		}

		self.getAdditionalControls = function () {
			return [{
				'layout': 'horizontal', 'name': 'Filament Change', 'children': [
					/*{'commands': [
						'M125'
						],
						'additionalClasses': 'sfcb fa-pause', 'name': ' Park'},*/

					{ name: ' Unload', javascript: self.unloadFilament, additionalClasses: 'sfcb fa-fast-backward' },
					{ name: ' Load', javascript: self.loadFilament, additionalClasses: 'sfcb fa-step-forward' },
					{ name: ' Change Filament', javascript: self.changeFilament, additionalClasses: 'sfcb fa-sync' },
					{ name: ' Resume', javascript: self.resume, additionalClasses: 'sfcb fa-play' },
					{
						'layout': 'horizontal', 'children': [
							{ name: ' Preheat', javascript: self.preheat, additionalClasses: 'sfcb fa-fire' },
							{ name: ' Cooldown', javascript: self.cooldown, additionalClasses: 'sfcb fa-snowflake' },
						],
					},
					{
						'layout': 'horizontal', 'children': [
							{ name: 'Unloading', javascript: () => { }, additionalClasses: 'btn-link disabled label' },
							...Object.keys(materials).map((type, i) => {
								return { name: type, javascript: () => { self.selectMaterial(UNLOAD, type) }, additionalClasses: `${UNLOAD}-${type} ${i === 0 ? 'btn-primary' : ''}` };
							})
						],
					},
					{
						'layout': 'horizontal', 'children': [
							{ name: 'Loading', javascript: () => { }, additionalClasses: 'btn-link disabled label' },
							...Object.keys(materials).map((type, i) => {
								return { name: type, javascript: () => { self.selectMaterial(LOAD, type) }, additionalClasses: `${LOAD}-${type} ${i === 0 ? 'btn-primary' : ''}` };
							})
						],
					}
				]
			}];
		};

		self.selectMaterial(LOAD, "PLA");
		self.selectMaterial(UNLOAD, "PLA");
	}

	/* view model class, parameters for constructor, container to bind to
	 * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
	 * and a full list of the available options.
	 */
	OCTOPRINT_VIEWMODELS.push({
		construct: Simple_Filament_Change_Buttons_ViewModel,
		dependencies: ["controlViewModel"]
	});
});

