const bands = require('./bands.json');
const concerts = require('./concerts.json');
const venues = require('./venues.json');

module.exports = () => ({
  bands,
  concerts,
  venues
})