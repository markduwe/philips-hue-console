var api			= localStorage.getItem('hueIP')+'/api/',
	upnp		= 'https://www.meethue.com/api/nupnp',
	config		= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/config/',
	groupZero	= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/groups/0/',
	allGroups	= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/groups/',
	allLights	= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/lights/',
	allSensors	= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/sensors/',
	allScenes	= localStorage.getItem('hueIP')+'/api/'+localStorage.getItem('hueUser')+'/scenes/',
	begin		= localStorage.getItem('hueIP')+'/api/';

$(function() {

	if(exists(localStorage.getItem('hueUser'))){

		$('#hue').show();

		$('#config').hide();

		setInterval(function(){
			updateDateTime();
		}, 1000);

		setInterval(function(){
			updateEverything();
		}, 2500);

		bridge();

		allRooms();

		getColor();

		$('#goToHue').on('click', function(e){
			e.preventDefault();
			$('#hue').show();
			$('#edit').hide();
			$('.nav a').parent().removeClass('active');
			$(this).parent().addClass('active');
		});

		$('.navbar-brand').on('click', function(e){
			e.preventDefault();
			$('#hue').show();
			$('#edit').hide();
			$('#editPage').parent().removeClass('active');
			$('#goToHue').parent().addClass('active');
		});

		$('#editPage').on('click', function(e){
			e.preventDefault();
			$('#hue').hide();
			$('#edit').show();
			editBridge();
			editRooms();
			editLights();
			editSensors();
			$('.nav a').parent().removeClass('active');
			$(this).parent().addClass('active');
		});

	} else {

		$('#config').show();
		$('.userExists').hide();
		$('.userCreate').addClass('active');
		configuration();

	}

});

function configuration() {
	var conf = '<div class="col-md-4 col-md-offset-4" id="letsGo">';
	conf += '<div class="list-group">';
	conf += '<div class="list-group-item active">';
	conf += '<h4 class="list-group-item-heading">1. Get Started</h4>';
	conf += '<p class="list-group-item-text">Click the button below to discover your bridge</p>';
	conf += '</div>';
	conf += '<div class="list-group-item">';
	conf += '<button class="btn btn-info" id="findBridge"><i class="mdi mdi-wifi"></i> Find Bridge</button>';
	conf += '</div>';
	conf += '</div>';
	conf += '</div>';
	$('#config').html(conf);
	$('#findBridge').on('click', function(){
		var discover = '<div class="list-group">';
		$.getJSON(upnp, function(data){
			localStorage.setItem('hueIP', 'http://'+data[0].internalipaddress);
		}).success(function(){
			discover += '<div class="list-group-item active">'
			discover += '<h4 class="list-group-item-heading">2. Bridge Found!</h4>';
			discover += '<p class="list-group-item-text">Now we need to create a user on the bridge.</p>';
			discover += '<p class="list-group-item-text"><i class="hue-pushlink_bridgev2"></i> Press the link button on your bridge and click the button below within 30 seconds.</p>';
			discover += '</div>';
			discover += '<div class="list-group-item">';
			discover += '<button class="btn btn-info" id="createUser"><i class="mdi mdi-account-plus"></i> Create User</button>';
			discover += '</div>';
			$('#letsGo').append(discover);
			$('#createUser').on('click', function(){
				var user = '<div class="list-group">';
				$.ajax({
			    	type: 'POST',
					url: api,
					data: '{"devicetype": "hueApp#hueWebApp"}'
				}).done(function(data){
					if(exists(data[0].success)) {
						localStorage.setItem('hueUser', data[0].success.username);
						started = '<div class="list-group-item active">'
						started += '<h4 class="list-group-item-heading">3. User Created!</h4>';
						started += '<p class="list-group-item-text">You\'re all set up.</p>';
						started += '<p class="list-group-item-text">Click the button below to go to your hue control panel.</p>';
						started += '</div>';
						started += '<div class="list-group-item">';
						started += '<button class="btn btn-info" id="controlPanel"><i class="hue-LCT001"></i> Control Panel</button>';
						started += '</div>';
						$('#fail').remove();
						$('#letsGo').append(started);
						$('#controlPanel').on('click', function(){
							$('#config').hide();
							$('#hue').show();
							$('.userExists').show();
							$('.userCreate').removeClass('active');
							bridge();
							allRooms();
							getColor();
						});
					}
					if(exists(data[0].error)) {
						fail = '<div class="list-group" id="fail">';
						fail += '<div class="list-group-item active">'
						fail += '<h3 class="list-group-item-heading">Oops</h3>';
						fail += '<p class="list-group-item-text">'+data[0].error.description+', or you took too long.</p>';
						fail += '<p class="list-group-item-text"><p class="list-group-item-text"><i class="hue-pushlink_bridgev2"></i> Press the link button on your bridge and click the button above within 30 seconds.</p></p>';
						fail += '</div>';
						fail += '</div>';
						$('#letsGo').append(fail);
					}
				});
			});
		});
	});
}

