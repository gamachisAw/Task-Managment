import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Avatar,
  Badge,
  useTheme,
  InputAdornment,
  TablePagination,
  TableSortLabel,
  Snackbar,
  Alert,
  Fab,
  Slide,
  Grow,
  Zoom,
  Grid,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  Search,
  Today,
  PriorityHigh,
  CheckCircle,
  Star,
  StarBorder,
  Close,
  DragHandle,
  Refresh,
  MoreVert,
} from "@mui/icons-material";
import { format, isToday, isTomorrow, parseISO, isPast, addDays } from "date-fns";

const statuses = [
  { id: "todo", label: "To Do", color: "default", icon: <DragHandle /> },
  { id: "progress", label: "In Progress", color: "primary", icon: <Refresh /> },
  { id: "done", label: "Done", color: "success", icon: <CheckCircle /> }
];

const priorities = [
  { label: "Low", color: "info", icon: <StarBorder fontSize="small" /> },
  { label: "Medium", color: "warning", icon: <Star fontSize="small" /> },
  { label: "High", color: "error", icon: <PriorityHigh fontSize="small" /> }
];

const BoardPage = () => {
  const { boardId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Enhanced data validation for localStorage
  const [boards, setBoards] = useState(() => {
    try {
      const storedBoards = JSON.parse(localStorage.getItem("boards")) || [];
      return storedBoards.map(board => ({
        ...board,
        tasks: (board.tasks || []).map(task => ({
          ...task,
          createdAt: task.createdAt || new Date().toISOString(),
          starred: task.starred || false,
          dueDate: task.dueDate || "",
          priority: task.priority || "Medium",
          status: task.status || "todo"
        }))
      }));
    } catch (e) {
      console.error("Error loading boards:", e);
      return [];
    }
  });
  
  const board = boards.find((b) => b.id === boardId);
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [newTask, setNewTask] = useState({ text: "", status: "todo", priority: "Medium", dueDate: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [orderBy, setOrderBy] = useState("dueDate");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && editTask) {
        setEditTask(null);
      }
      if (e.key === "Escape" && addTaskDialogOpen) {
        setAddTaskDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editTask, addTaskDialogOpen]);

  const updateLocalStorage = (newBoards) => {
    try {
      setBoards(newBoards);
      localStorage.setItem("boards", JSON.stringify(newBoards));
    } catch (e) {
      console.error("Error saving boards:", e);
      setSnackbar({ open: true, message: "Failed to save data", severity: "error" });
    }
  };

  const handleAddTask = () => {
    if (!newTask.text.trim()) {
      setSnackbar({ open: true, message: "Task description cannot be empty", severity: "error" });
      return;
    }
    
    const task = {
      id: Date.now(),
      text: newTask.text.trim(),
      status: newTask.status,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      starred: false
    };

    const updatedBoards = boards.map((b) => 
      b.id === boardId ? { ...b, tasks: [...(b.tasks || []), task] } : b
    );
    
    updateLocalStorage(updatedBoards);
    setNewTask({ text: "", status: "todo", priority: "Medium", dueDate: "" });
    setSnackbar({ open: true, message: "Task added successfully", severity: "success" });
    setAddTaskDialogOpen(false);
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updatedBoards = boards.map((b) => {
      if (b.id === boardId) {
        return {
          ...b,
          tasks: (b.tasks || []).map((t) => 
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        };
      }
      return b;
    });
    updateLocalStorage(updatedBoards);
    setSnackbar({ open: true, message: "Task status updated", severity: "info" });
  };

  const openDeleteDialog = (taskId) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteTask = () => {
    const updatedBoards = boards.map((b) => 
      b.id === boardId 
        ? { ...b, tasks: (b.tasks || []).filter((t) => t.id !== taskToDelete) } 
        : b
    );
    updateLocalStorage(updatedBoards);
    setDeleteConfirmOpen(false);
    setSnackbar({ open: true, message: "Task deleted successfully", severity: "info" });
  };

  const openEditDialog = (task) => {
    setEditTask({...task});
  };

  const saveEdit = () => {
    if (!editTask?.text?.trim()) {
      setSnackbar({ open: true, message: "Task description cannot be empty", severity: "error" });
      return;
    }
    
    const updatedBoards = boards.map((b) => {
      if (b.id === boardId) {
        return {
          ...b,
          tasks: (b.tasks || []).map((t) => 
            t.id === editTask.id ? editTask : t
          )
        };
      }
      return b;
    });
    
    updateLocalStorage(updatedBoards);
    setEditTask(null);
    setSnackbar({ open: true, message: "Task updated successfully", severity: "success" });
  };

  const toggleStar = (taskId) => {
    const updatedBoards = boards.map((b) => {
      if (b.id === boardId) {
        return {
          ...b,
          tasks: (b.tasks || []).map((t) => 
            t.id === taskId ? { ...t, starred: !t.starred } : t
          )
        };
      }
      return b;
    });
    updateLocalStorage(updatedBoards);
    setSnackbar({ open: true, message: "Task starred", severity: "info" });
  };

  // Enhanced date formatting with error handling
  const formatDueDate = (dateString) => {
    if (!dateString) return "No due date";
    
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isPast(date)) return "Overdue";
      
      return format(date, "MMM d, yyyy");
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  const getDueDateColor = (dateString) => {
    if (!dateString) return "default";
    
    try {
      const date = parseISO(dateString);
      if (isPast(date)) return "error";
      if (isToday(date)) return "warning";
      if (isTomorrow(date)) return "info";
      
      return "default";
    } catch (e) {
      console.error("Error processing date:", e);
      return "default";
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredTasks = board?.tasks?.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const sortedTasks = filteredTasks.sort((a, b) => {
    const isAsc = order === "asc";
    
    // Starred tasks always come first
    if (a.starred !== b.starred) {
      return a.starred ? -1 : 1;
    }
    
    if (orderBy === "dueDate") {
      const dateA = a.dueDate ? parseISO(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? parseISO(b.dueDate).getTime() : Infinity;
      return isAsc ? dateA - dateB : dateB - dateA;
    }
    
    if (orderBy === "priority") {
      const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
      return isAsc 
        ? priorityOrder[a.priority] - priorityOrder[b.priority] 
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    
    if (orderBy === "createdAt") {
      return isAsc 
        ? new Date(a.createdAt) - new Date(b.createdAt) 
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    return 0;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, sortedTasks.length - page * rowsPerPage);

  const quickAddTask = () => {
    setNewTask({
      text: "",
      status: "todo",
      priority: "Medium",
      dueDate: format(addDays(new Date(), 3), "yyyy-MM-dd")
    });
    setAddTaskDialogOpen(true);
  };

  if (!board) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Board not found
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          startIcon={<ArrowBack />}
        >
          Back to Boards
        </Button>
      </Box>
    );
  }

  // Mobile Task Card Component
  const MobileTaskCard = ({ task }) => {
    const priority = priorities.find(p => p.label === task.priority);
    const status = statuses.find(s => s.id === task.status);
    
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette[priority?.color || 'default'].main}`
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'text.disabled' : 'inherit'
                }}
              >
                {task.text}
              </Typography>
              {task.createdAt && (
                <Typography variant="caption" color="textSecondary">
                  Created: {format(parseISO(task.createdAt), "MMM d, yyyy")}
                </Typography>
              )}
            </Box>
            <IconButton 
              size="small" 
              onClick={() => toggleStar(task.id)}
            >
              {task.starred ? (
                <Star color="warning" fontSize="small" />
              ) : (
                <StarBorder fontSize="small" />
              )}
            </IconButton>
          </Box>
          
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" rowGap={1}>
            <Chip 
              label={task.priority} 
              size="small" 
              color={priority?.color || "default"}
              icon={priority?.icon}
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              label={formatDueDate(task.dueDate)} 
              size="small" 
              color={getDueDateColor(task.dueDate)}
              variant={task.dueDate ? "filled" : "outlined"}
              icon={<Today fontSize="small" />}
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              label={status?.label} 
              size="small" 
              color={status?.color}
              icon={status?.icon}
              sx={{ fontWeight: 500 }}
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton 
            size="small" 
            onClick={() => openEditDialog(task)}
            sx={{ 
              color: 'primary.main',
              '&:hover': { bgcolor: 'primary.light' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => openDeleteDialog(task.id)}
            sx={{ 
              '&:hover': { bgcolor: 'error.light' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 100, ml: 1 }}>
            <Select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              sx={{ height: 32 }}
            >
              {statuses.map(status => (
                <MenuItem key={status.id} value={status.id}>{status.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)' 
    }}>
      {/* Floating Action Button */}
      <Zoom in={!addTaskDialogOpen}>
        <Fab 
          color="primary" 
          aria-label="add"
          sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
          onClick={quickAddTask}
        >
          <Add />
        </Fab>
      </Zoom>

      {/* Mobile Header */}
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 3,
          boxShadow: 1
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              component={Link} 
              to="/" 
              size="small"
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              {board.name}
            </Typography>
          </Stack>
          
          <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <MoreVert />
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
              placeholder="Search tasks..."
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
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>{status.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    {priorities.map(priority => (
                      <MenuItem key={priority.label} value={priority.label}>{priority.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<Add />} 
              onClick={quickAddTask}
              size="small"
            >
              Add Task
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title="Back to boards">
              <IconButton 
                component={Link} 
                to="/" 
                size="large" 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.05)' },
                  transition: 'transform 0.3s, background-color 0.3s'
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              {board.name}
            </Typography>
            <Badge badgeContent={board.tasks?.length || 0} color="primary">
              <Chip 
                label="Tasks" 
                color="info" 
                variant="outlined"
                sx={{ fontWeight: 600, borderRadius: 2 }}
                avatar={<Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
                  <Today fontSize="small" />
                </Avatar>}
              />
            </Badge>
          </Stack>
          
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={quickAddTask}
            sx={{ 
              borderRadius: 3, 
              px: 3, 
              py: 1, 
              fontWeight: 600,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
              },
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
          >
            Add Task
          </Button>
        </Stack>
      )}

      {/* Filter and Search Bar - Desktop */}
      {!isMobile && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search tasks..."
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
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: 'divider' },
                    "&:hover fieldset": { borderColor: 'primary.light' },
                    "&.Mui-focused fieldset": { borderColor: 'primary.main' },
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {statuses.map(status => (
                    <MenuItem key={status.id} value={status.id}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Priority"
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  {priorities.map(priority => (
                    <MenuItem key={priority.label} value={priority.label}>{priority.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Task List - Desktop Table */}
      {!isMobile && (
        <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.light }}>
                  <TableCell width="5%" sx={{ color: 'white', fontWeight: 600 }}>
                    <Star fontSize="small" />
                  </TableCell>
                  <TableCell width="40%" sx={{ color: 'white', fontWeight: 600 }}>
                    <TableSortLabel
                      active={orderBy === "text"}
                      direction={orderBy === "text" ? order : "asc"}
                      onClick={() => handleRequestSort("text")}
                      sx={{ color: 'white !important' }}
                    >
                      Task
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%" sx={{ color: 'white', fontWeight: 600 }}>
                    <TableSortLabel
                      active={orderBy === "priority"}
                      direction={orderBy === "priority" ? order : "asc"}
                      onClick={() => handleRequestSort("priority")}
                      sx={{ color: 'white !important' }}
                    >
                      Priority
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%" sx={{ color: 'white', fontWeight: 600 }}>
                    <TableSortLabel
                      active={orderBy === "dueDate"}
                      direction={orderBy === "dueDate" ? order : "asc"}
                      onClick={() => handleRequestSort("dueDate")}
                      sx={{ color: 'white !important' }}
                    >
                      Due Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="15%" sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell width="10%" align="center" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box textAlign="center" p={3}>
                        <img 
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24'%3E%3Cpath fill='%2390a4ae' d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E" 
                          alt="No tasks" 
                          style={{ opacity: 0.5, marginBottom: 16 }}
                        />
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          No tasks found
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Create your first task to get started
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<Add />}
                          onClick={quickAddTask}
                          sx={{ mt: 2 }}
                        >
                          Add Task
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((task) => {
                      const priority = priorities.find(p => p.label === task.priority);
                      const status = statuses.find(s => s.id === task.status);
                      
                      return (
                        <TableRow 
                          key={task.id}
                          hover 
                          onMouseEnter={() => setHoveredRow(task.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          sx={{ 
                            '&:last-child td': { border: 0 },
                            bgcolor: hoveredRow === task.id ? 'action.hover' : 'inherit',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <TableCell>
                            <Tooltip title={task.starred ? "Unstar task" : "Star task"}>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleStar(task.id)}
                                sx={{
                                  '&:hover': {
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'transform 0.2s'
                                }}
                              >
                                {task.starred ? (
                                  <Star fontSize="small" color="warning" />
                                ) : (
                                  <StarBorder fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              sx={{ 
                                fontWeight: 'medium',
                                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                color: task.status === 'done' ? 'text.disabled' : 'inherit'
                              }}
                            >
                              {task.text}
                            </Typography>
                            {task.createdAt && (
                              <Typography variant="caption" color="textSecondary">
                                Created: {format(parseISO(task.createdAt), "MMM d, yyyy")}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={task.priority} 
                              size="small" 
                              color={priority?.color || "default"}
                              icon={priority?.icon}
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={formatDueDate(task.dueDate)} 
                              size="small" 
                              color={getDueDateColor(task.dueDate)}
                              variant={task.dueDate ? "filled" : "outlined"}
                              icon={<Today fontSize="small" />}
                              sx={{ fontWeight: 500, borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={status?.label} 
                              size="small" 
                              color={status?.color}
                              icon={status?.icon}
                              sx={{ fontWeight: 600, borderRadius: 1, minWidth: 110 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  onClick={() => openEditDialog(task)}
                                  sx={{ 
                                    bgcolor: 'primary.light', 
                                    color: 'white', 
                                    '&:hover': { bgcolor: 'primary.main' },
                                    transition: 'transform 0.2s, background-color 0.2s'
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => openDeleteDialog(task.id)}
                                  sx={{ 
                                    bgcolor: 'error.light', 
                                    color: 'white', 
                                    '&:hover': { bgcolor: 'error.main' },
                                    transition: 'transform 0.2s, background-color 0.2s'
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
                {emptyRows > 0 && sortedTasks.length > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedTasks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>
      )}

      {/* Task List - Mobile Cards */}
      {isMobile && (
        <Box>
          {sortedTasks.length === 0 ? (
            <Box textAlign="center" p={4} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24'%3E%3Cpath fill='%2390a4ae' d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E" 
                alt="No tasks" 
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Create your first task to get started
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<Add />}
                onClick={quickAddTask}
                sx={{ mt: 2 }}
              >
                Add Task
              </Button>
            </Box>
          ) : (
            sortedTasks.map((task) => (
              <MobileTaskCard key={task.id} task={task} />
            ))
          )}
        </Box>
      )}

      {/* Add Task Dialog */}
      <Dialog 
        open={addTaskDialogOpen} 
        onClose={() => setAddTaskDialogOpen(false)}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Task</Typography>
          <IconButton onClick={() => setAddTaskDialogOpen(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Stack spacing={3} sx={{ pt: isMobile ? 1 : 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Task description"
              value={newTask.text}
              onChange={(e) => setNewTask({...newTask, text: e.target.value})}
              variant="outlined"
              sx={{ mb: isMobile ? 1 : 2 }}
            />
            
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    label="Priority"
                  >
                    {priorities.map(priority => (
                      <MenuItem key={priority.label} value={priority.label}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {priority.icon}
                          <span>{priority.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    label="Status"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {status.icon}
                          <span>{status.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Due date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Today />
                  </InputAdornment>
                )
              }}
              size={isMobile ? "small" : "medium"}
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
            onClick={() => setAddTaskDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddTask}
            disabled={!newTask.text.trim()}
            sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}
            size={isMobile ? "small" : "medium"}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog 
        open={Boolean(editTask)} 
        onClose={() => setEditTask(null)}
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Task</Typography>
          <IconButton onClick={() => setEditTask(null)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
          <Stack spacing={3} sx={{ pt: isMobile ? 1 : 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Task description"
              value={editTask?.text || ""}
              onChange={(e) => setEditTask({...editTask, text: e.target.value})}
              variant="outlined"
              sx={{ mb: isMobile ? 1 : 2 }}
              size={isMobile ? "small" : "medium"}
            />
            
            <Grid container spacing={isMobile ? 1 : 2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editTask?.priority || "Medium"}
                    onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
                    label="Priority"
                  >
                    {priorities.map(priority => (
                      <MenuItem key={priority.label} value={priority.label}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {priority.icon}
                          <span>{priority.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editTask?.status || "todo"}
                    onChange={(e) => setEditTask({...editTask, status: e.target.value})}
                    label="Status"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {status.icon}
                          <span>{status.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              fullWidth
              label="Due date"
              type="date"
              value={editTask?.dueDate || ""}
              onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Today />
                  </InputAdornment>
                )
              }}
              size={isMobile ? "small" : "medium"}
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
            onClick={() => setEditTask(null)} 
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveEdit}
            disabled={!editTask?.text?.trim()}
            sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}
            size={isMobile ? "small" : "medium"}
          >
            Save Changes
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
            Are you sure you want to delete this task? This action cannot be undone.
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
            onClick={confirmDeleteTask} 
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
        TransitionComponent={Grow}
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

export default BoardPage;