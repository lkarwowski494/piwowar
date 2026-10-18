module.exports = {
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(true),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn().mockResolvedValue(true),
          unloadAsync: jest.fn().mockResolvedValue(true),
          setOnPlaybackStatusUpdate: jest.fn((cb) => {
            // Immediately simulate finish
            if (cb) cb({ isLoaded: true, didJustFinish: true });
          })
        },
        status: { isLoaded: true }
      })
    }
  }
};
