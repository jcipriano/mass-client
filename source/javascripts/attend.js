#= require "mass"

mass.events.add('CONNECT', function() {

  
  TweenLite.to('#attend', 1, {autoAlpha: 1});
  
  $('#attend').click(function(){
    console.log('Attending . . .');
    
    TweenLite.to('#attend', 1, {autoAlpha: 0});
    TweenLite.to('#exit', 1, {delay: 1, autoAlpha: 1});
    
    mass.pubnub.publish({
      channel: "mass_channel",
      message: {
        type: 'ATTEND'
      }
    });
  });

  $('#exit').click(function(){
    
    TweenLite.to('#exit', 1, {autoAlpha: 0});
    TweenLite.to('#attend', 1, {delay: 1, autoAlpha: 1});
    
    mass.pubnub.publish({
      channel: "mass_channel",
      message: {
        type: 'EXIT'
      }
    });
  });
  
});
