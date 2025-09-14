import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import SendRequestNew from "./pages/SendRequestNew";
import AcceptRequest from "./pages/AcceptRequest";
import MyRequests from "./pages/MyRequests";
import MyHelpRequests from "./pages/MyHelpRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import NotificationSystem from "./components/NotificationSystem";
import ChatDialog from "./components/ChatDialog";
import BackendStatus from "./components/BackendStatus";
import { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import socketService from "./services/socket";
import { toast } from "./hooks/use-toast";
import AIChatbot from './components/AIChatbot';

const queryClient = new QueryClient();

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Global notification handler component
const GlobalNotificationHandler = () => {
  const { user } = useAuth();
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Connect to socket
      socketService.connect(user.id);
      
      // Set up global notification listener
      socketService.onNotification((notification) => {
        console.log("🔔 Global notification received:", notification);
        toast({
          title: "New Message",
          description: notification.message,
        });
      });
    }
    
    return () => {
      socketService.offNotification();
    };
  }, [user]);

  const handleOpenChat = (requestId: string) => {
    setCurrentRequestId(requestId);
    setChatDialogOpen(true);
  };

  const handleCloseChat = () => {
    setChatDialogOpen(false);
    setCurrentRequestId(null);
  };

  return (
    <>
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationSystem onOpenChat={handleOpenChat} />
        </div>
      )}
      
      <ChatDialog
        isOpen={chatDialogOpen}
        onClose={handleCloseChat}
        requestId={currentRequestId}
      />
    </>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BackendStatus />
            <GlobalNotificationHandler />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/send-request"
                  element={
                    <ProtectedRoute>
                      <SendRequestNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/accept-request"
                  element={
                    <ProtectedRoute>
                      <AcceptRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-help-requests"
                  element={
                    <ProtectedRoute>
                      <MyHelpRequests />
                    </ProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AIChatbot />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
