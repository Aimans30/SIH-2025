import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

// Import some icons for demonstration
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

const UIShowcase = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedValue, setSelectedValue] = useState('option1');
  const location = useLocation();

  // Sample data for table
  const tableData = [
    { id: 1, name: 'John Doe', status: 'Active', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', status: 'Inactive', department: 'Marketing' },
    { id: 3, name: 'Bob Johnson', status: 'Active', department: 'Finance' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back to Home
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          UI Components Showcase
        </Typography>
        <Button
          component={Link}
          to={`${location.pathname}/responsive-test`}
          variant="contained"
          color="secondary"
          sx={{ mr: 2 }}
        >
          Test Responsive Design
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          }
          label="Dark Mode"
        />
      </Box>

      <Typography variant="body1" paragraph>
        This page showcases various Material UI components styled with our custom theme.
      </Typography>

      {/* Typography Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Typography</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h1" gutterBottom>Heading 1</Typography>
        <Typography variant="h2" gutterBottom>Heading 2</Typography>
        <Typography variant="h3" gutterBottom>Heading 3</Typography>
        <Typography variant="h4" gutterBottom>Heading 4</Typography>
        <Typography variant="h5" gutterBottom>Heading 5</Typography>
        <Typography variant="h6" gutterBottom>Heading 6</Typography>
        <Typography variant="subtitle1" gutterBottom>Subtitle 1</Typography>
        <Typography variant="subtitle2" gutterBottom>Subtitle 2</Typography>
        <Typography variant="body1" gutterBottom>Body 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
        <Typography variant="body2" gutterBottom>Body 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
      </Paper>

      {/* Buttons Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Buttons</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="error">Error</Button>
          <Button variant="contained" color="warning">Warning</Button>
          <Button variant="contained" color="info">Info</Button>
          <Button variant="contained" color="success">Success</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button variant="outlined">Primary</Button>
          <Button variant="outlined" color="secondary">Secondary</Button>
          <Button variant="outlined" color="error">Error</Button>
          <Button variant="outlined" color="warning">Warning</Button>
          <Button variant="outlined" color="info">Info</Button>
          <Button variant="outlined" color="success">Success</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button variant="text">Primary</Button>
          <Button variant="text" color="secondary">Secondary</Button>
          <Button variant="text" color="error">Error</Button>
          <Button variant="text" color="warning">Warning</Button>
          <Button variant="text" color="info">Info</Button>
          <Button variant="text" color="success">Success</Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />}>
            With Icon
          </Button>
          <Button variant="outlined" endIcon={<ArrowBackIcon />}>
            With Icon
          </Button>
          <IconButton color="primary" aria-label="delete">
            <DeleteIcon />
          </IconButton>
          <IconButton color="secondary" aria-label="edit">
            <EditIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Form Elements Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Form Elements</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Standard" variant="outlined" />
          <TextField label="With Helper Text" variant="outlined" helperText="Some helper text" />
          <TextField label="With Error" variant="outlined" error helperText="Error message" />
          <TextField label="Disabled" variant="outlined" disabled />
          <TextField label="Multiline" variant="outlined" multiline rows={4} />
          
          <FormControl fullWidth>
            <InputLabel id="select-label">Select</InputLabel>
            <Select
              labelId="select-label"
              value={selectedValue}
              label="Select"
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <MenuItem value="option1">Option 1</MenuItem>
              <MenuItem value="option2">Option 2</MenuItem>
              <MenuItem value="option3">Option 3</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel control={<Switch />} label="Switch" />
        </Box>
      </Paper>

      {/* Cards Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Cards</Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Card Title</Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a simple card with some content. Cards can be used to display content in a contained format.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Interactive Card</Typography>
                <Typography variant="body2" color="text.secondary">
                  This card has interactive elements and demonstrates hover effects defined in our theme.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">Action</Button>
                <Button size="small" color="secondary">Another Action</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Card with Progress</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  This card includes a progress indicator.
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Alerts</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            This is a success alert — check it out!
          </Alert>
          <Alert severity="info">
            <AlertTitle>Info</AlertTitle>
            This is an info alert — check it out!
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            This is a warning alert — check it out!
          </Alert>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            This is an error alert — check it out!
          </Alert>
        </Box>
      </Paper>

      {/* Chips Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Chips</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="Basic" />
          <Chip label="Primary" color="primary" />
          <Chip label="Secondary" color="secondary" />
          <Chip label="Success" color="success" />
          <Chip label="Error" color="error" />
          <Chip label="Warning" color="warning" />
          <Chip label="Info" color="info" />
          <Chip label="Clickable" onClick={() => {}} />
          <Chip label="Deletable" onDelete={() => {}} />
          <Chip icon={<InfoIcon />} label="With Icon" />
        </Box>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Table</Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={row.status === 'Active' ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Progress Indicators Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Progress Indicators</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ width: '100%', mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Linear Progress</Typography>
          <LinearProgress />
        </Box>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Linear Progress with Value</Typography>
          <LinearProgress variant="determinate" value={60} />
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>Circular Progress</Typography>
            <CircularProgress />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>Circular with Value</Typography>
            <CircularProgress variant="determinate" value={75} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>Different Sizes</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CircularProgress size={20} />
              <CircularProgress size={30} />
              <CircularProgress size={40} />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>Different Colors</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CircularProgress color="secondary" />
              <CircularProgress color="success" />
              <CircularProgress color="error" />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default UIShowcase;
