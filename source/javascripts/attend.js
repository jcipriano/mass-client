#= require "mass"

mass.events.add('CONNECT', function() {

  console.log('yo yo');
  
  mass.pubnub.publish({
    channel: "mass_channel",
    message: {
      type: 'ATTEND'
    }
  });
  
});
