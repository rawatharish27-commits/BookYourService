import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search,
  Download,
  FileDownload,
  Assessment,
  TrendingUp,
  People,
  Business,
  Payment,
  Schedule,
  ExpandMore,
  CheckCircle,
  HourglassEmpty,
  Error,
  Description,
  TableChart,
  BarChart,
  PieChart,
} from '@mui/icons-material';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'user' | 'performance';
  type: 'scheduled' | 'on-demand';
  format: 'csv' | 'excel' | 'pdf';
  frequency?: 'daily' | 'weekly' | 'monthly';
  lastGenerated?: string;
  status: 'active' | 'inactive';
  recipients: string[];
}

interface ExportJob {
  id: string;
  reportName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  format: string;
  recordCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ReportsDataExport: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Daily Revenue Report',
      description: 'Comprehensive daily revenue breakdown by service category',
      category: 'financial',
      type: 'scheduled',
      format: 'excel',
      frequency: 'daily',
      lastGenerated: '2024-01-15T06:00:00Z',
      status: 'active',
      recipients: ['admin@company.com', 'finance@company.com'],
    },
    {
      id: '2',
      name: 'User Activity Summary',
      description: 'Weekly summary of user registrations and activity',
      category: 'user',
      type: 'scheduled',
      format: 'pdf',
      frequency: 'weekly',
      lastGenerated: '2024-01-14T06:00:00Z',
      status: 'active',
      recipients: ['admin@company.com'],
    },
    {
      id: '3',
      name: 'Provider Performance Report',
      description: 'Monthly provider performance metrics and ratings',
      category: 'performance',
      type: 'scheduled',
      format: 'csv',
      frequency: 'monthly',
      lastGenerated: '2024-01-01T06:00:00Z',
      status: 'active',
      recipients: ['admin@company.com', 'operations@company.com'],
    },
  ]);

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      reportName: 'Customer Data Export',
      status: 'completed',
      requestedBy: 'Admin User',
      requestedAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:35:00Z',
      fileSize: '2.4 MB',
      downloadUrl: '#',
      format: 'CSV',
      recordCount: 8756,
    },
    {
      id: '2',
      reportName: 'Transaction History',
      status: 'processing',
      requestedBy: 'Admin User',
      requestedAt: '2024-01-15T11:00:00Z',
      format: 'Excel',
      recordCount: 0,
    },
  ]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [exportDialog, setExportDialog] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('csv');

  const dataTypes = [
    { id: 'customers', name: 'Customer Data', description: 'User profiles, contact info, registration dates' },
    { id: 'providers', name: 'Provider Data', description: 'Service provider profiles and business info' },
    { id: 'bookings', name: 'Booking History', description: 'All booking records with details' },
    { id: 'transactions', name: 'Transaction Data', description: 'Payment and transaction records' },
    { id: 'reviews', name: 'Reviews & Ratings', description: 'Customer reviews and provider ratings' },
    { id: 'complaints', name: 'Complaints Data', description: 'Support tickets and dispute records' },
  ];

  const handleExport = () => {
    if (selectedDataTypes.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one data type', severity: 'error' });
      return;
    }

    const newJob: ExportJob = {
      id: Date.now().toString(),
      reportName: `Data Export - ${selectedDataTypes.join(', ')}`,
      status: 'pending',
      requestedBy: 'Admin User',
      requestedAt: new Date().toISOString(),
      format: exportFormat.toUpperCase(),
      recordCount: 0,
    };

    setExportJobs([newJob, ...exportJobs]);
    setSnackbar({ open: true, message: 'Export job created successfully!', severity: 'success' });
    setExportDialog(false);
    setSelectedDataTypes([]);
  };

  const handleDownload = (jobId: string) => {
    setSnackbar({ open: true, message: 'Download started!', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'processing': return <HourglassEmpty />;
      case 'pending': return <Schedule />;
      case 'failed': return <Error />;
      default: return <Description />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <Payment />;
      case 'operational': return <Business />;
      case 'user': return <People />;
      case 'performance': return <TrendingUp />;
      default: return <Assessment />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Reports & Data Export
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Report Templates" />
          <Tab label="Data Export" />
          <Tab label="Export History" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Scheduled Reports</Typography>
          <Button variant="outlined" startIcon={<Assessment />}>
            Create Template
          </Button>
        </Box>

        <Grid container spacing={2}>
          {reportTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getCategoryIcon(template.category)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip label={template.category} size="small" color="primary" />
                    <Chip label={template.frequency} size="small" variant="outlined" />
                    <Chip label={template.format.toUpperCase()} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Last generated: {template.lastGenerated ? new Date(template.lastGenerated).toLocaleString() : 'Never'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined">Edit</Button>
                    <Button size="small" variant="outlined">Run Now</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Export Platform Data</Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialog(true)}
          >
            Start Export
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Data Types
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Select the data you want to export. Large exports may take several minutes to process.
                </Typography>
                <List>
                  {dataTypes.map((type) => (
                    <ListItem key={type.id} divider>
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedDataTypes.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDataTypes([...selectedDataTypes, type.id]);
                            } else {
                              setSelectedDataTypes(selectedDataTypes.filter(id => id !== type.id));
                            }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={type.name}
                        secondary={type.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export Options
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={exportFormat}
                    label="Format"
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                  </Select>
                </FormControl>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Selected: {selectedDataTypes.length} data types
                  </Typography>
                </Alert>
                <Typography variant="body2" color="textSecondary">
                  Estimated processing time: {selectedDataTypes.length * 2} minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Export History
        </Typography>

        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Requested At</TableCell>
                  <TableCell>Records</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(job.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {job.reportName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{job.requestedBy}</TableCell>
                    <TableCell>
                      {new Date(job.requestedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {job.recordCount > 0 ? job.recordCount.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>{job.fileSize || '-'}</TableCell>
                    <TableCell>
                      {job.status === 'completed' && job.downloadUrl && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<FileDownload />}
                          onClick={() => handleDownload(job.id)}
                        >
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </TabPanel>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Confirm Data Export</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You are about to export the following data types:
          </Typography>
          <List>
            {selectedDataTypes.map((typeId) => {
              const type = dataTypes.find(t => t.id === typeId);
              return type ? (
                <ListItem key={typeId}>
                  <ListItemText primary={type.name} secondary={type.description} />
                </ListItem>
              ) : null;
            })}
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action will create a background job. You will be notified when the export is ready for download.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={selectedDataTypes.length === 0}
          >
            Start Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsDataExport;