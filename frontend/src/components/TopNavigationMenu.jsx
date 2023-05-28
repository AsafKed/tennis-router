import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
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
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => handleNavigation('/')}>
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Tennis Router
        </Typography>

        {/* Only show these pages if the user is logged in */}
        {loggedIn && (
          <>
            <IconButton color="inherit" onClick={() => handleNavigation('/group')}>
              <GroupIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => handleNavigation('/preferences')}>
              {/* Suitable Icon */}
              <SportsTennisIcon />
            </IconButton>
            <IconButton color="inherit" onClick={() => handleNavigation('/user')}>
              <PersonIcon />
            </IconButton>
          </>
        )}

        {/* Only show these pages if the user is not logged in */}
        {!loggedIn && (
          <>
            <IconButton color="inherit" onClick={() => handleNavigation('/login')}>
              <LoginIcon />
            </IconButton>
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
