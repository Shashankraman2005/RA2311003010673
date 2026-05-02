import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Container, Box, Tabs, Tab,
  Card, CardContent, Chip, Select, MenuItem, FormControl,
  InputLabel, Badge, CircularProgress, Alert, Button
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

const AUTH = {
  email: "mr8476@srmist.edu.in",
  name: "Murry Shashank Raman",
  rollNo: "RA2311003010673",
  accessCode: "QkbpxH",
  clientID: "d799f98c-917b-42e9-8673-fe0e8353937d",
  clientSecret: "pzbrnXNtMcprbHwY"
};

const PRIORITY_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

const TYPE_COLORS = {
  Placement: "success",
  Result: "primary",
  Event: "warning"
};

function getPriorityScore(n) {
  const typeWeight = PRIORITY_WEIGHTS[n.Type] || 0;
  const recencyScore = new Date(n.Timestamp).getTime() / 1e12;
  return typeWeight + recencyScore;
}

function getTopN(notifications, n = 10) {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, n);
}

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [filterType, setFilterType] = useState("All");
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const authRes = await axios.post(
        "/evaluation-service/auth",
        AUTH
      );
      const token = authRes.data.access_token;
      const res = await axios.get(
        "/evaluation-service/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data.notifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markViewed = (id) => {
    setViewedIds(prev => new Set([...prev, id]));
  };

  const allFiltered = notifications.filter(
    n => filterType === "All" || n.Type === filterType
  );

  const priorityFiltered = getTopN(notifications, topN).filter(
    n => filterType === "All" || n.Type === filterType
  );

  const unreadCount = notifications.filter(n => !viewedIds.has(n.ID)).length;

  const NotificationCard = ({ n }) => {
    const isNew = !viewedIds.has(n.ID);
    return (
      <Card
        onClick={() => markViewed(n.ID)}
        sx={{
          mb: 2,
          cursor: "pointer",
          border: isNew ? "2px solid #1976d2" : "1px solid #e0e0e0",
          background: isNew ? "#f0f7ff" : "#fff",
          transition: "all 0.2s",
          "&:hover": { boxShadow: 4 }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Chip
              label={n.Type}
              color={TYPE_COLORS[n.Type] || "default"}
              size="small"
            />
            <Box display="flex" gap={1} alignItems="center">
              {isNew && <Chip label="NEW" color="error" size="small" />}
              <Typography variant="caption" color="text.secondary">
                {n.Timestamp}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1" fontWeight={isNew ? 700 : 400}>
            {n.Message}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
      <Typography ml={2}>Loading notifications...</Typography>
    </Box>
  );

  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">Error: {error}</Alert>
    </Container>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top navbar */}
      <AppBar position="sticky">
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Campus Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3 }}>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab
            icon={<NotificationsIcon />}
            label={`All (${notifications.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<StarIcon />}
            label="Priority Inbox"
            iconPosition="start"
          />
        </Tabs>

        {/* Filters row */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>

          {tab === 1 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Top N</InputLabel>
              <Select
                value={topN}
                label="Top N"
                onChange={(e) => setTopN(e.target.value)}
              >
                <MenuItem value={10}>Top 10</MenuItem>
                <MenuItem value={15}>Top 15</MenuItem>
                <MenuItem value={20}>Top 20</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            size="small"
            onClick={() => setViewedIds(new Set())}
          >
            Mark all as new
          </Button>
        </Box>

        {/* Notification list */}
        {tab === 0
          ? allFiltered.map(n => <NotificationCard key={n.ID} n={n} />)
          : priorityFiltered.map(n => <NotificationCard key={n.ID} n={n} />)
        }

        {(tab === 0 ? allFiltered : priorityFiltered).length === 0 && (
          <Alert severity="info">No notifications found for this filter.</Alert>
        )}

      </Container>
    </Box>
  );
}