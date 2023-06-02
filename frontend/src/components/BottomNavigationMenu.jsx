import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonIcon from '@mui/icons-material/Person';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const BottomNavigationMenu = ({ loggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down('md'));

  const routeToValueMap = {
    '/': 0,
    '/preferences': 1,
    '/user': 2,
    '/login': loggedIn ? -1 : 1,
    '/register': loggedIn ? -1 : 2,
  };

  const [value, setValue] = React.useState(routeToValueMap[location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNavigation = (route) => {
    navigate(route);
  };

  if (!isTabletOrSmaller) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction
          label="Welcome"
          icon={<HomeIcon />}
          onClick={() => handleNavigation('/')}
        />
        {loggedIn ? (
          [
            <BottomNavigationAction
              key="preferences"
              label="Preferences solicitation"
              icon={<SportsTennisIcon />}
              onClick={() => handleNavigation('/preferences')}
            />,
            <BottomNavigationAction
              key="user"
              label="User"
              icon={<PersonIcon />}
              onClick={() => handleNavigation('/user')}
            />,
          ]
        ) : (
          [
            <BottomNavigationAction
              key="login"
              label="Login"
              icon={<LoginIcon />}
              onClick={() => handleNavigation('/login')}
            />,
            <BottomNavigationAction
              key="register"
              label="Register"
              icon={<PersonAddIcon />}
              onClick={() => handleNavigation('/register')}
            />,
          ]
        )}
      </BottomNavigation>
    </Paper >
  );
};

export default BottomNavigationMenu;
