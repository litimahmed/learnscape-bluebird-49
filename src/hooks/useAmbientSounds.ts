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
  const playIdRef = useRef(0);
  const pendingAudioRef = useRef<HTMLAudioElement | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);

  // Keep volume ref in sync
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // cancel any pending operations
      playIdRef.current++;
      if (loadTimeoutRef.current !== null) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (pendingAudioRef.current) {
        try { pendingAudioRef.current.pause(); } catch {}
        pendingAudioRef.current.src = '';
        pendingAudioRef.current = null;
      }
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const stopSound = useCallback(() => {
    // Invalidate any pending playback
    playIdRef.current++;

    // Clear any scheduled retry
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Stop pending audio (not yet started)
    if (pendingAudioRef.current) {
      try { pendingAudioRef.current.pause(); } catch {}
      pendingAudioRef.current.currentTime = 0;
      pendingAudioRef.current.src = '';
      pendingAudioRef.current = null;
    }

    // Stop active audio
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }

    setIsPlaying(false);
    setCurrentSound(null);
    setIsLoading(false);
  }, []);

  const playSound = useCallback(async (sound: AmbientSound) => {
    // Invalidate any previous pending play and mark this call
    const thisPlayId = ++playIdRef.current;

    setIsLoading(true);

    // Clear any scheduled retry from previous attempts
    if (loadTimeoutRef.current !== null) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Stop and clear any existing/pending audio
    if (pendingAudioRef.current) {
      try { pendingAudioRef.current.pause(); } catch {}
      pendingAudioRef.current.src = '';
      pendingAudioRef.current = null;
    }
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
      pendingAudioRef.current = audio;

      let started = false;
      const startPlayback = () => {
        if (started) return;
        if (playIdRef.current !== thisPlayId) return; // cancelled/switched
        audio.play().then(() => {
          if (playIdRef.current !== thisPlayId) {
            // Play succeeded but already cancelled
            try { audio.pause(); } catch {}
            return;
          }
          started = true;
          audioRef.current = audio;
          pendingAudioRef.current = null;
          setCurrentSound(sound);
          setIsPlaying(true);
          setIsLoading(false);
          if (loadTimeoutRef.current !== null) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
        }).catch(() => {
          // Will retry on 'canplay' or timeout
        });
      };

      const handleError = () => {
        if (playIdRef.current !== thisPlayId) return;
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
      loadTimeoutRef.current = window.setTimeout(() => startPlayback(), 300);

    } catch (error) {
      if (playIdRef.current !== thisPlayId) return;
      console.error('Error setting up ambient sound:', error);
      setIsLoading(false);
    }
  }, []);

  const toggleSound = useCallback((sound: AmbientSound) => {
    // If same sound is playing, stop it
    if (isPlaying && currentSound?.id === sound.id) {
      stopSound();
      return;
    }
    // Otherwise start (this will cancel any pending/active audio safely)
    playSound(sound);
  }, [isPlaying, currentSound, playSound, stopSound]);

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