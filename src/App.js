import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

const App = () => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [player, setPlayer] = useState(null);
  const [pitchShift, setPitchShift] = useState(null);
  const [pitch, setPitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cleanupAudio = useCallback(() => {
    if (player) {
      player.stop();
      player.disconnect();
      setPlayer(null);
    }
    if (pitchShift) {
      pitchShift.disconnect();
      setPitchShift(null);
    }
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  }, [player, pitchShift]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  useEffect(() => {
    if (audioSrc) {
      setupTonePlayer();
    }
  }, [audioSrc]);

  useEffect(() => {
    if (pitchShift) {
      pitchShift.pitch = pitch;
    }
  }, [pitch, pitchShift]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && isPlaying) {
        setCurrentTime(player.state === 'started' ? player.currentTime : 0);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const setupTonePlayer = async () => {
    setIsLoading(true);
    setError(null);
    cleanupAudio();

    try {
      await Tone.start();

      const newPlayer = new Tone.Player({
        url: audioSrc,
        loop: false,
        autostart: false,
        onload: () => {
          setDuration(newPlayer.buffer.duration);
          setIsLoading(false);
        },
      }).toDestination();

      const newPitchShift = new Tone.PitchShift({ pitch }).toDestination();
      newPlayer.connect(newPitchShift);

      setPlayer(newPlayer);
      setPitchShift(newPitchShift);
    } catch (err) {
      console.error("Error setting up audio:", err);
      setError("Failed to load audio. Please try again.");
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioSrc(objectUrl);
    }
  };

  const handlePitchChange = (event) => {
    setPitch(Number(event.target.value));
  };

  const togglePlayPause = () => {
    if (player && player.loaded) {
      if (player.state === 'started') {
        player.stop();
        setIsPlaying(false);
      } else {
        player.start();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (event) => {
    if (player && player.loaded) {
      const seekTime = parseFloat(event.target.value);
      player.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      {isLoading && <p>Loading audio...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {audioSrc && !isLoading && !error && (
        <div>
          <button onClick={togglePlayPause} disabled={!player || !player.loaded}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            step="0.1"
          />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div>
            <label htmlFor="pitch-slider">Pitch: {pitch}</label>
            <input
              id="pitch-slider"
              type="range"
              min="-100"
              max="100"
              step="1"
              value={pitch}
              onChange={handlePitchChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
