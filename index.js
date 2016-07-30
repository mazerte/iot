var awsIot = require('aws-iot-device-sdk');
var Gpio = require('chip-gpio').Gpio;

// host: a31uv7d6jk29e7.iot.eu-west-1.amazonaws.com
// port: 8883
var thing = awsIot.thingShadow({
   keyPath: 'certs/private.pem.key',
  certPath: 'certs/certificate.pem.crt',
    caPath: 'certs/root-CA.crt',
  clientId: 'iot-chip-1',
    region: 'eu-west-1'
});

var led = 'off';
var ledGpio = new Gpio(6, 'out');
var clientTokenUpdate;

thing.on('connect', function() {
  console.log('connect');

  thing.register( 'iot-chip-1' );

  setTimeout( function() {

    var state = { state: { desired: { 
      led: led 
    }}};
    clientTokenUpdate = thing.update('iot-chip-1', state);
    
    if (clientTokenUpdate === null) {
      console.log('update shadow failed, operation still in progress');
    }
  }, 5000)
  
});

thing.on('status', function(name, stat, clientToken, stateObject) {
  console.log('received ' + stat + ' on ' + name + ': '+ JSON.stringify(stateObject));
});

thing.on('delta', function(name, stateObject) {
  console.log('received delta on ' + name + ': '+ JSON.stringify(stateObject));
  led = stateObject.state.led;
  ledGpio.write( led == 'off' ? 1 : 0 );
  console.log( ledGpio.read() );
});

thing.on('timeout', function(name, clientToken) {
  console.log('received timeout on ' + name + ' with token: ' + clientToken);
});

function exit() {
  ledGpio.unexport();
  process.exit();
}

process.on('SIGINT', exit);
