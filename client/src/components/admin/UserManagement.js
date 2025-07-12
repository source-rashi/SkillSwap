import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight, Ban, X } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [rejectSkillModal, setRejectSkillModal] = useState(null);
  const [banUserModal, setBanUserModal] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        search,
        status: statusFilter,
      };

      const response = await api.get('/admin/users', { params });
      console.log('Users API Response:', response);
      setUsers(Array.isArray(response.users) ? response.users.filter(user => user && user._id && user.name && user.email) : []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
      });
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to fetch users';
      toast.error(errorMessage);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to update user status';
      toast.error(errorMessage);
      console.error('Error toggling user status:', error);
    }
  };

  const handleBanUser = async (userId, banReason) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isBanned: true, banReason });
      toast.success('User banned successfully');
      setBanUserModal(null);
      fetchUsers();
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to ban user';
      toast.error(errorMessage);
      console.error('Error banning user:', error);
    }
  };

  const handleRejectSkill = async (userId, skill, type) => {
    try {
      await api.post('/admin/users/skills/reject', { id: userId, skill, type });
      toast.success(`Skill "${skill}" rejected successfully`);
      setRejectSkillModal(null);
      fetchUsers();
    } catch (error) {
      const errorMessage = error.error || error.message || 'Failed to reject skill';
      toast.error(errorMessage);
      console.error('Error rejecting skill:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <div className="flex space-x-2">
              {['all', 'active', 'inactive', 'banned'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({pagination.total})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email || 'No email'}
                            </div>
                            {user.isBanned && (
                              <div className="text-xs text-red-600">
                                Banned: {user.banReason || 'No reason provided'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="mb-1">
                            <span className="text-xs text-gray-500">Offers: </span>
                            {(user.skillsOffered || []).map(skill => (
                              <span key={skill} className="inline-block mr-2">
                                {skill}
                                <button
                                  onClick={() => setRejectSkillModal({ userId: user._id, skill, type: 'offered' })}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Wants: </span>
                            {(user.skillsWanted || []).map(skill => (
                              <span key={skill} className="inline-block mr-2">
                                {skill}
                                <button
                                  onClick={() => setRejectSkillModal({ userId: user._id, skill, type: 'wanted' })}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isBanned
                              ? 'bg-red-100 text-red-800'
                              : user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!user.isBanned && (
                          <button
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm mr-2 ${
                              user.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setBanUserModal({ userId: user._id, isBanned: user.isBanned })}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                            user.isBanned
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.isBanned ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * 20) + 1} to{' '}
                {Math.min(pagination.currentPage * 20, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {rejectSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Skill</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject the skill "{rejectSkillModal.skill}" from {rejectSkillModal.type} skills?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectSkillModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectSkill(rejectSkillModal.userId, rejectSkillModal.skill, rejectSkillModal.type)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {banUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{banUserModal.isBanned ? 'Unban User' : 'Ban User'}</h3>
            {!banUserModal.isBanned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ban Reason</label>
                <input
                  type="text"
                  placeholder="Enter ban reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setBanUserModal({ ...banUserModal, banReason: e.target.value })}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setBanUserModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBanUser(banUserModal.userId, banUserModal.banReason)}
                className={`px-4 py-2 rounded-md text-white ${
                  banUserModal.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {banUserModal.isBanned ? 'Unban' : 'Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;