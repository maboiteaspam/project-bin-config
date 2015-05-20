require('should');
var fs = require('fs-extra');
var path = require('path');

var Config = require('../index.js');
var fixturesPath = path.join(__dirname, 'fixtures');
var opts = {
  serversPath: fixturesPath+'/machines.json',
  profilesPath: fixturesPath+'/machines.json',
  localUserPath: fixturesPath+'/.localUser.json',
  localProjectPath: fixturesPath+'/.localProject.json'
};

before(function () {
  fs.ensureDirSync(fixturesPath);
  fs.emptyDirSync(fixturesPath);
});

describe('project-config', function () {
  before(function () {
    fs.writeFileSync(fixturesPath+'/.localUser.json', JSON.stringify({profileData:{some:'path', 'else':{w:'y'},p:['a','b']}}));
  });
  it('should work.', function () {
    new Config(opts).load().mergeProfile('local', {
      some:'notpath',
      p:['a','c'],
      someOther:'other'
    }).write();
    new Config(opts).load().get('local').forEach(function(v){
      v.profileData.some.should.eql('notpath');
    });

    JSON.parse(fs.readFileSync(opts.localUserPath)).profileData.some.should.eql('notpath');
    JSON.parse(fs.readFileSync(opts.localUserPath)).profileData.else.w.should.eql('y');
    JSON.parse(fs.readFileSync(opts.localUserPath)).profileData.p.should.eql(['a']);

    JSON.parse(fs.readFileSync(opts.localProjectPath)).profileData.someOther.should.eql('other');
    JSON.parse(fs.readFileSync(opts.localProjectPath)).profileData.p.should.eql(['c']);
  });
});