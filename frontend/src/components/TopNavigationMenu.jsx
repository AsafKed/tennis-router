import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const TopNavigationMenu = () => {
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
        <IconButton color="inherit" onClick={() => handleNavigation('/group')}>
          <GroupIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => handleNavigation('/user')}>
          <PersonIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavigationMenu;
