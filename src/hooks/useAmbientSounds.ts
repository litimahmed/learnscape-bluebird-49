import { useState, useEffect, useRef, useCallback } from 'react';

interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioUrl: string;
  description: string;
}

interface LoadedSound extends AmbientSound {
  audio: HTMLAudioElement;
  isLoaded: boolean;
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'bird-sound',
    name: 'Birds',
    icon: '🐦',
    audioUrl: '/sounds/ambients/bird sound.mp3',
    description: 'Gentle bird chirping'
  },
  {
    id: 'bird-sound-2',
    name: 'Forest Birds',
    icon: '🌲',
    audioUrl: '/sounds/ambients/bird sound 2.mp3',
    description: 'Forest ambience with birds'
  },
  {
    id: 'bird-sound-3',
    name: 'Morning Birds',
    icon: '🌅',
    audioUrl: '/sounds/ambients/bird sound 3 (2).mp3',
    description: 'Morning bird sounds'
  },
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    audioUrl: '/sounds/ambients/rain.mp3',
    description: 'Soft rainfall for focus'
  }
];

export const useAmbientSounds = () => {
  const [loadedSounds, setLoadedSounds] = useState<Map<string, LoadedSound>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSound | null>(null);
  const [isLoading, setIsLoading] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('ambientSoundVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedRef = useRef<Map<string, LoadedSound>>(new Map());

  // Preload all sounds
  useEffect(() => {
    const preloadSounds = async () => {
      const loadPromises = AMBIENT_SOUNDS.map(async (sound) => {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.loop = true;
          audio.volume = volume;
          
          // Wait for the audio to be loaded
          await new Promise<void>((resolve, reject) => {
            const onCanPlayThrough = () => {
              audio.removeEventListener('canplaythrough', onCanPlayThrough);
              audio.removeEventListener('error', onError);
              resolve();
            };
            
            const onError = (e: any) => {
              audio.removeEventListener('canplaythrough', onCanPlayThrough);
              audio.removeEventListener('error', onError);
              console.warn(`Failed to preload sound: ${sound.name}`, e);
              resolve(); // Don't reject, just continue
            };
            
            audio.addEventListener('canplaythrough', onCanPlayThrough);
            audio.addEventListener('error', onError);
            audio.src = sound.audioUrl;
            audio.load();
          });

          const loadedSound: LoadedSound = {
            ...sound,
            audio,
            isLoaded: true
          };
          
          preloadedRef.current.set(sound.id, loadedSound);
          return loadedSound;
        } catch (error) {
          console.warn(`Failed to preload sound: ${sound.name}`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(loadPromises);
      const loadedMap = new Map<string, LoadedSound>();
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          loadedMap.set(AMBIENT_SOUNDS[index].id, result.value);
        }
      });
      
      setLoadedSounds(loadedMap);
    };

    preloadSounds();

    // Cleanup function
    return () => {
      stopSound();
      preloadedRef.current.forEach(sound => {
        sound.audio.pause();
        sound.audio.src = '';
      });
      preloadedRef.current.clear();
    };
  }, []);

  // Update volume for all loaded sounds
  useEffect(() => {
    preloadedRef.current.forEach(sound => {
      sound.audio.volume = volume;
    });
  }, [volume]);

  const stopSound = useCallback(() => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
        activeAudioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentSound(null);
    } catch (error) {
      console.error('Error stopping ambient sound:', error);
    }
  }, []);

  const playSound = useCallback(async (sound: AmbientSound) => {
    try {
      setIsLoading(prev => new Set([...prev, sound.id]));
      
      // Always stop current sound first
      stopSound();

      const loadedSound = preloadedRef.current.get(sound.id);
      if (!loadedSound) {
        console.warn(`Sound not loaded: ${sound.name}`);
        return;
      }

      const audio = loadedSound.audio;
      
      // Reset and prepare audio
      audio.currentTime = 0;
      audio.volume = volume;
      
      // Play the audio
      await audio.play();
      
      // Set as active
      activeAudioRef.current = audio;
      setCurrentSound(sound);
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing ambient sound:', error);
      setIsPlaying(false);
      setCurrentSound(null);
    } finally {
      setIsLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(sound.id);
        return newSet;
      });
    }
  }, [volume, stopSound]);

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
    
    // Update volume for all preloaded sounds
    preloadedRef.current.forEach(sound => {
      sound.audio.volume = newVolume;
    });
  }, []);

  const isSoundLoaded = useCallback((soundId: string) => {
    return preloadedRef.current.has(soundId);
  }, []);

  const isSoundLoading = useCallback((soundId: string) => {
    return isLoading.has(soundId);
  }, [isLoading]);

  return {
    sounds: AMBIENT_SOUNDS,
    isPlaying,
    currentSound,
    volume,
    playSound,
    stopSound,
    toggleSound,
    changeVolume,
    isSoundLoaded,
    isSoundLoading,
    allSoundsLoaded: loadedSounds.size === AMBIENT_SOUNDS.length,
  };
};