// date/time update
function updateDateTime() {
	var dateTime = moment();
	$('#currentTime').html(dateTime.format('DD/MM/YY, h:mm:ss a'));
}

// get bridge
function bridge() {
	$.getJSON(config, function(data){
		stuff = '<div class="panel panel-default">';
		stuff += '<div class="panel-heading">';
		stuff += data.name;
		stuff += '<div class="pull-right">';
		stuff += '<div class="btn-group">';
		stuff += '<button type="button" class="btn btn-xs btn-default" data-group="Group0" id="allLights">&nbsp;<i class="hue-'+data.modelid+'"></i>&nbsp;</button>';
		stuff += '</div>';
		stuff += '</div>';
		stuff += '</div>';
		stuff += '<div class="panel-body">';
		stuff += '<div class="list-group">';
		if(data.swupdate.updatestate == 0){
			stuff += '<button class="list-group-item" id="update">';
			stuff += '<i class="mdi mdi-update"></i>&nbsp;';
			stuff += 'Up to date';
			stuff += '</button>'
		} else {
		stuff += '<div class="list-group-item">';
			stuff += '<i class="mdi mdi-update"></i>&nbsp;';
			stuff += 'Update Available';
			stuff += '</div>';
		}
		stuff += '<div class="list-group-item">';
		stuff += '<i class="mdi mdi-puzzle"></i>&nbsp;';
		stuff += 'Software: '+data.swversion;
		stuff += '</div>';
		stuff += '<div class="list-group-item"> ';
		stuff += '<i class="mdi mdi-wifi"></i>&nbsp;';
		stuff += data.ipaddress;
		stuff += '</div>';
		stuff += '<div class="list-group-item">';
		if(data.linkbutton == false){
			stuff += '<i class="hue-pushlink_bridgev2"></i>&nbsp;';
			stuff += 'Link button inactive';
		} else {
			stuff += '<i class="mdi mdi-adjust"></i>&nbsp;';
			stuff += 'Link button active';
		}
		stuff += '</div>';
		stuff += '<div class="list-group-item">';
		if(data.portalservices == true){
			stuff += '<i class="mdi mdi-plus-network"></i>&nbsp;';
			stuff += 'Connected to My hue';
		} else {
			stuff += '<i class="mdi mdi-minus-network"></i>&nbsp;';
			stuff += 'Not connected to My hue';
		}
		stuff += '</div>';
		stuff += '<div class="list-group-item">';
		stuff += '<i class="mdi mdi-calendar-clock"></i>&nbsp;';
		stuff += '<span id="currentTime"></span>'
		stuff += '</div>';
		stuff += '<div class="list-group-item">';
		stuff += '<i class="mdi mdi-earth"></i>&nbsp;';
		stuff += data.timezone;
		stuff += '</div>';
		stuff += '</div>';
		stuff += '</div>';
		$('#bridge').html(stuff);
		$('#update').on('click', function(){
			$.ajax({
			    type: 'PUT',
			    url: config,
			    data: '{"swupdate": {"checkforupdate":true}}'
			});
			bridge();
		});
		group0onoff();
		updateEverything();
		sensors();
	});
}

