var ip			= 'http://192.168.0.11',
	user		= '95VxnnLcAXkqJ3kTQA91bBrY8HC-3-bcVmc2h8mK',
	config		= ip+'/api/'+user+'/config/',
	allGroups	= ip+'/api/'+user+'/groups/',
	allLights	= ip+'/api/'+user+'/lights/',
	allSensors	= ip+'/api/'+user+'/sensors/';

$(function() {

	editConfig();
	editRooms();
	editLights();
	editSensors();

});

function editConfig() {
	$.getJSON(config, function(data){
		stuff = '';
		stuff += '<div class="list-group">';
		stuff += '<div class="list-group-item list-group-item-info">';
		stuff += '<i class="hue-'+data.modelid+'"></i> ';
		stuff += '<a href="#" class="bridge" data-type="text" data-pk="1" data-title="Enter New Bridge Name">'+data.name+'</a>';
		stuff += '</div>';
		stuff += '<div class="list-group-item">';
		stuff += '<a href="/" class="btn btn-default btn-sm"><i class="hue-LCT001"></i> Back to hue</a>';
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
			editConfig();
		});

	});
}

function editRooms() {
	$.getJSON(allGroups, function(data){
		var room = '<div class="list-group">';
		$.each(data, function(i,a) {
			room += '<div class="list-group-item">';
			var roomType = a.class;
			switch (roomType) {
				case 'Living room':
					room += '<i class="hue-living"></i>';
					break;
				case 'Kitchen':
					room += '<i class="hue-kitchen"></i>';
					break;
				case 'Dining':
					room += '<i class="hue-dining"></i>';
					break;
				case 'Bedroom':
					room += '<i class="hue-bedroom"></i>';
					break;
				case 'Kids bedroom':
					room += '<i class="kids_bedroom"></i>';
					break;
				case 'Bathroom':
					room += '<i class="hue-bathroom"></i>';
					break;
				case 'Nursery':
					room += '<i class="hue-nursery"></i>';
					break;
				case 'Recreation':
					room += '<i class="hue-recreation"></i>';
					break;
				case 'Office':
					room += '<i class="hue-office"></i>';
					break;
				case 'Gym':
					room += '<i class="hue-gym"></i>';
					break;
				case 'Hallway':
					room += '<i class="hue-hallway"></i>';
					break;
				case 'Toilet':
					room += '<i class="hue-toilet"></i>';
					break;
				case 'Front door':
					room += '<i class="hue-frontdoor"></i>';
					break;
				case 'Garage':
					room += '<i class="hue-garage"></i>';
					break;
				case 'Terrace':
					room += '<i class="hue-terrace"></i>';
					break;
				case 'Garden':
					room += '<i class="hue-garden"></i>';
					break;
				case 'Driveway':
					room += '<i class="hue-driveway"></i>';
					break;
				case 'Carport':
					room += '<i class="hue-carport"></i>';
					break;
				case 'Other':
					room += '<i class="mhue-other"></i>';
					break;
			}
			room += ' <a href="#" class="room" data-light="'+i+'" data-type="text" data-pk="1" data-title="Enter New Room Name">'+a.name+'</a>';
			room += '</div>';
		});
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
		var light = '<div class="list-group">';
		$.each(data, function(i,a) {
			light += '<div class="list-group-item">';
			light += '<i class="hue-'+a.modelid+'"></i> ';
			light += ' <a href="#" class="light" data-lamp="'+i+'" data-type="text" data-pk="1" data-title="Enter New Light Name">'+a.name+'</a>';
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
		var sensor = '<div class="list-group">';
		$.each(data, function(i,a) {
			sensor += '<div class="list-group-item '+a.modelid+' '+a.type+'">';
			sensor += '<i class="hue-'+a.modelid+'"></i> ';
			sensor += ' <a href="#" class="sensor" data-sensor="'+i+'" data-type="text" data-pk="1" data-title="Enter New sensor Name">'+a.name+'</a>';
			sensor += '</div>';
		});
		sensor += '</div>';
		$('#sensors').html(sensor);
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