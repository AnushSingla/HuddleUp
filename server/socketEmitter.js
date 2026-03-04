/**
 * Central place to emit Socket.io events from anywhere (e.g. controllers).
 * Server sets the io instance on startup to avoid circular dependencies.
 */
let _io = null;

function setIO(io) {
  _io = io;
}

function emitFeedEvent(event, data) {
  if (_io) _io.to("feed_room").emit(event, data);
}

module.exports = { setIO, emitFeedEvent };
