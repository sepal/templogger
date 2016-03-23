var Particle = require('particle-api-js');
var graphite = require('graphite');
var nconf = require('nconf');

nconf.argv()
  .env();


if (!nconf.get('device') || !nconf.get('token')) {
  console.error('Device or token not set!');
  process.exit(1);
}

var particle = new Particle();

var particleToken = nconf.get('token');
var particleDevice = nconf.get('device');

console.log(`Creating graphite client on ${nconf.get('graphite')}`);
var client = graphite.createClient(nconf.get('graphite'));

console.log(client);

particle.getEventStream({deviceId: particleDevice, auth: particleToken, name: '/weather'}).then((stream) => {
  stream.on('event', function (data) {
    var time = new Date(data.published_at);
    try {
      console.log(data.data);
      var weather = JSON.parse(data.data);

      var temp = {
        'weather.temp' : weather.temp
      };

      var hum = {
        'weather.humidity' : weather.humidity
      };

      client.write(temp, function(err) {
        if (err != null) {
          console.error(`Error while writing temperature to graphite: ${err}`);
        }
      });

      client.write(hum, function(err) {
        if (err != null) {
          console.error(`Error while writing humidity to graphite: ${err}`);
        }
      });


      console.log(`Logged temperature with ${weather.temp} and humidity ${weather.humidity}`);
    } catch (e) {
      console.error(`Could not parse weather data from particle: ${e}`);
    }
  });
}).catch((error) => {
  console.err(`Could not connect to particle cloud: ${error}`);
  process.exit(1);
});
