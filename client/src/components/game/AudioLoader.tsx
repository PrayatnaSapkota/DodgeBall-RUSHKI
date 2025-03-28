import React, { useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';

/**
 * Component that loads audio files and initializes the audio store
 */
const AudioLoader: React.FC = () => {
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound,
    isMuted,
    toggleMute
  } = useAudio();

  // Load audio files
  useEffect(() => {
    // Create background music element
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
    
    // Create sound effect elements
    const hit = new Audio('/sounds/hit.mp3');
    hit.volume = 0.3;
    
    const success = new Audio('/sounds/success.mp3');
    success.volume = 0.2;
    
    // Set up the audio elements in the store
    setBackgroundMusic(bgMusic);
    setHitSound(hit);
    setSuccessSound(success);
    
    // Cleanup function
    return () => {
      // Stop any playing audio on unmount
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Handle background music playback based on mute state
  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    
    if (!backgroundMusic) return;
    
    if (isMuted) {
      backgroundMusic.pause();
    } else {
      // Try to play music - browsers may block autoplay
      const playPromise = backgroundMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay was prevented. User interaction needed.", error);
        });
      }
    }
  }, [isMuted]);

  // Return a button to toggle mute/unmute
  return (
    <button 
      onClick={toggleMute}
      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        // Muted icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        // Unmuted icon
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
};

export default AudioLoader;