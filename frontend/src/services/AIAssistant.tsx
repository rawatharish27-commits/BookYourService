import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Badge,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Settings,
  Help,
  History,
  SmartToy,
  LocationOn,
  Build,
  Schedule,
  Payment,
  Star,
  Close,
  Send,
} from '@mui/icons-material';

interface AIAssistantProps {
  role: 'USER' | 'PROVIDER';
  city: string;
}

interface Conversation {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  category?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ role, city }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      type: 'assistant',
      message: `Hello! I'm your BookYourService AI assistant. I'm here to help you with ${role === 'USER' ? 'finding and booking services' : 'managing your service business'} in ${city}. How can I assist you today?`,
      timestamp: new Date(),
      category: 'greeting',
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoResponse, setAutoResponse] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'nearby-services',
      label: 'Find Nearby Services',
      icon: <LocationOn />,
      action: () => handleQuickAction('Find me reliable electricians within 5km'),
      category: 'location',
    },
    {
      id: 'emergency-help',
      label: 'Emergency Help',
      icon: <Build />,
      action: () => handleQuickAction('I need urgent plumbing help right now'),
      category: 'emergency',
    },
    {
      id: 'schedule-booking',
      label: 'Schedule Service',
      icon: <Schedule />,
      action: () => handleQuickAction('Help me schedule a home cleaning for tomorrow'),
      category: 'booking',
    },
    {
      id: 'payment-help',
      label: 'Payment Issues',
      icon: <Payment />,
      action: () => handleQuickAction('I have a question about my recent payment'),
      category: 'support',
    },
    {
      id: 'rate-service',
      label: 'Rate Last Service',
      icon: <Star />,
      action: () => handleQuickAction('I want to rate my last service experience'),
      category: 'feedback',
    },
  ];

  useEffect(() => {
    // Initialize audio context on first interaction
    if (isOpen && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  }, [isOpen]);

  const startLiveSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_AI_API_KEY || process.env.API_KEY });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setStatus('Listening...');
            setIsListening(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              if (volume && voiceEnabled) {
                playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
              }

              // Add assistant response to conversation
              const assistantMessage = message.serverContent.modelTurn.parts[0].text || 'I heard you, but couldn\'t process the audio response.';
              addToConversation('assistant', assistantMessage, 'voice-response');
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setStatus('Connection Error');
            addToConversation('assistant', 'Sorry, I encountered a connection error. Please try again.', 'error');
          },
          onclose: () => {
            setIsLive(false);
            setIsListening(false);
            setStatus('Standby');
          }
        },
        config: {
          responseModalities: voiceEnabled ? [Modality.AUDIO] : [],
          systemInstruction: `You are the BookYourService Hub Intelligence AI Assistant. Help the ${role} in ${city} with their service needs.

For ${role === 'USER' ? 'customers' : 'service providers'}, you can:
${role === 'USER'
  ? `- Find and book local services
- Get real-time pricing and availability
- Track booking status and communicate with providers
- Handle payments and refunds
- Provide service recommendations`
  : `- Manage bookings and schedule
- Optimize pricing and availability
- Handle customer communications
- Track earnings and payouts
- Get business insights and recommendations`
}

Always be helpful, professional, and provide accurate information. Use the Google Maps integration to find nearby services or locations when relevant.`,
          tools: [{ googleMaps: {} }]
        }
      });

      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setStatus('Failed');
      addToConversation('assistant', 'Sorry, I couldn\'t start the voice session. Please check your connection and try again.', 'error');
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLive(false);
    setIsListening(false);
    setStatus('Standby');
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channel[i] = dataInt16[i] / 32768.0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const addToConversation = (type: 'user' | 'assistant', message: string, category?: string) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      category,
    };
    setConversations(prev => [...prev.slice(-9), newConversation]); // Keep last 10 messages
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    addToConversation('user', currentMessage);
    setCurrentMessage('');

    // Simulate AI response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const responses = [
        "I understand your request. Let me help you with that.",
        "That's a great question! Here's what I can tell you:",
        "I'd be happy to assist you with this service request.",
        "Let me check the availability for you in " + city + ".",
        "Based on your location, I can recommend some excellent service providers.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addToConversation('assistant', randomResponse, 'text-response');
    }, 1000);
  };

  const handleQuickAction = (message: string) => {
    setCurrentMessage(message);
    handleSendMessage();
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && isLive) {
      stopLiveSession();
    }
  };

  const toggleVolume = () => {
    setVolume(!volume);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 64,
          height: 64,
        }}
        onClick={() => setIsOpen(true)}
      >
        <Badge color="error" variant="dot" invisible={!isLive}>
          <SmartToy sx={{ fontSize: 28 }} />
        </Badge>
      </Fab>

      {/* Main Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            height: isMobile ? '100vh' : '80vh',
            maxHeight: isMobile ? '100vh' : '600px',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SmartToy />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  AI Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role} • {city} • {status}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={toggleVolume}>
                {volume ? <VolumeUp /> : <VolumeOff />}
              </IconButton>
              <IconButton size="small" onClick={toggleVoice}>
                {voiceEnabled ? <Mic /> : <MicOff />}
              </IconButton>
              <IconButton size="small" onClick={() => setSettingsOpen(true)}>
                <Settings />
              </IconButton>
              <IconButton size="small" onClick={() => setIsOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Voice Control */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Button
                variant={isLive ? "contained" : "outlined"}
                color={isLive ? "error" : "primary"}
                startIcon={isLive ? <MicOff /> : <Mic />}
                onClick={isLive ? stopLiveSession : startLiveSession}
                disabled={!voiceEnabled}
                sx={{
                  minWidth: 140,
                  animation: isListening ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              >
                {isLive ? 'Stop Listening' : 'Start Voice Chat'}
              </Button>
              {isListening && (
                <Chip
                  label="Listening..."
                  color="primary"
                  size="small"
                  sx={{
                    animation: 'pulse 1s infinite',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Conversations */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <List>
              {conversations.map((conv) => (
                <ListItem key={conv.id} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: conv.type === 'assistant' ? 'primary.main' : 'secondary.main',
                      width: 32,
                      height: 32
                    }}>
                      {conv.type === 'assistant' ? <SmartToy fontSize="small" /> : <Person fontSize="small" />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {conv.type === 'assistant' ? 'AI Assistant' : 'You'}
                        </Typography>
                        {conv.category && (
                          <Chip label={conv.category} size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {conv.message}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="caption" color="text.secondary">
                      {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickActions.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant="outlined"
                  size="small"
                  startIcon={action.icon}
                  onClick={action.action}
                  sx={{ textTransform: 'none' }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Text Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              >
                <Send />
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Assistant Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Voice Responses</Typography>
              <Button
                variant={voiceEnabled ? "contained" : "outlined"}
                size="small"
                onClick={toggleVoice}
              >
                {voiceEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Auto Response</Typography>
              <Button
                variant={autoResponse ? "contained" : "outlined"}
                size="small"
                onClick={() => setAutoResponse(!autoResponse)}
              >
                {autoResponse ? 'On' : 'Off'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>Sound Effects</Typography>
              <Button
                variant={volume ? "contained" : "outlined"}
                size="small"
                onClick={toggleVolume}
              >
                {volume ? 'On' : 'Off'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AIAssistant;