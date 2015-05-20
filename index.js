var _ = require('underscore');
var extend = require('node.extend');
var fs = require('fs');
var path = require('path-extra');

var Config = function(opt){
  this.local = {
    servers:{},
    profileData:{}
  };
  this.servers = {};
  this.profiles = {};
  this.opt = _.extend({
    serversPath: process.cwd()+'/machines.json',
    profilesPath: process.cwd()+'/machines.json',
    localUserPath: path.homedir()+'/.local.json',
    localProjectPath: process.cwd()+'/.local.json'
  }, opt);
};

Config.prototype.load = function(){
  if(fs.existsSync(this.opt.serversPath))
    this.servers = require(this.opt.serversPath);
  if(fs.existsSync(this.opt.profilesPath))
    this.profiles = require(this.opt.profilesPath);
  var localUser = {};
  if(fs.existsSync(this.opt.localUserPath))
    localUser = require(this.opt.localUserPath);
  var localProject = {};
  if(fs.existsSync(this.opt.localProjectPath))
    localProject = require(this.opt.localProjectPath);
  extend(true, this.local, localUser, localProject);
  return this;
};
Config.prototype.write = function(){
  if(Object.keys(this.local.servers).length || Object.keys(this.local.profileData).length)
    writeLocalConfig(this.opt, _.clone(this.local));
  if(Object.keys(this.profiles).length)
    fs.writeFileSync(process.cwd()+'/profiles.json', JSON.stringify(this.profiles));
  if(Object.keys(this.servers).length)
    fs.writeFileSync(process.cwd()+'/machines.json', JSON.stringify(this.servers));
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

Config.prototype.mergeEnv = function(env, data){
  if(env==="local"){
    extend(true, this.local.servers, data);
  }else{
    extend(true, this.servers[env], data);
  }
  return this;
};

Config.prototype.mergeProfile = function(profile, data){
  if(profile==="local"){
    extend(true, this.local.profileData, data);
  }else{
    extend(true, this.profiles[profile], data);
  }
  return this;
};

module.exports = Config;

/**
 * It will write both localUser and localConfig files appropriately.
 * localUser properties are updated
 *    if they exists in the new config.
 * localUser properties are removed
 *    if it does not exist in the new config.
 * if property exists in both new config and localUser
 *    About array, it keeps existing values of localUser in new config.
 *    About array, it removes values of localUser if they disappeared from new config.
 * Otherwise, it is saved into project config.
 *
 * @param opt
 * @param localConfig
 */
function writeLocalConfig (opt, localConfig){
  var localUser = {};
  if(fs.existsSync(opt.localUserPath))
    localUser = require(opt.localUserPath);

  function updateObject(obj, objToUpdate){
    Object.keys(objToUpdate).forEach(function (k) {
      if (_.isArray(objToUpdate[k])) {
        if (obj[k]) {
          objToUpdate[k].forEach(function (v, i) {
            var index = obj[k].indexOf(v);
            if (index==-1) {
              objToUpdate[k].splice(i, 1);
            } else {
              obj[k].splice(index, 1);
            }
          });
        } else {
          delete objToUpdate[k];
        }
      }else if (_.isObject(objToUpdate[k])) {
        if (obj[k]) {
          updateObject(obj[k], objToUpdate[k]);
        } else {
          delete objToUpdate[k];
        }
      }else {
        if (obj[k]) {
          objToUpdate[k] = obj[k];
          delete obj[k];
        }
      }
    });
  }

  updateObject(localConfig, localUser);

  if(localUser.servers && !Object.keys(localUser.servers).length)
    delete localUser.servers;
  if(localUser.profileData && !Object.keys(localUser.profileData).length)
    delete localUser.profileData;

  if(localConfig.servers && !Object.keys(localConfig.servers).length)
    delete localConfig.servers;
  if(localConfig.profileData && !Object.keys(localConfig.profileData).length)
    delete localConfig.profileData;

  if(localUser.servers || localUser.profileData)
    fs.writeFileSync(opt.localUserPath, JSON.stringify(localUser));
  if(localConfig.servers || localConfig.profileData)
    fs.writeFileSync(opt.localProjectPath, JSON.stringify(localConfig));
}
