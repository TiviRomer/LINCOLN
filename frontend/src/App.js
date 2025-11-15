// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import TestConnection from './components/TestConnection';

function App() {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        LINCOLN - Panel de Control
      </Typography>
      <TestConnection />
    </Box>
  );
}

export default App;
