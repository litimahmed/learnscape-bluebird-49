import { createContext, useContext, ReactNode } from 'react';
import { useAmbientSounds } from '../hooks/useAmbientSounds';

interface AmbientSoundContextType {
  sounds: Array<{
    id: string;
    name: string;
    icon: string;
    audioUrl: string;
    description: string;
  }>;
  isPlaying: boolean;
  currentSound: {
    id: string;
    name: string;
    icon: string;
    audioUrl: string;
    description: string;
  } | null;
  volume: number;
  playSound: (sound: any) => Promise<void>;
  stopSound: () => void;
  toggleSound: (sound: any) => void;
  changeVolume: (volume: number) => void;
  isSoundLoaded: (soundId: string) => boolean;
  isSoundLoading: (soundId: string) => boolean;
  allSoundsLoaded: boolean;
}

const AmbientSoundContext = createContext<AmbientSoundContextType | null>(null);

export const useAmbientSoundContext = () => {
  const context = useContext(AmbientSoundContext);
  if (!context) {
    throw new Error('useAmbientSoundContext must be used within an AmbientSoundProvider');
  }
  return context;
};

interface AmbientSoundProviderProps {
  children: ReactNode;
}

export const AmbientSoundProvider = ({ children }: AmbientSoundProviderProps) => {
  const soundControls = useAmbientSounds();

  return (
    <AmbientSoundContext.Provider value={soundControls}>
      {children}
    </AmbientSoundContext.Provider>
  );
};