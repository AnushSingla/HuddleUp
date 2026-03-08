let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

const getContentRoom = ({ videoId, postId }) => {
  if (videoId) return `video_${videoId}`;
  if (postId) return `post_${postId}`;
  return null;
};

const emitToContentRoom = (event, payload) => {
  if (!ioInstance) return;

  const room = getContentRoom({
    videoId: payload.videoId,
    postId: payload.postId,
  });

  if (!room) return;

  ioInstance.to(room).emit(event, payload);
};

module.exports = {
  setIO,
  getIO,
  getContentRoom,
  emitToContentRoom,
};

