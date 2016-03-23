var Particle = require('particle-api-js');
var graphite = require('graphite');

var particle = new Particle();

var particleToken = '2f556a89ad71889f2195f85bc787db46aa5f6804';
var particleDevice = '55ff66065075555342421787';

var client = graphite.createClient('plaintext://guest:guest@192.168.99.100:2003/');

console.log("Started logging");

particle.getEventStream({deviceId: particleDevice, auth: particleToken, name: '/weather'}).then((stream) => {
  stream.on('event', function (data) {
    var time = new Date(data.published_at);
    try {
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
});
