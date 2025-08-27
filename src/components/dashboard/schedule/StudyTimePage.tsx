import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { 
  Play,
  Pause,
  Square,
  Brain,
  Coffee,
  Timer,
  Flame,
  Volume2,
  VolumeX,
  SkipForward,
  Music,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import { useAmbientSounds } from "@/hooks/useAmbientSounds";
import { useToast } from "@/hooks/use-toast";
import { useTimerContext } from "@/contexts/TimerContext";

export function StudyTimePage() {
  const { toast } = useToast();
  const timerContext = useTimerContext();
  const [technique, setTechnique] = useState<'pomodoro' | 'custom'>('pomodoro');

  const {
    timeLeft,
    isRunning,
    isPaused,
    currentSession,
    sessionCount,
    startSession,
    pauseTimer,
    stopTimer,
    skipSession,
    formatTime,
    getTodaysStats,
    requestNotificationPermission
  } = useStudyTimer({
    focusDuration: technique === 'pomodoro' ? 25 : 50,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    notificationsEnabled: true,
  });

  const {
    sounds,
    isPlaying: isSoundPlaying,
    currentSound,
    volume,
    toggleSound,
    changeVolume,
    stopSound: stopAmbientSound
  } = useAmbientSounds();

  const todayStats = getTodaysStats();
  const progressPercentage = timeLeft > 0 && currentSession 
    ? ((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100 
    : 0;

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Update timer context whenever timer state changes
  useEffect(() => {
    timerContext.setTimerData({
      timeLeft,
      isActive: isRunning && !isPaused,
      technique: currentSession?.technique || technique,
      onStart: pauseTimer,
      onPause: pauseTimer,
      onStop: stopTimer,
    });
  }, [timeLeft, isRunning, isPaused, currentSession?.technique, technique, pauseTimer, stopTimer, timerContext]);

  const handleQuickStart = (type: 'focus' | 'short-break' | 'long-break', duration: number) => {
    startSession({
      subject: type === 'focus' ? 'Study Session' : 'Break Time',
      duration,
      type,
      technique,
    });
    toast({
      title: "Session Started!",
      description: `Started ${duration}min ${type.replace('-', ' ')} session`,
    });
  };

  const techniques = [
    { id: 'pomodoro', name: 'Pomodoro', duration: 25, icon: '🍅' },
    { id: 'custom', name: 'Deep Work', duration: 50, icon: '🧠' }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Study Time</h1>
            </div>
            <Badge variant="secondary" className="font-medium">
              {Math.round(todayStats.totalMinutes / 60 * 10) / 10}h today
            </Badge>
            {sessionCount > 0 && (
              <div className="flex items-center space-x-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="font-medium">{sessionCount} sessions</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {techniques.map(t => (
                <Button
                  key={t.id}
                  variant={technique === t.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTechnique(t.id as any)}
                >
                  {t.icon} {t.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-0">
        {/* Timer Column */}
        <div className="lg:col-span-2">
          <Card className={cn(
            "transition-all duration-300",
            currentSession?.type === 'focus' && "border-primary/20 bg-primary/5",
            currentSession?.type === 'short-break' && "border-green-500/20 bg-green-50",
            currentSession?.type === 'long-break' && "border-blue-500/20 bg-blue-50"
          )}>
            <CardContent className="pt-6">
              {currentSession ? (
                <>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {currentSession?.type === 'focus' && <Brain className="w-5 h-5 text-primary" />}
                      {currentSession?.type === 'short-break' && <Coffee className="w-5 h-5 text-green-600" />}
                      {currentSession?.type === 'long-break' && <Coffee className="w-5 h-5 text-blue-600" />}
                      <span className="font-medium">
                        {currentSession?.type === 'focus' && 'Focus Session'}
                        {currentSession?.type === 'short-break' && 'Short Break'}
                        {currentSession?.type === 'long-break' && 'Long Break'}
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {currentSession.technique}
                    </Badge>
                  </div>

                  <div className="flex justify-center mb-6">
                    <div className="w-64 h-64">
                      <CircularProgressbar
                        value={progressPercentage}
                        text={formatTime(timeLeft)}
                        styles={buildStyles({
                          textColor: 'hsl(var(--foreground))',
                          pathColor: 'hsl(var(--primary))',
                          trailColor: 'hsl(var(--muted))',
                          textSize: '14px',
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    <Button 
                      variant={isRunning && !isPaused ? "secondary" : "default"} 
                      onClick={pauseTimer}
                    >
                      {isRunning && !isPaused ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isRunning && !isPaused ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="outline" onClick={skipSession}>
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                    <Button variant="outline" onClick={stopTimer}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Timer className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to focus?</h3>
                    <p className="text-muted-foreground mb-8">
                      Start a focused study session
                    </p>
                    
                    <div className="space-y-3 max-w-xs mx-auto">
                      {techniques.map(t => (
                        <Button
                          key={t.id}
                          variant="outline"
                          onClick={() => handleQuickStart('focus', t.duration)}
                          className="w-full h-12 flex items-center justify-between"
                        >
                          <span className="flex items-center space-x-2">
                            <span className="text-lg">{t.icon}</span>
                            <span>{t.name}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">{t.duration}min</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ambient Sounds Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span>Focus Sounds</span>
                </div>
                {isSoundPlaying && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopAmbientSound}
                  >
                    <VolumeX className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {sounds.map(sound => (
                  <Button
                    key={sound.id}
                    variant={currentSound?.id === sound.id ? "default" : "ghost"}
                    onClick={() => toggleSound(sound)}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{sound.icon}</span>
                    {sound.name}
                  </Button>
                ))}
              </div>
              
              {isSoundPlaying && (
                <div className="space-y-2">
                  <Label className="text-sm">Volume</Label>
                  <Slider
                    value={[volume * 100]}
                    onValueChange={([value]) => changeVolume(value / 100)}
                    max={100}
                    step={1}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(todayStats.totalMinutes / 60 * 10) / 10}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total study time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold flex items-center justify-center space-x-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span>{sessionCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Completed sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => handleQuickStart('short-break', 5)}
                disabled={isRunning}
              >
                <Coffee className="w-4 h-4 mr-2" />
                Short Break (5min)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => handleQuickStart('long-break', 15)}
                disabled={isRunning}
              >
                <Coffee className="w-4 h-4 mr-2" />
                Long Break (15min)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}