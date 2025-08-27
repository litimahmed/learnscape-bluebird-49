import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Music, 
  VolumeX, 
  Volume2, 
  Play, 
  Pause,
  Loader2,
  Waves,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAmbientSoundContext } from "@/contexts/AmbientSoundContext";

export function SoundControls() {
  const {
    sounds,
    isPlaying,
    currentSound,
    volume,
    toggleSound,
    changeVolume,
    stopSound,
    isSoundLoaded,
    isSoundLoading,
    allSoundsLoaded,
  } = useAmbientSoundContext();

  const getSoundStatus = (soundId: string) => {
    if (isSoundLoading(soundId)) return 'loading';
    if (!isSoundLoaded(soundId)) return 'not-loaded';
    if (currentSound?.id === soundId && isPlaying) return 'playing';
    return 'ready';
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Music className="w-5 h-5 text-primary" />
              {isPlaying && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-lg">Focus Sounds</span>
          </div>
          <div className="flex items-center space-x-2">
            {!allSoundsLoaded && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
            {allSoundsLoaded && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                Ready
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Volume Control - Always Visible */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Master Volume</span>
            </Label>
            <span className="text-xs text-muted-foreground font-mono">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <div className="px-2">
            <Slider
              value={[volume * 100]}
              onValueChange={([value]) => changeVolume(value / 100)}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* Sound Grid */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Available Sounds</Label>
          <div className="grid grid-cols-1 gap-2">
            {sounds.map(sound => {
              const status = getSoundStatus(sound.id);
              const isCurrentlyPlaying = currentSound?.id === sound.id && isPlaying;
              
              return (
                <div
                  key={sound.id}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border transition-all duration-200",
                    isCurrentlyPlaying && "border-primary bg-primary/5 shadow-sm",
                    status === 'ready' && !isCurrentlyPlaying && "hover:border-muted-foreground/30 hover:bg-muted/30",
                    status === 'loading' && "border-muted",
                    status === 'not-loaded' && "border-destructive/20 bg-destructive/5"
                  )}
                >
                  <Button
                    variant="ghost"
                    onClick={() => toggleSound(sound)}
                    disabled={status === 'loading' || status === 'not-loaded'}
                    className={cn(
                      "w-full h-auto p-4 flex items-center justify-between hover:bg-transparent",
                      isCurrentlyPlaying && "text-primary"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50">
                        {status === 'loading' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : status === 'not-loaded' ? (
                          <VolumeX className="w-4 h-4 text-destructive" />
                        ) : (
                          <span className="text-lg">{sound.icon}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{sound.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {sound.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isCurrentlyPlaying && (
                        <div className="flex items-center space-x-1">
                          <Waves className="w-3 h-3 animate-pulse text-primary" />
                          <span className="text-xs text-primary font-medium">Playing</span>
                        </div>
                      )}
                      {status === 'ready' && !isCurrentlyPlaying && (
                        <Play className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                      )}
                      {isCurrentlyPlaying && (
                        <Pause className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                  
                  {/* Playing indicator bar */}
                  {isCurrentlyPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stop All Button */}
        {isPlaying && (
          <>
            <Separator />
            <Button 
              variant="outline" 
              onClick={stopSound}
              className="w-full"
            >
              <VolumeX className="w-4 h-4 mr-2" />
              Stop All Sounds
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}