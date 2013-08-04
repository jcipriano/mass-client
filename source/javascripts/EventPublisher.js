EventPublisher = function() {
  this.events = { };
};

EventPublisher.prototype.publish = function(event, data) {
  var i, scope, callback, callbacks, _results;
    
  if (this.events && this.events[event]) {
    callbacks = this.events[event];
      
    i = 0;
    _results = [];
    while (i < callbacks.length) {
      scope = callbacks[i].obj;
      callback = callbacks[i].func;
      callback.apply(scope ? scope : this, [data]);
      _results.push(i++);
    }
      
    return _results;
  }
};

EventPublisher.prototype.add = function(event, callback, scope) {
  if (!this.events[event]){
    this.events[event] = [];
  }
  var obj = { func: callback, obj: scope };
  return this.events[event].push(obj);
};
  
EventPublisher.prototype.remove = function(event, callback, scope) {
  var index, callbacks;
    
  if (this.events && this.events[event]) {
    callbacks = this.events[event];
    index = -1;
    
    for(var i = 0, len = callbacks.length; i < len; i++) {
      var obj = callbacks[i];
      if(obj.func === callback && obj.obj === scope){
        index = i;
        break;
      }
    }
    
    if(index === -1){
      return false;
    }
    return callbacks.splice(index, 1);
  }
};