// populate all rooms
function allRooms() {
	$.getJSON(allGroups, function(data){
		var hue = '';
		$.each(data, function(i,a) {
			hue += '<div class="col-sm-12 col-md-12 col-lg-4" data-group="'+i+'">';
			hue += '<div class="panel panel-default">';
			hue += '<div class="panel-heading" data-group="'+i+'" data-room="Group'+i+'">';
			hue += ' '+a.name;
			hue += '<div class="pull-right">';
			hue += '<button class="btn btn-xs btn-default roomController" data-room="'+i+'">';

			var roomType = a.class;
			switch (roomType) {
				case 'Living room':
					hue += '&nbsp;<i class="hue-living"></i>&nbsp;';
					break;
				case 'Kitchen':
					hue += '&nbsp;<i class="hue-kitchen"></i>&nbsp;';
					break;
				case 'Dining':
					hue += '&nbsp;<i class="hue-dining"></i>&nbsp;';
					break;
				case 'Bedroom':
					hue += '&nbsp;<i class="hue-bedroom"></i>&nbsp;';
					break;
				case 'Kids bedroom':
					hue += '&nbsp;<i class="kids_bedroom"></i>&nbsp;';
					break;
				case 'Bathroom':
					hue += '&nbsp;<i class="hue-bathroom"></i>&nbsp;';
					break;
				case 'Nursery':
					hue += '&nbsp;<i class="hue-nursery"></i>&nbsp;';
					break;
				case 'Recreation':
					hue += '&nbsp;<i class="hue-recreation"></i>&nbsp;';
					break;
				case 'Office':
					hue += '&nbsp;<i class="hue-office"></i>&nbsp;';
					break;
				case 'Gym':
					hue += '&nbsp;<i class="hue-gym"></i>&nbsp;';
					break;
				case 'Hallway':
					hue += '&nbsp;<i class="hue-hallway"></i>&nbsp;';
					break;
				case 'Toilet':
					hue += '&nbsp;<i class="hue-toilet"></i>&nbsp;';
					break;
				case 'Front door':
					hue += '&nbsp;<i class="hue-frontdoor"></i>&nbsp;';
					break;
				case 'Garage':
					hue += '&nbsp;<i class="hue-garage"></i>&nbsp;';
					break;
				case 'Terrace':
					hue += '&nbsp;<i class="hue-terrace"></i>&nbsp;';
					break;
				case 'Garden':
					hue += '&nbsp;<i class="hue-garden"></i>&nbsp;';
					break;
				case 'Driveway':
					hue += '&nbsp;<i class="hue-driveway"></i>&nbsp;';
					break;
				case 'Carport':
					hue += '&nbsp;<i class="hue-carport"></i>&nbsp;';
					break;
				case 'Other':
					hue += '&nbsp;<i class="mhue-other"></i>&nbsp;';
					break;
			}
			hue += '</button>';
			hue += '</div>';
			hue += '</div>';
			hue += '<div class="panel-body">';
			hue += '<div class="list-group">';
			$.each(a.lights, function(i,b) {
				hue += '<div class="list-group-item lamp" data-lamp="'+b+'" data-light="Light'+b+'">';
				$.getJSON(allLights+b, function(lamp){
					$('.list-group-item[data-lamp="'+b+'"]').html(
						'<div class="btn-group" role="group"><button type="button" class="lightController btn btn-default" data-light="Light'+b+'" data-bulb="'+b+'">'+lamp.name+'</button><button class="btn btn-default colorShow" data-color="'+b+'" data-value="rgb('+cie_to_rgb(lamp.state.xy[0],lamp.state.xy[1])+')"><i class="hue-'+lamp.modelid+'"></i></button></div>'
					);
					lightXonoff();
				});
				hue += '</div>';
			});
			hue += '</div>';
			hue += '</div>';
			hue += '</div>';
			hue += '</div>';
		});
		$('#groups').html(hue);
		groupXonoff();
		updateEverything();
	});
}

// get all rooms/lights states
function updateEverything() {
	$.getJSON(allGroups, function(data){
		$.each(data, function(i,a) {
			if(a.state.any_on == true) {
				$('button[data-room="'+i+'"]').addClass('btn-primary').removeClass('btn-default');
			} else {
				$('button[data-room="'+i+'"]').addClass('btn-default').removeClass('btn-primary');
			}
			if(a.state.any_on == true) {
				$('button[data-room="'+i+'"]').addClass('btn-primary').removeClass('btn-default');
			} else {
				$('button[data-room="'+i+'"]').addClass('btn-default').removeClass('btn-primary');
			}
		});
	});
	$.getJSON(groupZero, function(data){
		if(data.state.any_on == true) {
			$('#allLights').addClass('btn-primary').removeClass('btn-default');
		} else {
			$('#allLights').addClass('btn-default').removeClass('btn-primary');
		}
	});
	$.getJSON(allLights, function(data){
		$.each(data, function(i,a) {
			if(a.state.on == true){
				$('button[data-light="Light'+i+'"]').addClass('btn-primary').removeClass('btn-default');
				$('.colorShow[data-color="'+i+'"]').attr('style', 'border-color: #204d74; background: rgb('+cie_to_rgb(a.state.xy[0], a.state.xy[1])+');').html('<i class="hue-'+a.modelid+'"></i>');
			} else {
				$('button[data-light="Light'+i+'"]').addClass('btn-default').removeClass('btn-primary');
				$('.colorShow[data-color="'+i+'"]').removeAttr('style').html('<i class="hue-'+a.modelid+'"></i>');
			}
		});
	});
	sensors();
}

