#= require "mass"

$(function() {

  $('.pad').mousedown(function(){
    console.log('mousedown');
    
    var ctrlId = $(this).data().controlid;
    
    mass.pubnub.publish({
      channel: "mass_channel",
      message: {
        type: 'MIDI',
        data: [144, ctrlId, 100]
      }
    });
    
  });

  $('.pad').mouseup(function(){
    console.log('mouseup');
    
    var ctrlId = $(this).data().controlid;
    
    mass.pubnub.publish({
      channel: "mass_channel",
      message: {
        type: 'MIDI',
        data: [128, ctrlId, 100]
      }
    });
    
  });
  
});