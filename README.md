# project-bin-config

API to manage per project configuration.

It can identify up to three files,

    - .local.json
    - machines.json
    - profiles.json

# Install

```sh
npm i project-bin-config --save
```

# API

```js
  var Config = require('project-bin-config');
  new Config().load().get(env).forEach(function(machine){
    console.log(machine);
  });
```

# Configuration

Create a ```.local.json``` file on root directory of your project.

```json
{
  "servers":{
  },
  "profileData":{
  }
}
```

Create a ```machines.json``` file on root directory of your project.

```json
{
  "machine1":{
  },
  "machine2":{
  },
  ":pool":{
  }
}
```

Create a ```profiles.json``` file on root directory of your project.

```json
{
  "profile1":{
  },
  "profile2":{
  }
}
```