//get sensors
function sensors() {
	$.getJSON(allSensors, function(data){
		var sensor = '<div class="panel panel-default">';
		sensor += '<div class="panel-heading">';
		sensor += 'Sensors/Switches';
		sensor += '</div>';
		sensor += '<div class="panel-body">';
		sensor += '<div class="list-group">';
		$.each(data, function(i,a) {
			var daylight = a.state.daylight,
				button = a.state.buttonevent,
				motion = a.state.status,
				movement = a.state.presence,
				tholddark = a.config.tholddark,
				tholdoffset = a.config.tholdoffset,
				lightlevel = a.state.lightlevel,
				temp = parseFloat(a.state.temperature) / 100;
			if(motion == true && a.type == 'HA_GEOFENCE') {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				sensor += '<i class="mdi mdi-run-fast"></i> '+moment(a.state.lastupdated).fromNow();
				sensor += '</div>';
			}
			if(motion == false && a.type == 'HA_GEOFENCE') {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				sensor += '<i class="mdi mdi-do-not-disturb"></i> '+moment(a.state.lastupdated).fromNow();
				sensor += '</div>';
			}
			if(movement == true && a.type == 'ZLLPresence') {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				sensor += '<i class="mdi mdi-run-fast"></i> '+moment(a.state.lastupdated).fromNow();
				sensor += '</div>';
			}
			if(movement == false && a.type == 'ZLLPresence') {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				sensor += '<i class="mdi mdi-do-not-disturb"></i> '+moment(a.state.lastupdated).fromNow();
				sensor += '</div>';
			}
			sensor += '<div class="list-group-item list-group-item-info '+a.modelid+' '+a.type+'" sensor'+i+'>';
			sensor += '<i class="hue-'+a.modelid+'"></i> ';
			sensor += a.name;
			sensor += '</div>';
			if(exists(daylight)){
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				switch (daylight) {
					case true:
					sensor += '<i class="mdi mdi-weather-sunny"></i> Day';
					break;
					case false:
					sensor += '<i class="mdi mdi-weather-night"></i> Night';
					break;
				}
				sensor += '</div>';
			}
			if(exists(button)) {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				switch (button) {
					case 1000:
					sensor += '<i class="mdi mdi-window-minimize"></i>&nbsp;';
					break;
					case 1001:
					sensor += '<i class="mdi mdi-window-minimize"></i>&nbsp;';
					break;
					case 1002:
					sensor += '<i class="mdi mdi-window-minimize"></i>&nbsp;';
					break;
					case 1003:
					sensor += '<i class="mdi mdi-window-minimize"></i>&nbsp;';
					break;
					case 2000:
					sensor += '<i class="hue-up"></i>&nbsp;';
					break;
					case 2001:
					sensor += '<i class="hue-up"></i>&nbsp;';
					break;
					case 2002:
					sensor += '<i class="hue-up"></i>&nbsp;';
					break;
					case 2003:
					sensor += '<i class="hue-up"></i>&nbsp;';
					break;
					case 3000:
					sensor += '<i class="hue-down"></i>&nbsp;';
					break;
					case 3001:
					sensor += '<i class="hue-down"></i>&nbsp;';
					break;
					case 3002:
					sensor += '<i class="hue-down"></i>&nbsp;';
					break;
					case 3003:
					sensor += '<i class="hue-down"></i>&nbsp;';
					break;
					case 4000:
					sensor += '<i class="hue-circle-o"></i>&nbsp;';
					break;
					case 4001:
					sensor += '<i class="hue-circle-o"></i>&nbsp;';
					break;
					case 4002:
					sensor += '<i class="hue-circle-o"></i>&nbsp;';
					break;
					case 4003:
					sensor += '<i class="hue-circle-o"></i>&nbsp;';
					break;
					case 34:
					sensor += '<i class="mdi mdi-numeric-1-box"></i>&nbsp;';
					break;
					case 16:
					sensor += '<i class="mdi mdi-numeric-2-box"></i>&nbsp;';
					break;
					case 17:
					sensor += '<i class="mdi mdi-numeric-3-box"></i>&nbsp;';
					break;
					case 18:
					sensor += '<i class="mdi mdi-numeric-4-box"></i>&nbsp;';
					break;
				}
				sensor += moment(a.state.lastupdated).fromNow();
				sensor += '</div>';
			}
			if(exists(temp)){
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				sensor += '<i class="mdi mdi-thermometer"></i>&nbsp;';
				sensor += temp.toFixed(2)+'&deg;C';
				sensor += '</div>';
			}
			if(exists(lightlevel)) {
				sensor += '<div class="list-group-item '+a.modelid+' sensor'+i+'">';
				if(lightlevel > tholdoffset){
					sensor += '<i class="mdi mdi-weather-sunny"></i> Sufficient Daylight';
				}
				if(lightlevel < tholdoffset){
					sensor += '<i class="mdi mdi-weather-night"></i> Light Will Activate';
				}
				sensor += '</div>';
			}
		});
		sensor += '</div>';
		sensor += '</div>';
		sensor += '</div>';
		$('#sensors').html(sensor);
	});
}

