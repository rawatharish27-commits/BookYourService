import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore,
  LocationOn,
  AccessTime,
  Star,
  LocalOffer,
  Verified,
  Clear,
  FilterList,
} from '@mui/icons-material';

interface FilterState {
  priceRange: [number, number];
  rating: number | null;
  distance: number;
  availability: string;
  verifiedOnly: boolean;
  instantBooking: boolean;
  onlinePayment: boolean;
  categories: string[];
  services: string[];
  experience: string;
  languages: string[];
  location: string;
}

const Filters: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    rating: null,
    distance: 10,
    availability: 'any',
    verifiedOnly: false,
    instantBooking: false,
    onlinePayment: false,
    categories: [],
    services: [],
    experience: 'any',
    languages: [],
    location: '',
  });

  const [expandedPanels, setExpandedPanels] = useState<string[]>(['price', 'rating']);

  // Mock data
  const categories = [
    'Home Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry',
    'Appliance Repair', 'Gardening', 'Pest Control', 'Vehicle Services', 'Beauty & Wellness'
  ];

  const services = [
    'Deep Cleaning', 'Regular Cleaning', 'Plumbing Repair', 'Electrical Work',
    'Interior Painting', 'Furniture Repair', 'AC Service', 'Car Wash', 'Hair Cut', 'Massage'
  ];

  const languages = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu'];

  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 2000],
      rating: null,
      distance: 10,
      availability: 'any',
      verifiedOnly: false,
      instantBooking: false,
      onlinePayment: false,
      categories: [],
      services: [],
      experience: 'any',
      languages: [],
      location: '',
    });
  };

  const applyFilters = () => {
    // In real app, this would trigger API call or update parent component
    console.log('Applying filters:', filters);
  };

  const FilterAccordion: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }> = ({ id, title, children, defaultExpanded = false }) => (
    <Accordion
      expanded={expandedPanels.includes(id)}
      onChange={handlePanelChange(id)}
      defaultExpanded={defaultExpanded}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Filters</Typography>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={clearAllFilters}
          size="small"
        >
          Clear All
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Price Range */}
          <FilterAccordion id="price" title="Price Range" defaultExpanded>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" gutterBottom>
                ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue as [number, number] }))}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={50}
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {[
                  { label: 'Under ₹500', range: [0, 500] as [number, number] },
                  { label: '₹500 - ₹1000', range: [500, 1000] as [number, number] },
                  { label: '₹1000 - ₹2000', range: [1000, 2000] as [number, number] },
                  { label: 'Above ₹2000', range: [2000, 5000] as [number, number] },
                ].map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: preset.range }))}
                    variant={filters.priceRange[0] === preset.range[0] && filters.priceRange[1] === preset.range[1] ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </FilterAccordion>

          {/* Rating */}
          <FilterAccordion id="rating" title="Rating" defaultExpanded>
            <Box sx={{ px: 2, pb: 2 }}>
              <RadioGroup
                value={filters.rating || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : null }))}
              >
                <FormControlLabel value="" control={<Radio />} label="Any Rating" />
                <FormControlLabel value="4.5" control={<Radio />} label="4.5+ Stars" />
                <FormControlLabel value="4.0" control={<Radio />} label="4.0+ Stars" />
                <FormControlLabel value="3.5" control={<Radio />} label="3.5+ Stars" />
                <FormControlLabel value="3.0" control={<Radio />} label="3.0+ Stars" />
              </RadioGroup>
            </Box>
          </FilterAccordion>

          {/* Distance */}
          <FilterAccordion id="distance" title="Distance">
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Maximum Distance: {filters.distance} km
              </Typography>
              <Slider
                value={filters.distance}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, distance: newValue as number }))}
                valueLabelDisplay="auto"
                min={1}
                max={50}
                step={1}
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {[5, 10, 15, 25].map((distance) => (
                  <Chip
                    key={distance}
                    label={`Within ${distance}km`}
                    onClick={() => setFilters(prev => ({ ...prev, distance }))}
                    variant={filters.distance === distance ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </FilterAccordion>

          {/* Availability */}
          <FilterAccordion id="availability" title="Availability">
            <Box sx={{ px: 2, pb: 2 }}>
              <RadioGroup
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              >
                <FormControlLabel value="any" control={<Radio />} label="Any Time" />
                <FormControlLabel value="today" control={<Radio />} label="Available Today" />
                <FormControlLabel value="tomorrow" control={<Radio />} label="Available Tomorrow" />
                <FormControlLabel value="weekend" control={<Radio />} label="Available This Weekend" />
                <FormControlLabel value="next-week" control={<Radio />} label="Available Next Week" />
              </RadioGroup>
            </Box>
          </FilterAccordion>

          {/* Categories */}
          <FilterAccordion id="categories" title="Categories">
            <Box sx={{ px: 2, pb: 2 }}>
              <Grid container spacing={1}>
                {categories.map((category) => (
                  <Grid item xs={6} key={category}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.categories.includes(category)}
                          onChange={() => handleCategoryToggle(category)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{category}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </FilterAccordion>

          {/* Services */}
          <FilterAccordion id="services" title="Services">
            <Box sx={{ px: 2, pb: 2 }}>
              <Grid container spacing={1}>
                {services.map((service) => (
                  <Grid item xs={6} key={service}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{service}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </FilterAccordion>

          {/* Provider Preferences */}
          <FilterAccordion id="provider" title="Provider Preferences">
            <Box sx={{ px: 2, pb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Verified Providers Only</Typography>
                    <Verified sx={{ ml: 1, fontSize: 16, color: 'primary.main' }} />
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.instantBooking}
                    onChange={(e) => setFilters(prev => ({ ...prev, instantBooking: e.target.checked }))}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Instant Booking</Typography>
                    <AccessTime sx={{ ml: 1, fontSize: 16, color: 'success.main' }} />
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.onlinePayment}
                    onChange={(e) => setFilters(prev => ({ ...prev, onlinePayment: e.target.checked }))}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">Online Payment Accepted</Typography>
                    <LocalOffer sx={{ ml: 1, fontSize: 16, color: 'info.main' }} />
                  </Box>
                }
              />

              <Box sx={{ mt: 2 }}>
                <FormLabel component="legend" sx={{ mb: 1 }}>Experience Level</FormLabel>
                <RadioGroup
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  row
                >
                  <FormControlLabel value="any" control={<Radio size="small" />} label="Any" />
                  <FormControlLabel value="beginner" control={<Radio size="small" />} label="1-3 years" />
                  <FormControlLabel value="intermediate" control={<Radio size="small" />} label="3-5 years" />
                  <FormControlLabel value="expert" control={<Radio size="small" />} label="5+ years" />
                </RadioGroup>
              </Box>
            </Box>
          </FilterAccordion>

          {/* Languages */}
          <FilterAccordion id="languages" title="Languages">
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select preferred languages
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {languages.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    onClick={() => handleLanguageToggle(language)}
                    color={filters.languages.includes(language) ? 'primary' : 'default'}
                    variant={filters.languages.includes(language) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </FilterAccordion>

          {/* Location */}
          <FilterAccordion id="location" title="Location">
            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter location or pincode"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>
          </FilterAccordion>
        </CardContent>
      </Card>

      {/* Apply Filters Button */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          fullWidth={isMobile}
          onClick={applyFilters}
          startIcon={<FilterList />}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          fullWidth={isMobile}
          onClick={clearAllFilters}
        >
          Reset
        </Button>
      </Box>

      {/* Active Filters Summary */}
      {(filters.categories.length > 0 || filters.services.length > 0 || filters.languages.length > 0 || filters.rating) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Filters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filters.rating && (
                <Chip
                  label={`${filters.rating}+ Stars`}
                  onDelete={() => setFilters(prev => ({ ...prev, rating: null }))}
                  size="small"
                  color="primary"
                />
              )}
              {filters.categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onDelete={() => handleCategoryToggle(category)}
                  size="small"
                />
              ))}
              {filters.services.map((service) => (
                <Chip
                  key={service}
                  label={service}
                  onDelete={() => handleServiceToggle(service)}
                  size="small"
                />
              ))}
              {filters.languages.map((language) => (
                <Chip
                  key={language}
                  label={language}
                  onDelete={() => handleLanguageToggle(language)}
                  size="small"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Filters;