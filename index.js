var _ = require('underscore');
var fs = require('fs');

var MachineSelector = function(){
  this.servers = {};
  this.profiles = {};
};

MachineSelector.prototype.load = function(){
  this.servers = require(process.cwd()+'/machines.json');
  this.profiles = require(process.cwd()+'/profiles.json');
  return this;
};
MachineSelector.prototype.write = function(){
  fs.writeFileSync(process.cwd()+'/machines.json', JSON.stringify(this.servers));
  fs.writeFileSync(process.cwd()+'/profiles.json', JSON.stringify(this.profiles));
  return this;
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
