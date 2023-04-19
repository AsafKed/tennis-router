// BottomNavigationMenu.js
import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const BottomNavigationMenu = () => {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down('md'));

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
      <BottomNavigationAction
        label="Groups"
        icon={<GroupIcon />}
        onClick={() => handleNavigation('/group')}
      />
      <BottomNavigationAction
        label="User"
        icon={<PersonIcon />}
        onClick={() => handleNavigation('/user')}
      />
    </BottomNavigation>
  );
};

export default BottomNavigationMenu;