// get scenes
function scenes() {
	$.getJSON(allScenes, function(data){
		var scene = '';
	});
}

// turn all lights on/off
function group0onoff() {
	$('#allLights').on('click', function(){
		if($(this).hasClass('btn-primary')) {
			$.ajax({
				type: 'PUT',
				url: allGroups+'0'+'/action/',
				data: '{"on": false}'
			});
			$(this).addClass('btn-default').removeClass('btn-primary');
		} else {
			$.ajax({
				type: 'PUT',
				url: allGroups+'0'+'/action/',
				data: '{"on": true, "bri": 254}'
			});
			$(this).addClass('btn-primary').removeClass('btn-default');
		}
		updateEverything();
	});
}

// turn specific room on/off
function groupXonoff() {
	$('.roomController').on('click', function(){
		var room = $(this).data('room')
		if($(this).hasClass('btn-primary')){
			$.ajax({
			    type: 'PUT',
			    url: allGroups+room+'/action/',
			    data: '{"on": false}'
			});
		} else {
			$.ajax({
			    type: 'PUT',
			    url: allGroups+room+'/action/',
			    data: '{"on": true, "bri": 254}'
			});
		}
	});
}

// turn specific light on/off
function lightXonoff() {
	$('.lightController').on('click', function(){
		var bulb = $(this).data('bulb');
		if($(this).hasClass('btn-primary')){
			$.ajax({
			    type: 'PUT',
			    url: allLights+bulb+'/state/',
			    data: '{"on": false}'
			});
		}
		if($(this).hasClass('btn-default')){
			$.ajax({
			    type: 'PUT',
			    url: allLights+bulb+'/state/',
			    data: '{"on": true, "bri": 254}'
			});
		}
	//updateEverything();
	});
}

function getColor() {
	$('body').on('click', '.colorShow', function(){
		var $this = $(this),
			bg = $(this).data('value'),
			lampColour = $(this).data('color');
		$(this).ColorPickerSliders({
			color: bg,
			sliders: false,
			swatches: false,
			hsvpanel: true,
			order: {
				rgb: 1
			},
			onchange: function(container, color){
				$this.attr('style', 'background: rgb('+color.rgba.r+','+color.rgba.g+','+color.rgba.b+')')
				$.ajax({
				    type: 'PUT',
				    url: allLights+lampColour+'/state/',
				    data: JSON.stringify(HueService.colorToHueHsv(color.tiny.toRgbString()))
				});
			}
		}
		);
	});
	$(document).on('click', '.row', function(){
		$(".colorShow").blur();
	});
}

