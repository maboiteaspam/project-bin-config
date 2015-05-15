var _ = require('underscore');
var fs = require('fs');

var Config = function(){
  this.local = {};
  this.servers = {};
  this.profiles = {};
};

Config.prototype.load = function(){
  if(fs.existsSync(process.cwd()+'/machines.json'))
    this.servers = require(process.cwd()+'/machines.json');
  if(fs.existsSync(process.cwd()+'/profiles.json'))
    this.profiles = require(process.cwd()+'/profiles.json');
  if(fs.existsSync(process.cwd()+'/.local.json'))
    this.local = require(process.cwd()+'/.local.json');
  return this;
};
Config.prototype.write = function(){
  fs.writeFileSync(process.cwd()+'/.local.json', JSON.stringify(this.local.servers || {}));
  fs.writeFileSync(process.cwd()+'/machines.json', JSON.stringify(this.servers));
  fs.writeFileSync(process.cwd()+'/profiles.json', JSON.stringify(this.profiles));
  return this;
};

Config.prototype.get = function(poolId){
  var servers = _.clone(this.servers);
  var profiles = _.clone(this.profiles);
  var pool = [];

  if(poolId === "local"){
    var local = _.clone(this.local.servers || {});
    local.machineId = "local";
    local.profileData = _.clone(this.local.profileData || {});
    pool.push(local);
  }else if( poolId in servers ){
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

Config.prototype.setEnv = function(env, data){
  if(env==="local"){
    this.local.servers = data;
  }else{
    this.servers[env] = data;
  }
  return this;
};

Config.prototype.setProfile = function(profile, data){
  if(profile==="local"){
    this.local.profileData = data;
  }else{
    this.profiles[profile] = data;
  }
  return this;
};

module.exports = Config;
