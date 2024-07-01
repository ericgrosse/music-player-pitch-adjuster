import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const App = () => {
  const [player, setPlayer] = useState(null);
  const [pitchShift, setPitchShift] = useState(null);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    // Update pitch when the slider changes
    if (pitchShift) {
      pitchShift.pitch = pitch;
    }
  }, [pitch, pitchShift]);

  const handleClick = async () => {
    const url = "https://upload.wikimedia.org/wikipedia/commons/9/90/De-Wolfgang_Amadeus_Mozart.ogg";

    await Tone.start();

    // Stop the previous player if it exists
    if (player) {
      player.stop();
    }

    // Create a new player
    const newPlayer = new Tone.Player({
      url,
      loop: false,
      autostart: false,
    });

    await Tone.loaded();
    const newPitchShift = new Tone.PitchShift({ pitch }).toDestination();
    newPlayer.connect(newPitchShift);
    newPlayer.start();

    // Update the player and pitchShift states
    setPlayer(newPlayer);
    setPitchShift(newPitchShift);
  };

  const handlePitchChange = (event) => {
    setPitch(Number(event.target.value));
  };

  return (
    <div>
      <button onClick={handleClick}>Play Audio</button>
      <div>
        <label htmlFor="pitch-slider">Pitch: {pitch}</label>
        <input
          id="pitch-slider"
          type="range"
          min="-12"
          max="12"
          step="1"
          value={pitch}
          onChange={handlePitchChange}
        />
      </div>
    </div>
  );
};

export default App;
