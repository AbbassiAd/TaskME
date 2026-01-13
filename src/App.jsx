import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserForm from './pages/Users/UserForm';
import UserList from './pages/Users/UsersList';
import Profile from './pages/Users/Profile';
import TaskList from './pages/Tasks/TaskList';
import TaskForm from './pages/Tasks/TaskForm';
import TaskDetails from './pages/Tasks/TaskDetails';
import TaskAssignment from './pages/Tasks/TaskAssignment';
import VehicleList from './pages/Vehicles/VehicleList';
import MyTasks from './pages/Assignments/MyTasks';
import Chat from './pages/Communication/Chat';
import NotFound from './pages/error/NotFound';
import Unauthorized from './pages/error/NonAcces';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>

            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
            
           
              <Route path="profile" element={<Profile />} />
              <Route
  index
  element={
    <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/new"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="tasks"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <TaskList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks/new"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <TaskForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <TaskForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks/:id"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <TaskDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks/:id/assign"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <TaskAssignment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="vehicles"
                element={
                  <ProtectedRoute allowedRoles={['coordinator', 'superadmin']}>
                    <VehicleList />
                  </ProtectedRoute>
                }
              />

          
              <Route
                path="my-tasks"
                element={
                  <ProtectedRoute allowedRoles={['auditor']}>
                    <MyTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute allowedRoles={['auditor','coordinator', 'superadmin']}>
                    <Chat />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;


