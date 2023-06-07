import React, { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonIcon from '@mui/icons-material/Person';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const BottomNavigationMenu = ({ loggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down('md'));
  // Map routes to values
  const routeToValueMap = {
    '/': 0,
    '/browser': 1,
    '/user': 2,
    '/login': loggedIn ? -1 : 1,
    '/register': loggedIn ? -1 : 2,
  };
  const [value, setValue] = React.useState(routeToValueMap[location.pathname]);
  // For hide on scroll sticky footer
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isFooterVisible, setIsFooterVisible] = useState(true);

  // Hide on scroll sticky footer
  useEffect(() => {
    const handleScroll = () => {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        setIsFooterVisible(false);
      } else {
        setIsFooterVisible(true);
      }
      setLastScrollTop(st <= 0 ? 0 : st);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop]);


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
    <Paper sx={{
      position: 'fixed',
      bottom: isFooterVisible ? 0 : -100,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 3,
      marginTop: '2rem',
      transition: 'bottom 0.3s'
    }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction
          label="Welcome"
          icon={<HomeIcon />}
          onClick={() => handleNavigation('/')}
        />
        <BottomNavigationAction
          key="browser"
          label="Player Browser"
          icon={<SportsTennisIcon />}
          onClick={() => handleNavigation('/browser')}
        />,
        {loggedIn ? (
          [
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
