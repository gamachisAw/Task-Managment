import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Paper,
  Divider,
  Box,
  Grid,
  Chip,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Fab,
  Slide,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  useMediaQuery
} from "@mui/material";
import {
  Add,
  Delete,
  Dashboard,
  Search,
  Folder,
  Description,
  ArrowForward,
  Close,
  Star,
  StarBorder,
  FilterList,
  Menu
} from "@mui/icons-material";

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [boards, setBoards] = useState(() => JSON.parse(localStorage.getItem("boards")) || []);
  const [newBoardName, setNewBoardName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Analysis: total boards and total tasks
  const totalTasks = useMemo(() => {
    return boards.reduce((count, board) => count + (board.tasks?.length || 0), 0);
  }, [boards]);

  // Filter and sort boards
  const filteredBoards = useMemo(() => {
    let result = boards.filter(board => 
      board.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Apply sorting
    if (sortBy === "recent") {
      return result;
    } else if (sortBy === "name") {
      return result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tasks") {
      return result.sort((a, b) => (b.tasks?.length || 0) - (a.tasks?.length || 0));
    }
    return result;
  }, [boards, searchTerm, sortBy]);

  const handleAddBoard = () => {
    if (!newBoardName.trim()) {
      setSnackbar({ open: true, message: "Board name cannot be empty", severity: "error" });
      return;
    }
    
    const newBoard = {
      id: uuidv4(),
      name: newBoardName.trim(),
      tasks: [],
      starred: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);
    localStorage.setItem("boards", JSON.stringify(updatedBoards));
    setNewBoardName("");
    setAddDialogOpen(false);
    setSnackbar({ open: true, message: "Board created successfully", severity: "success" });
  };

  const handleDeleteBoard = (id) => {
    const updatedBoards = boards.filter((b) => b.id !== id);
    setBoards(updatedBoards);
    localStorage.setItem("boards", JSON.stringify(updatedBoards));
    setDeleteConfirmOpen(false);
    setSnackbar({ open: true, message: "Board deleted successfully", severity: "info" });
  };

  const toggleStar = (id) => {
    const updatedBoards = boards.map(board => 
      board.id === id ? { ...board, starred: !board.starred } : board
    );
    setBoards(updatedBoards);
    localStorage.setItem("boards", JSON.stringify(updatedBoards));
    setSnackbar({ open: true, message: "Board starred", severity: "info" });
  };

  const openDeleteDialog = (id) => {
    setBoardToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 3,
          boxShadow: 1
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Dashboard fontSize="medium" color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              Taskify
            </Typography>
          </Stack>
          
          <IconButton onClick={toggleMobileMenu}>
            <Menu />
          </IconButton>
        </Box>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="recent">Recently Added</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="tasks">Task Count</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setAddDialogOpen(true)}
            >
              New Board
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="add"
          sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
          onClick={() => setAddDialogOpen(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Dashboard fontSize="large" color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark' }}>
              Taskify Boards
            </Typography>
          </Stack>
          
          <Badge badgeContent={boards.length} color="primary">
            <Chip 
              label="Boards" 
              color="info" 
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: 2 }}
              avatar={<Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
                <Folder fontSize="small" />
              </Avatar>}
            />
          </Badge>
        </Stack>
      )}

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1 : 3} mb={4}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
              <Folder fontSize={isMobile ? "small" : "medium"} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "body2" : "h6"} color="text.secondary">Total Boards</Typography>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>{boards.length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ 
            p: isMobile ? 2 : 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            height: '100%'
          }}>
            <Avatar sx={{ bgcolor: 'secondary.light', mr: 2, width: 40, height: 40 }}>
              <Description fontSize={isMobile ? "small" : "medium"} />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "body2" : "h6"} color="text.secondary">Total Tasks</Typography>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>{totalTasks}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter and Search Bar - Desktop */}
      {!isMobile && (
        <Paper elevation={0} sx={{ 
          p: isTablet ? 2 : 3, 
          mb: 3, 
          borderRadius: 4, 
          bgcolor: 'background.paper', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size={isTablet ? "small" : "medium"}
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 }
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size={isTablet ? "small" : "medium"}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="recent">Recently Added</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="tasks">Task Count</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => setAddDialogOpen(true)}
                size={isTablet ? "small" : "medium"}
                sx={{ 
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                  },
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
              >
                New Board
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Boards Grid */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {filteredBoards.length === 0 ? (
          <Grid item xs={12}>
            <Box textAlign="center" p={isMobile ? 4 : 6} sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24'%3E%3Cpath fill='%2390a4ae' d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z'/%3E%3C/svg%3E" 
                alt="No boards" 
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Typography variant={isMobile ? "h6" : "h5"} color="textSecondary" gutterBottom>
                No boards found
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} color="textSecondary" mb={2}>
                {searchTerm ? "No boards match your search" : "Create your first board to get started"}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                size={isMobile ? "small" : "medium"}
              >
                Create Board
              </Button>
            </Box>
          </Grid>
        ) : (
          filteredBoards.map((board) => (
            <Grid item xs={12} sm={6} md={4} key={board.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-5px)',
                    boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.1)' : '0 6px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        sx={{ fontWeight: 600 }}
                        noWrap
                      >
                        {board.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Created: {formatDate(board.createdAt)}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleStar(board.id)}
                      sx={{ mt: -0.5, ml: 1 }}
                    >
                      {board.starred ? (
                        <Star color="warning" fontSize={isMobile ? "small" : "medium"} />
                      ) : (
                        <StarBorder fontSize={isMobile ? "small" : "medium"} />
                      )}
                    </IconButton>
                  </Box>
                  
                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" rowGap={1}>
                    <Chip 
                      label={`${board.tasks?.length || 0} tasks`}
                      size={isMobile ? "small" : "medium"}
                      color="info"
                      icon={<Description fontSize={isMobile ? "small" : "medium"} />}
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip 
                      label={board.starred ? "Starred" : "Not starred"}
                      size={isMobile ? "small" : "medium"}
                      color={board.starred ? "warning" : "default"}
                      variant="outlined"
                      icon={<Star fontSize={isMobile ? "small" : "medium"} />}
                      sx={{ fontWeight: 500 }}
                    />
                  </Stack>
                </CardContent>
                
                <CardContent sx={{ pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    component={Link}
                    to={`/board/${board.id}`}
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2 }}
                  >
                    Open
                  </Button>
                  <IconButton 
                    size={isMobile ? "small" : "medium"} 
                    color="error" 
                    onClick={() => openDeleteDialog(board.id)}
                    sx={{ 
                      bgcolor: 'error.light', 
                      color: 'white', 
                      '&:hover': { bgcolor: 'error.main' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Delete fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add Board Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="sm"
        TransitionComponent={Slide}
        TransitionProps={{ direction: isMobile ? "up" : "left" }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: isMobile ? 'sticky' : 'static',
          top: 0,
          zIndex: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Board</Typography>
          <IconButton onClick={() => setAddDialogOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Stack spacing={3} sx={{ pt: isMobile ? 1 : 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              variant="outlined"
              sx={{ mb: isMobile ? 1 : 2 }}
              onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          pt: 0,
          position: isMobile ? 'sticky' : 'static',
          bottom: 0,
          bgcolor: 'background.paper'
        }}>
          <Button 
            onClick={() => setAddDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddBoard}
            disabled={!newBoardName.trim()}
            sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}
            size={isMobile ? "small" : "medium"}
          >
            Create Board
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this board? All tasks in this board will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteBoard(boardToDelete)} 
            color="error" 
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            width: isMobile ? '90%' : '100%', 
            borderRadius: 2, 
            boxShadow: 3 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;