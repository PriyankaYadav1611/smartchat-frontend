import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Checkbox, ListItemText } from '@mui/material';

const ChatPopup = ({ users }: { users: { id: number, username: string }[] }) => {
  const [open, setOpen] = useState(false);
  const [chatType, setChatType] = useState<string>(''); // Group or 1:1
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]); // For group chat

  // Open or close modal
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle chat type selection
  const handleChatTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setChatType(event.target.value as string);
    setSelectedUsers([]); // Clear users selection when switching
  };

  // Handle selecting users for group chat
  const handleUserSelection = (event: any) => {
    const value = event.target.value as number[];
    setSelectedUsers(value);
  };

  const handleStartChat = () => {
    // Logic to start chat based on selected chatType and selectedUsers
    if (chatType === 'group') {
      console.log('Starting group chat with users: ', selectedUsers);
    } else if (chatType === 'one-to-one') {
      console.log('Starting one-to-one chat with user: ', selectedUsers[0]);
    }
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        + Start Conversation
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Select Chat Option</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Chat Type</InputLabel>
            <Select value={chatType} onChange={handleChatTypeChange}>
              <MenuItem value="group">Group Chat</MenuItem>
              <MenuItem value="one-to-one">One-to-One Chat</MenuItem>
            </Select>
          </FormControl>

          {chatType === 'group' && (
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <InputLabel>Select Multiple Users</InputLabel>
              <Select
                multiple
                value={selectedUsers}
                onChange={handleUserSelection}
                renderValue={(selected: number[]) => selected.map(id => users.find(user => user.id === id)?.username).join(', ')}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUsers.indexOf(user.id) > -1} />
                    <ListItemText primary={user.username} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {chatType === 'one-to-one' && (
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <InputLabel>Select a User</InputLabel>
              <Select value={selectedUsers[0] || ''} onChange={handleUserSelection}>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleStartChat} color="primary" disabled={chatType === '' || (chatType === 'group' && selectedUsers.length === 0)}>
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChatPopup;
