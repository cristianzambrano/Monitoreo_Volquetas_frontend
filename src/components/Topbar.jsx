// src/components/Topbar.jsx
import { Menu, MenuItem, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Topbar({ onToggleSidebar }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between bg-[#006341] text-white p-4">
      <div className="flex items-center space-x-4">
        <IconButton onClick={onToggleSidebar} color="inherit">
          <MenuIcon />
        </IconButton>
        <img src="/logogad.png" alt="Logo GAD" className="h-12 w-auto" />
        <div className="text-xl font-bold">Monitoreo de Volquetas</div>
      </div>
      <div>
        <IconButton onClick={handleMenu} color="inherit">
          <AccountCircle />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default Topbar;