function editBridge() {
	$.getJSON(config, function(data){
		var stuff = '<div class="panel panel-default">';
		stuff += '<div class="panel-heading">';
		stuff += 'Bridge <div class="pull-right"><small>(Bridge ID: '+data.bridgeid+')</small></div>';
		stuff += '</div>';
		stuff += '<div class="panel-body">';
		stuff += '<div class="list-group">';
		stuff += '<div class="list-group-item">';
		stuff += '<i class="hue-'+data.modelid+'"></i>&nbsp;';
		stuff += '<a href="#" class="bridge" data-type="text" data-pk="1" data-title="Enter New Bridge Name">'+data.name+'</a>';
		stuff += '</div>';
		stuff += '</div>';
		stuff += '</div>';
		$('#config2').html(stuff);
		$('.bridge').editable({
			placement: 'bottom',
			type: 'text',
		});
		$('.bridge').on('save', function(e, params){
			$.ajax({
			    type: 'PUT',
			    url: config,
			    data: '{"name": "'+params.newValue+'"}'
			});
		}).done(function(){
			editBridge();
		});
	});
}

function editRooms() {
	$.getJSON(allGroups, function(data){
		var room = '<div class="panel panel-default">';
		room += '<div class="panel-heading">';
		room += 'Rooms';
		room += '</div>';
		room += '<div class="panel-body">';
		room += '<div class="list-group">';
		$.each(data, function(i,a) {
			room += '<div class="list-group-item">';
			var roomType = a.class;
			switch (roomType) {
				case 'Living room':
					room += '<i class="hue-living"></i>&nbsp;';
					break;
				case 'Kitchen':
					room += '<i class="hue-kitchen"></i>&nbsp;';
					break;
				case 'Dining':
					room += '<i class="hue-dining"></i>&nbsp;';
					break;
				case 'Bedroom':
					room += '<i class="hue-bedroom"></i>&nbsp;';
					break;
				case 'Kids bedroom':
					room += '<i class="kids_bedroom"></i>&nbsp;';
					break;
				case 'Bathroom':
					room += '<i class="hue-bathroom"></i>&nbsp;';
					break;
				case 'Nursery':
					room += '<i class="hue-nursery"></i>&nbsp;';
					break;
				case 'Recreation':
					room += '<i class="hue-recreation"></i>&nbsp;';
					break;
				case 'Office':
					room += '<i class="hue-office"></i>&nbsp;';
					break;
				case 'Gym':
					room += '<i class="hue-gym"></i>&nbsp;';
					break;
				case 'Hallway':
					room += '<i class="hue-hallway"></i>&nbsp;';
					break;
				case 'Toilet':
					room += '<i class="hue-toilet"></i>&nbsp;';
					break;
				case 'Front door':
					room += '<i class="hue-frontdoor"></i>&nbsp;';
					break;
				case 'Garage':
					room += '<i class="hue-garage"></i>&nbsp;';
					break;
				case 'Terrace':
					room += '<i class="hue-terrace"></i>&nbsp;';
					break;
				case 'Garden':
					room += '<i class="hue-garden"></i>&nbsp;';
					break;
				case 'Driveway':
					room += '<i class="hue-driveway"></i>&nbsp;';
					break;
				case 'Carport':
					room += '<i class="hue-carport"></i>&nbsp;';
					break;
				case 'Other':
					room += '<i class="mhue-other"></i>';
					break;
			}
			room += ' <a href="#" class="room" data-light="'+i+'" data-type="text" data-pk="1" data-title="Enter New Room Name">'+a.name+'</a> <div class="pull-right"><small>(Room ID: '+i+')</small></div>';
			room += '</div>';
		});
		room += '</div>';
		room += '</div>';
		$('#rooms').html(room);
		$('.room').editable({
			placement: 'bottom',
			type: 'text',
		});
		$('.room').on('save', function(e, params){
			var i = $(this).data('light');
			$.ajax({
			    type: 'PUT',
			    url: allGroups+i,
			    data: '{"name": "'+params.newValue+'"}'
			}).done(function(){
				editRooms();
			});
		});
	});
}

function editLights() {
	$.getJSON(allLights, function(data){
		var light = '<div class="panel panel-default">';
		light += '<div class="panel-heading">';
		light += 'Lights';
		light += '</div>';
		light += '<div class="panel-body">';
		light += '<div class="list-group">';
		$.each(data, function(i,a) {
			light += '<div class="list-group-item">';
			light += '<i class="hue-'+a.modelid+'"></i> ';
			light += ' <a href="#" class="light" data-lamp="'+i+'" data-type="text" data-pk="1" data-title="Enter New Light Name">'+a.name+'</a> <div class="pull-right"><small>(Lamp ID: '+i+')</small></div>';
			light += '</div>';
		});
		light += '</div>';
		$('#lights').html(light);
		$('.light').editable({
			placement: 'bottom',
			type: 'text',
		});
		$('.light').on('save', function(e, params){
			var i = $(this).data('lamp');
			$.ajax({
			    type: 'PUT',
			    url: allLights+i,
			    data: '{"name": "'+params.newValue+'"}'
			}).done(function(){
				editLights();
			});
		});
	});
}

