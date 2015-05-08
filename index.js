var _ = require('underscore');
var fs = require('fs');

var MachineSelector = function(){
  this.servers = {};
  this.profiles = {};
};

MachineSelector.prototype.load = function(){
  this.servers = require('machines.json');
  this.profiles = require('profiles.json');
};
MachineSelector.prototype.write = function(){
  fs.writeFileSync('machines.json', JSON.stringify(this.servers));
  fs.writeFileSync('profiles.json', JSON.stringify(this.profiles));
};

MachineSelector.prototype.get = function(poolId){
  var servers = _.clone(this.servers);
  var profiles = _.clone(this.profiles);
  var pool = [];
  if( poolId in servers ){
    if( !servers[poolId].pool){
      servers[poolId].pool = [poolId];
    }
    servers[poolId].pool.forEach(function(machineId){
      pool.push( _.extend({machineId:machineId}, servers[poolId], servers[machineId]) );
    });
    pool.forEach(function(machineData){
      if( profiles[machineData.profile] ){
        machineData.profileData = profiles[machineData.profile];
      }else if (profiles[machineData.machineId] ){
        machineData.profileData = profiles[machineData.machineId];
      }else {
        machineData.profileData = {};
      }
    });
  }
  return pool;
};

module.exports = MachineSelector;
