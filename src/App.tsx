import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
import PageLoader from "./components/ui/PageLoader";
import StudentDashboard from "./pages/StudentDashboard";
import { TimerProvider } from "./contexts/TimerContext";
import { AmbientSoundProvider } from "./contexts/AmbientSoundContext";
import { FloatingTimer } from "./components/ui/FloatingTimer";
import { FloatingSoundPlayer } from "./components/ui/FloatingSoundPlayer";
import { useTimerContext } from "./contexts/TimerContext";

// Lazy-loaded page components
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Courses = lazy(() => import("./pages/Courses"));
const Contact = lazy(() => import("./pages/Contact"));
const Register = lazy(() => import("./pages/Register"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Business = lazy(() => import("./pages/Business"));
const Careers = lazy(() => import("./pages/Careers"));
// StudentDashboard imported eagerly above
const PartnerApplication = lazy(() => import("./pages/PartnerApplication"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const timerContext = useTimerContext();

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<StudentDashboard />} />
          <Route path="/partner-application" element={<PartnerApplication />} />
          <Route path="/*" element={
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/business" element={<Business />} />
                  <Route path="/careers" element={<Careers />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          } />
        </Routes>
      </Suspense>
      
      {/* Floating Timer */}
      {timerContext.showFloating && (
        <FloatingTimer
          timeLeft={timerContext.timeLeft}
          isActive={timerContext.isTimerActive}
          currentTechnique={timerContext.currentTechnique}
          onStart={timerContext.onStart}
          onPause={timerContext.onPause}
          onStop={timerContext.onStop}
          onClose={timerContext.hideFloating}
        />
      )}

      {/* Floating Sound Player */}
      <FloatingSoundPlayer />
    </>
  );
};

const App = () => (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TimerProvider>
              <AmbientSoundProvider>
                <AppContent />
              </AmbientSoundProvider>
            </TimerProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
);

export default App;