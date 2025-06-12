const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const options = {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  reconnectPeriod: 1000, // 1 second
};

const client = mqtt.connect(MQTT_BROKER_URL, options);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

client.on('close', () => {
  console.log('MQTT connection closed');
});

// Publish a message to a topic
function publish(topic, message, options = { qos: 1 }) {
  client.publish(topic, JSON.stringify(message), options, (err) => {
    if (err) {
      console.error('MQTT publish error:', err);
    } else {
      console.log(`Published to ${topic}:`, message);
    }
  });
}

// Subscribe to a topic
function subscribe(topic, handler, options = { qos: 1 }) {
  client.subscribe(topic, options, (err) => {
    if (err) {
      console.error('MQTT subscribe error:', err);
    } else {
      console.log(`Subscribed to ${topic}`);
    }
  });
  client.on('message', (msgTopic, payload) => {
    if (msgTopic === topic) {
      try {
        const data = JSON.parse(payload.toString());
        handler(data, msgTopic);
      } catch (e) {
        console.error('Error parsing MQTT message:', e);
      }
    }
  });
}

module.exports = {
  client,
  publish,
  subscribe,
};