function editSensors() {
	$.getJSON(allSensors, function(data){
		var sensor = '<div class="panel panel-default">';
		sensor += '<div class="panel-heading">';
		sensor += 'Sensors/Switches';
		sensor += '</div>';
		sensor += '<div class="panel-body">';
		sensor += '<div class="list-group">';
		$.each(data, function(i,a) {
			sensor += '<div class="list-group-item '+a.modelid+' '+a.type+' type">';
			sensor += '<i class="hue-'+a.modelid+'"></i> ';
			sensor += ' <a href="#" class="sensor" data-sensor="'+i+'" data-type="text" data-pk="1" data-title="Enter New sensor Name">'+a.name+'</a> <div class="pull-right"><small>(Sensor ID: '+i+')</small></div>';
			sensor += '</div>';
		});
		sensor += '</div>';
		$('#sensors2').html(sensor);
		$('.sensor').editable({
			placement: 'bottom',
			type: 'text',
		});
		$('.sensor').on('save', function(e, params){
			var i = $(this).data('sensor');
			$.ajax({
			    type: 'PUT',
			    url: allSensors+i,
			    data: '{"name": "'+params.newValue+'"}'
			}).done(function(){
				editSensors();
			});
		});
	});
}

// convert to hue
var HueService = {
	colorToHueHsv: function (color) {
		var jqc = $.Color(color);
		return {
			"hue" : Math.floor(65535 * jqc.hue() / 360),
			"sat": Math.floor(jqc.saturation() * 255),
			"bri": Math.floor(jqc.lightness() * 255)
		}
	}
}

// convert cie to rgb
function cie_to_rgb(x, y, brightness) {
	if (brightness === undefined) {
		brightness = 254;
	}
	var z = 1.0 - x - y;
	var Y = (brightness / 254);
	var X = (Y / y) * x;
	var Z = (Y / y) * z;
	var red 	=  X * 1.656492 - Y * 0.354851 - Z * 0.255038;
	var green 	= -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
	var blue 	=  X * 0.051713 - Y * 0.121364 + Z * 1.011530;
	if (red > blue && red > green && red > 1.0) {
		green = green / red;
		blue = blue / red;
		red = 1.0;
	}
	else if (green > blue && green > red && green > 1.0) {
		red = red / green;
		blue = blue / green;
		green = 1.0;
	}
	else if (blue > red && blue > green && blue > 1.0) {
		red = red / blue;
		green = green / blue;
		blue = 1.0;
	}
	red 	= red <= 0.0031308 ? 12.92 * red : (1.0 + 0.055) * Math.pow(red, (1.0 / 2.4)) - 0.055;
	green 	= green <= 0.0031308 ? 12.92 * green : (1.0 + 0.055) * Math.pow(green, (1.0 / 2.4)) - 0.055;
	blue 	= blue <= 0.0031308 ? 12.92 * blue : (1.0 + 0.055) * Math.pow(blue, (1.0 / 2.4)) - 0.055;
	red 	= Math.round(red * 255);
	green 	= Math.round(green * 255);
	blue 	= Math.round(blue * 255);
	if (isNaN(red))
		red = 0;
	if (isNaN(green))
		green = 0;
	if (isNaN(blue))
		blue = 0;
	return [red, green, blue];
}

function newUser() {
	$.ajax({
		type: 'POST',
		url: begin,
		data: '{"devicetype": "localHue#thisiscool"}',
		success: function(data) {
			console.log(data);
		}
	});
}

function lightType(modelid) {
	var icon = '';
	switch(modelid){
		case 'LST001':
			modelid = 'lightstrip';
			break;
		case 'LCT001':
			modelid = 'white_and_color_e27_b22';
			break;
		case 'LCT007':
			modelid = 'white_and_color_e27_b22';
			break;
		default:
			icon = 'white_and_color_e27_b22';
			break;
	}
}

// helper for data
function exists(data) {

	if(!data || data==null || data=='undefined' || typeof(data)=='undefined' || data=='none' ) return false;
	else return true;

}

function element_exists(id){
	if($(id).length > 0){
		return true;
	}
	return false;
}