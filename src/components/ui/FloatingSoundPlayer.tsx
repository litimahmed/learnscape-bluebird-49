import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  Music,
  Square
} from 'lucide-react';
import { useAmbientSoundContext } from '@/contexts/AmbientSoundContext';

export const FloatingSoundPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    currentSound, 
    volume, 
    changeVolume, 
    isPlaying,
    stopSound 
  } = useAmbientSoundContext();

  if (!isPlaying || !currentSound) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg max-w-[280px]">
        {/* Compact Header */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <Music className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="text-sm font-medium truncate">
              {currentSound.icon} {currentSound.name}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={stopSound}
            >
              <Square className="h-3 w-3" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="border-t p-3 space-y-3">
            {/* Volume Control */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Volume</div>
              <div className="flex items-center gap-2">
                <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => changeVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Volume2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(volume * 100)}%
              </div>
            </div>

            {/* Sound Description */}
            <div className="text-xs text-muted-foreground">
              {currentSound.description}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};