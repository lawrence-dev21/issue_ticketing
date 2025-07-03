
import React, { useState, FormEvent } from 'react';
import { useData } from '../../hooks/useData';
import { UserRole } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { PlusCircleIcon, UsersIcon } from '../../components/icons/LucideIcons';

  const AdminUsersPage: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.OFFICER);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(''); // For demo purposes
  const [formError, setFormError] = useState('');


  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newUserName || !newUserEmail || !newUserPassword) {
      setFormError('All fields are required.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(newUserEmail)) {
        setFormError('Please enter a valid email address.');
        return;
    }

    addUser({ name: newUserName, email: newUserEmail, role: newUserRole, password: newUserPassword });
    // Reset form and close modal
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole(UserRole.OFFICER);
    setNewUserPassword('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <UsersIcon className="mr-3 text-ministry-blue" size={28}/> User Management
        </h2>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <PlusCircleIcon size={20} className="inline mr-2"/> Add New User
        </Button>
      </div>
      {successMessage && (
  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-md text-sm">
    {successMessage}
  </div>
)}


      <Card>
        {users.length === 0 ? (
          <p className="text-gray-500">No users found. Add some users to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>

                  {/* Add actions column if needed, e.g., Edit, Delete */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role} </span> </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="inline-flex shadow-sm rounded-md overflow-hidden border border-gray-300">
                       <button
                       type="button"
                        onClick={() => {
                        setEditingUser(user);
                        setIsEditModalOpen(true); }}
                       className="px-4 py-2 text-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none"> Edit</button>
                        <div className="w-px bg-gray-300" />
                        <button
                        onClick={() => {
                       const shouldDelete = window.confirm(`Are you sure you want to delete ${user.name}?`);
                       if (shouldDelete) {
                       deleteUser(user.id).then((success) => {
                       if (success) {
                        setSuccessMessage('User deleted successfully!');
                        setTimeout(() => setSuccessMessage(''), 4000);
                       } else {
                        alert('Failed to delete user.')  }
                        }); }
                           }}
                          className="px-4 py-2 text-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none"> Delete </button>
                          </div>
                        </td>
                        </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormError('');}} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{formError}</div>}
          <Input label="Full Name" id="newUserName" value={newUserName} onChange={e => setNewUserName(e.target.value)} required />
          <Input label="Email" id="newUserEmail" type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required />
          <Input label="Password" id="newUserPassword" type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required placeholder="Min. 6 characters" />
          <Select label="Role" id="newUserRole" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)} required>
            <option value={UserRole.OFFICER}>ICT Officer</option>
            <option value={UserRole.ADMIN}>Administrator</option>
          </Select>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setFormError(''); }}>Cancel</Button>
            <Button type="submit" variant="primary">Add User</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
       {editingUser && (
    <form onSubmit={async(e) => { e.preventDefault();
        // Update the user (implement your update logic here)
        const success = await updateUser(editingUser.id, editingUser);
    if (success) {
      setIsEditModalOpen(false);
      console.log(editingUser.id)
      setSuccessMessage('User successfully updated!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      alert('Failed to update user.');
    }
  }}
      className="space-y-4">
        <Input
        label="Full Name"
        id="editUserName"
        value={editingUser.name}
        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
        required
      />
      <Input
        label="Email"
        id="editUserEmail"
        type="email"
        value={editingUser.email}
        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
        required
      />
      <Select
        label="Role"
        id="editUserRole"
        value={editingUser.role}
        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
        required
      >
        <option value={UserRole.OFFICER}>ICT Officer</option>
        <option value={UserRole.ADMIN}>Administrator</option>
      </Select>
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </div>
    </form>
  )}
</Modal>
 </div>
  );
};


export default AdminUsersPage;
