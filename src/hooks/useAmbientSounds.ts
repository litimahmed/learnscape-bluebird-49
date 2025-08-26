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
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('ambientSoundVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.3;
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);

  // Keep volume ref in sync
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSound(null);
    setIsLoading(false);
  }, []);

  const playSound = useCallback(async (sound: AmbientSound) => {
    if (isLoading) return; // Prevent multiple simultaneous loads

    setIsLoading(true);

    // Clean up existing audio
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current.src = '';
      audioRef.current = null;
    }

    try {
      // Create new audio element
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = volumeRef.current;

      let started = false;
      const startPlayback = () => {
        if (started) return;
        audio.play().then(() => {
          started = true;
          audioRef.current = audio;
          setCurrentSound(sound);
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(() => {
          // Will retry on 'canplay' or timeout
        });
      };

      const handleError = () => {
        console.error('Error loading sound:', sound.audioUrl);
        setIsLoading(false);
      };

      audio.addEventListener('canplay', startPlayback, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      // Start loading
      audio.src = sound.audioUrl;
      audio.load();

      // Immediate attempt (cached/fast starts)
      startPlayback();

      // Short retry to reduce perceived lag if 'canplay' is slow
      setTimeout(() => startPlayback(), 300);

    } catch (error) {
      console.error('Error setting up ambient sound:', error);
      setIsLoading(false);
    }
  }, [isLoading]);

  const toggleSound = useCallback((sound: AmbientSound) => {
    if (isLoading) return;

    if (isPlaying && currentSound?.id === sound.id) {
      stopSound();
    } else {
      playSound(sound);
    }
  }, [isPlaying, currentSound, isLoading, playSound, stopSound]);

  const changeVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    volumeRef.current = newVolume;
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
    isLoading,
    playSound,
    stopSound,
    toggleSound,
    changeVolume,
  };
};