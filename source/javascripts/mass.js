#= require "EventPublisher"

var mass = {};

mass.events = new EventPublisher();

mass.init = function() {
  
  this.pubnub = PUBNUB.init({
      publish_key: 'pub-c-a7fcdbd9-359e-4df7-b71a-6e227656f161',
      subscribe_key: 'sub-c-4ac38ffa-fc09-11e2-b598-02ee2ddab7fe'
  });
  
  var that = this;
  
  this.pubnub.subscribe({
      channel: "mass_channel",
      connect: function(channel) {
        that.onConnect(channel);
      },
      message: function(msg){
        that.onMessage(msg);
      }
  })
};

mass.onConnect = function(channel) {
  console.log('Pubnub: Connected.');
  mass.events.publish('CONNECT', channel);
};

mass.onMessage = function(msg) {
  console.log(msg);
  mass.events.publish('MESSAGE', msg);
};

$(function(){
  mass.init();
});