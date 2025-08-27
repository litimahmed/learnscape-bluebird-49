import { useState, useEffect, useRef, useCallback } from 'react';

interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
  description: string;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'bird-sound',
    name: 'Birds',
    icon: '◦',
    audioUrl: '/sounds/ambients/bird sound.mp3',
    description: 'Gentle bird chirping'
  },
  {
    id: 'bird-sound-2',
    name: 'Forest Birds',
    icon: '◈',
    audioUrl: '/sounds/ambients/bird sound 2.mp3',
    description: 'Forest ambience with birds'
  },
  {
    id: 'bird-sound-3',
    name: 'Morning Birds',
    icon: '◐',
    audioUrl: '/sounds/ambients/bird sound 3 (2).mp3',
    description: 'Morning bird sounds'
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: '●',
    audioUrl: '/sounds/ambients/rain.mp3',
    description: 'Soft rainfall for focus'
  }
];

export const useAmbientSounds = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSound | null>(null);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('ambientSoundVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.3;
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  const playSound = useCallback(async (sound: AmbientSound) => {
    try {
      // Stop current sound
      stopSound();

      // Create new audio element
      const audio = new Audio(sound.audioUrl);
      audio.loop = true;
      audio.volume = volume;
      
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      // Play the audio
      await audio.play();

      // Store reference
      audioRef.current = audio;
      setCurrentSound(sound);
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing ambient sound:', error);
    }
  }, [volume]);

  const stopSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      setIsPlaying(false);
      setCurrentSound(null);
    } catch (error) {
      console.error('Error stopping ambient sound:', error);
    }
  }, []);

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (isPlaying && currentSound?.id === sound.id) {
      stopSound();
    } else {
      playSound(sound);
    }
  }, [isPlaying, currentSound, playSound, stopSound]);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('ambientSoundVolume', newVolume.toString());
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  return {
    sounds: AMBIENT_SOUNDS,
    isPlaying,
    currentSound,
    volume,
    playSound,
    stopSound,
    toggleSound,
    changeVolume,
  };
};