import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { signIn } from 'next-auth/react';

const AccessDenied: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            You must be signed in to view this page.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => signIn()}
          >
            Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default AccessDenied;
