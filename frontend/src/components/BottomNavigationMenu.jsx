import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
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
    '/group': 1,
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
    <BottomNavigation value={value} onChange={handleChange} showLabels>
      <BottomNavigationAction
        label="Welcome"
        icon={<HomeIcon />}
        onClick={() => handleNavigation('/')}
      />
      {loggedIn ? (
        [
          <BottomNavigationAction
            key="groups"
            label="Groups"
            icon={<GroupIcon />}
            onClick={() => handleNavigation('/group')}
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
  );
};

export default BottomNavigationMenu;
