import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonIcon from '@mui/icons-material/Person';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';

const TopNavigationMenu = ({ loggedIn }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (route) => {
    navigate(route);
  };

  if (isTabletOrSmaller) {
    return null;
  }

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => handleNavigation('/')}>
          <img src={`${process.env.PUBLIC_URL}/JADS_logo_WHITE.png`} alt="JADS Logo"
            // <img src={`${process.env.PUBLIC_URL}/JADS_logo_RGB.ico`} alt="JADS Logo"
            display="block"
            width="auto"
            height="40" />
          <img src={`${process.env.PUBLIC_URL}/libemaopen-logo.png`} alt="Libema Logo"
            display="block"
            width="auto"
            height="35" />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          JADS – Libéma Recommender
        </Typography>

        {/* This should always be accessible */}
        <IconButton color="inherit" onClick={() => handleNavigation('/browser')}>
          {/* Suitable Icon */}
          <SportsTennisIcon />
        </IconButton>
        {/* Only show these pages if the user is logged in */}
        {loggedIn && (
          <>
            <IconButton color="inherit" onClick={() => handleNavigation('/user')}>
              <PersonIcon />
            </IconButton>
          </>
        )}

        {/* Only show these pages if the user is not logged in */}
        {!loggedIn && (
          <>
            {/* <IconButton color="inherit" onClick={() => handleNavigation('/login')}>
              <LoginIcon />
            </IconButton> */}
            <IconButton color="inherit" onClick={() => handleNavigation('/register')}>
              <PersonAddIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopNavigationMenu;
