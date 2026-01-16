import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
  Fab,
} from '@mui/material';
import {
  Send,
  AttachFile,
  Phone,
  Videocam,
  MoreVert,
  EmojiEmotions,
  Image,
  Mic,
  LocationOn,
} from '@mui/icons-material';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location' | 'system';
  status: 'sent' | 'delivered' | 'read';
}

interface ProviderChatProps {
  bookingId: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerOnline: boolean;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
}

const ProviderChat: React.FC<ProviderChatProps> = ({
  bookingId,
  providerId,
  providerName,
  providerAvatar,
  providerOnline,
  customerId,
  customerName,
  customerAvatar,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: providerId,
      senderName: providerName,
      senderAvatar: providerAvatar,
      content: 'Hello! I\'m on my way to your location. I should arrive in about 15 minutes.',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: 'text',
      status: 'read',
    },
    {
      id: '2',
      senderId: customerId,
      senderName: customerName,
      senderAvatar: customerAvatar,
      content: 'Great! I\'ll be waiting. Please call when you arrive.',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      type: 'text',
      status: 'read',
    },
    {
      id: '3',
      senderId: providerId,
      senderName: providerName,
      senderAvatar: providerAvatar,
      content: 'Sure, I\'ll call you. Also, please make sure the area is clear for cleaning.',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      type: 'text',
      status: 'read',
    },
    {
      id: '4',
      senderId: 'system',
      senderName: 'System',
      content: 'Provider has arrived at your location',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      type: 'system',
      status: 'read',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulate provider typing
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping(Math.random() > 0.7); // 30% chance of typing
    }, 3000);

    return () => clearInterval(typingInterval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: customerId,
      senderName: customerName,
      senderAvatar: customerAvatar,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    // Simulate provider response
    setTimeout(() => {
      const responses = [
        'Understood, I\'ll take care of that.',
        'Thank you for the information.',
        'I\'m starting the service now.',
        'Is there anything specific you\'d like me to focus on?',
        'The service is going well so far.',
      ];

      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: providerId,
        senderName: providerName,
        senderAvatar: providerAvatar,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text',
        status: 'sent',
      };

      setMessages(prev => [...prev, response]);
    }, 2000 + Math.random() * 3000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCallProvider = () => {
    window.location.href = 'tel:+919876543210';
  };

  const handleVideoCall = () => {
    alert('Video call feature would be implemented here');
  };

  const handleAttachFile = () => {
    alert('File attachment feature would be implemented here');
  };

  const handleShareLocation = () => {
    alert('Location sharing feature would be implemented here');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString();
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={providerAvatar}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {providerName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{providerName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: providerOnline ? 'success.main' : 'text.disabled',
                    mr: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {providerOnline ? 'Online' : 'Offline'}
                  {isTyping && ' • Typing...'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleCallProvider} color="primary">
              <Phone />
            </IconButton>
            <IconButton onClick={handleVideoCall} color="primary">
              <Videocam />
            </IconButton>
            <IconButton>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.50',
        }}
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <Box key={date}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Chip label={date} size="small" variant="outlined" />
            </Box>

            {dateMessages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.senderId === customerId ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {message.senderId !== customerId && (
                  <Avatar
                    src={message.senderAvatar}
                    sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}
                  >
                    {message.senderName.charAt(0)}
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: '70%',
                    minWidth: 'auto',
                  }}
                >
                  {message.type === 'system' ? (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      {message.content}
                    </Alert>
                  ) : (
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.senderId === customerId ? 'primary.main' : 'white',
                        color: message.senderId === customerId ? 'white' : 'text.primary',
                        borderRadius: 2,
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color={message.senderId === customerId ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                        {message.senderId === customerId && (
                          <Typography
                            variant="caption"
                            sx={{ ml: 0.5, color: 'rgba(255,255,255,0.7)' }}
                          >
                            {getMessageStatusIcon(message.status)}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ))}

        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={providerAvatar}
              sx={{ width: 32, height: 32, mr: 1 }}
            >
              {providerName.charAt(0)}
            </Avatar>
            <Paper sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Typing...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleAttachFile}>
            <AttachFile />
          </IconButton>

          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            inputRef={inputRef}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />

          <IconButton onClick={handleShareLocation} color="primary">
            <LocationOn />
          </IconButton>

          <IconButton>
            <Mic />
          </IconButton>

          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ borderRadius: 3, px: 3 }}
          >
            <Send />
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>

      {/* Quick Actions FAB (Mobile) */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 100, right: 16 }}
          onClick={() => inputRef.current?.focus()}
        >
          <Chat />
        </Fab>
      )}
    </Box>
  );
};

export default ProviderChat;