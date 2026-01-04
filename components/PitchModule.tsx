
import React, { useState, useEffect } from 'react';
import { PITCH_SLIDES } from '../constants';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  PlayArrow,
  Pause,
  Fullscreen,
  FullscreenExit,
  Assessment,
  TrendingUp,
  People,
  MonetizationOn,
  Business,
  Timeline,
  Lightbulb,
  CheckCircle,
  Star,
  LocationOn,
  Security,
  Analytics,
  Group,
  AttachMoney,
  ExitToApp,
} from '@mui/icons-material';

const PitchModule: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showNavigation, setShowNavigation] = useState(true);
  const [contactDialog, setContactDialog] = useState(false);

  const slide = PITCH_SLIDES[currentSlide];
  const progressValue = ((currentSlide + 1) / PITCH_SLIDES.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % PITCH_SLIDES.length);
      }, 8000); // 8 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  useEffect(() => {
    setProgress(progressValue);
  }, [currentSlide, progressValue]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % PITCH_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + PITCH_SLIDES.length) % PITCH_SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSlideIcon = (visualType: string) => {
    switch (visualType) {
      case 'problem': return <Assessment color="error" />;
      case 'solution': return <Lightbulb color="primary" />;
      case 'innovation': return <Timeline color="secondary" />;
      case 'trust': return <Security color="success" />;
      case 'operations': return <Analytics color="info" />;
      case 'market': return <TrendingUp color="warning" />;
      case 'financials': return <MonetizationOn color="success" />;
      case 'competitive': return <Star color="primary" />;
      case 'strategy': return <Business color="info" />;
      case 'team': return <Group color="secondary" />;
      case 'funding': return <AttachMoney color="success" />;
      case 'exit': return <ExitToApp color="primary" />;
      default: return <Assessment />;
    }
  };

  const getSlideColor = (visualType: string) => {
    switch (visualType) {
      case 'problem': return theme.palette.error.main;
      case 'solution': return theme.palette.primary.main;
      case 'innovation': return theme.palette.secondary.main;
      case 'trust': return theme.palette.success.main;
      case 'operations': return theme.palette.info.main;
      case 'market': return theme.palette.warning.main;
      case 'financials': return theme.palette.success.main;
      case 'competitive': return theme.palette.primary.main;
      case 'strategy': return theme.palette.info.main;
      case 'team': return theme.palette.secondary.main;
      case 'funding': return theme.palette.success.main;
      case 'exit': return theme.palette.primary.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A2540 0%, #1a365d 50%, #2d3748 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60%',
        height: '60%',
        background: `radial-gradient(circle, ${getSlideColor(slide.visualType)}20 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate(30%, -30%)',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(30%, -30%) scale(1)' },
          '50%': { transform: 'translate(30%, -30%) scale(1.1)' },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '40%',
        height: '40%',
        background: `radial-gradient(circle, ${theme.palette.secondary.main}15 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate(-20%, 20%)',
      }} />

      {/* Progress Bar */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getSlideColor(slide.visualType),
            },
          }}
        />
      </Box>

      {/* Main Content */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        position: 'relative',
        zIndex: 5,
      }}>
        <Box sx={{
          maxWidth: isFullscreen ? '100%' : 1200,
          width: '100%',
          textAlign: 'center',
        }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: getSlideColor(slide.visualType),
                fontWeight: 'bold',
                letterSpacing: 2,
                fontSize: '0.75rem',
                mb: 2,
              }}
            >
              INVESTOR DECK • SLIDE {slide.id}/12
            </Typography>
            <Typography
              variant={isFullscreen ? "h2" : "h3"}
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 3,
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {slide.title}
            </Typography>
          </Box>

          {/* Main Content Card */}
          <Card
            sx={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${getSlideColor(slide.visualType)}30`,
              borderRadius: 4,
              mb: 4,
              minHeight: isFullscreen ? '60vh' : 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 6, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                {getSlideIcon(slide.visualType)}
              </Box>
              <Typography
                variant={isFullscreen ? "h4" : "h5"}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  mb: 4,
                  fontStyle: 'italic',
                }}
              >
                "{slide.content}"
              </Typography>

              {/* Key Metrics */}
              {showMetrics && slide.keyMetrics && (
                <Grid container spacing={2} sx={{ mt: 4 }}>
                  {slide.keyMetrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          background: `linear-gradient(135deg, ${getSlideColor(slide.visualType)}15, ${getSlideColor(slide.visualType)}05)`,
                          border: `1px solid ${getSlideColor(slide.visualType)}30`,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: getSlideColor(slide.visualType),
                          }}
                        >
                          {metric}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          {showNavigation && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 4,
            }}>
              <IconButton
                onClick={prevSlide}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                  size: 'large',
                }}
              >
                <NavigateBefore fontSize="large" />
              </IconButton>

              {/* Slide Indicators */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {PITCH_SLIDES.map((_, index) => (
                  <IconButton
                    key={index}
                    onClick={() => goToSlide(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index === currentSlide
                        ? getSlideColor(slide.visualType)
                        : 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        backgroundColor: index === currentSlide
                          ? getSlideColor(slide.visualType)
                          : 'rgba(255,255,255,0.5)',
                      },
                      minWidth: 12,
                      p: 0,
                    }}
                  />
                ))}
              </Box>

              <IconButton
                onClick={nextSlide}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                  size: 'large',
                }}
              >
                <NavigateNext fontSize="large" />
              </IconButton>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={isAutoPlay ? <Pause /> : <PlayArrow />}
              onClick={toggleAutoPlay}
              sx={{
                backgroundColor: getSlideColor(slide.visualType),
                '&:hover': {
                  backgroundColor: getSlideColor(slide.visualType),
                  opacity: 0.9,
                },
              }}
            >
              {isAutoPlay ? 'Pause' : 'Auto Play'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Fullscreen />}
              onClick={toggleFullscreen}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Fullscreen
            </Button>

            <Button
              variant="outlined"
              onClick={() => setContactDialog(true)}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Floating Controls */}
      <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Fab
          size="small"
          onClick={() => setShowMetrics(!showMetrics)}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <Assessment fontSize="small" />
        </Fab>
        <Fab
          size="small"
          onClick={() => setShowNavigation(!showNavigation)}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <NavigateNext fontSize="small" />
        </Fab>
      </Box>

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Interested in Investing?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Thank you for your interest in BookYourService! We're always looking for strategic partners and investors who share our vision.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            For investment inquiries, please contact:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Email" secondary="investors@bookyourservice.com" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Phone" secondary="+91 98765 43210" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Address" secondary="Mumbai, Maharashtra" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)}>Close</Button>
          <Button variant="contained" onClick={() => window.open('mailto:investors@bookyourservice.com')}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PitchModule;
