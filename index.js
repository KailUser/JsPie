const http = require('http');
const net = require('net');
const readline = require('readline');

const checkWebsiteStatus = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`The website ${url} is up and running.`);
        resolve();
      } else {
        console.log(`The website ${url} returned a status code of ${res.statusCode}.`);
        reject();
      }
    }).on('error', (err) => {
      console.log(`The website ${url} is not responding: ${err.message}.`);
      reject();
    });
  });
};

const checkOpenPort = (port, host) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      console.log(`Port ${port} is open on host ${host}.`);
      socket.destroy();
      resolve();
    });
    socket.on('timeout', () => {
      console.log(`Connection to port ${port} on host ${host} timed out.`);
      socket.destroy();
      reject();
    });
    socket.on('error', (err) => {
      console.log(`Error connecting to port ${port} on host ${host}: ${err.message}.`);
      socket.destroy();
      reject();
    });
    socket.on('close', () => {
      console.log(`Port check for ${host}:${port} is complete.`);
    });
    socket.connect(port, host);
  });
};

const exit = () => {
  console.log('Exiting program.');
  process.exit();
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const menu = () => {
  rl.question('Which check to perform?\n1. Website status\n2. Open port\n3. Exit\n> ', (answer) => {
    if (answer === '1') {
      rl.question('Enter website URL: ', (url) => {
        checkWebsiteStatus(url)
          .then(menu)
          .catch(menu);
      });
    } else if (answer === '2') {
      rl.question('Enter host:port: ', (input) => {
        const [host, port] = input.split(':');
        checkOpenPort(port, host)
          .then(menu)
          .catch(menu);
      });
    } else if (answer === '3') {
      exit();
    } else {
      console.log('Invalid selection');
      menu();
    }
  });
};

menu();
