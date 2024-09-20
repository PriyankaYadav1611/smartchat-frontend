import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  TextField
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { createNewGroup } from '../api/groups';
import { addGroup, setSelectedGroup } from '../store/groupSlice';


const ChatPopup = ({ allUsers }: { allUsers: { id: number, username: string }[] } ) => {
  const dispatch = useDispatch();

  const groups = useSelector((state: RootState) => state.group.groups);

  const [open, setOpen] = useState(false);
  const [chatType, setChatType] = useState<string>(''); // Group or 1:1
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]); // For group chat
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupTitle, setGroupTitle] = useState<string>(''); // New field for group title
  const { me, isLoading: isGettingMe, error: getMeError} = useSelector((state: RootState) => state.me);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setChatType('');
    setSelectedUsers([]);
    setSelectedUser(null);
    setGroupTitle('');
  };

  const handleChatTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setChatType(event.target.value as string);
    setSelectedUsers([]); // Clear user selection when switching
  };

  const handleUserSelection = async (event: any) => {
    console.log("user selected:", event.target.value);
    console.log("chatType:", chatType);
    if (chatType == 'group') {
      const value = event.target.value as number[];
      setSelectedUsers(value);
      return;
    }
    setSelectedUser(event.target.value);
  };

  useEffect(() => {
    if (selectedUser) {
      handleStartChat();
    }
  }, [selectedUser])

  const handleStartChat = async() => {
    let groupType = 'ONE_TO_ONE';
    if (chatType === 'group') {
        groupType = 'MANY_TO_MANY';
        console.log('Starting group chat with title:', groupTitle, 'and users:', selectedUsers);
    } else if (chatType === 'one-to-one') {
        console.log('Starting one-to-one chat with user:', selectedUser);
        // if there is already one to one chat with this user, 
        // start that chat window
        let existingOneToOneGroup = null;
        groups.forEach(group => {
          if (group.type == 'ONE_TO_ONE') {
            const groupMembers = group.groupMembers;
            const groupMemberId = groupMembers.find((groupMemberId) => {
              return groupMemberId == selectedUser;
            });
            if (groupMemberId) {
              // ***Don't list self in all users
              // there is already one to one group with this user
              existingOneToOneGroup = group;
              return;
            }
          }
        });

        if (existingOneToOneGroup) {
          // open existing one to one group
          dispatch(setSelectedGroup({ selectedGroup: existingOneToOneGroup }));
          handleClose();
          return;
        } else {
          console.log("selected user is new for one to one chat");
        }
    }

    // make request to create a new group
    let groupMembers;
    if (groupType == 'ONE_TO_ONE') {
      groupMembers = [selectedUser, me.id];
      console.log("groupMembers:", groupMembers);
    } else {
      groupMembers = [...selectedUsers];
    }
    let group;
    try {
      group = await createNewGroup(groupType == 'MANY_TO_MANY' ? groupTitle : 'ONE_TO_ONE', null, groupType, groupMembers);
    } catch (error) {
      console.log("Group couldn't be created!");
      return;
    }
    // add group to store
    dispatch(addGroup({group: group}));
    // TODO: subscribe only to this group

    // open this createdGroup
    dispatch(setSelectedGroup({ selectedGroup: group }));
    // subscribe to this group 
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        + New Chat
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
            <>
              <TextField
                label="Group Title"
                fullWidth
                style={{ marginTop: 20 }}
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
              />
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel>Select Multiple Users</InputLabel>
                <Select
                  multiple
                  value={selectedUsers}
                  onChange={handleUserSelection}
                  renderValue={(selected: number[]) =>
                    selected.map((id) => allUsers.find((user) => user.id === id)?.username).join(', ')
                  }
                >
                  {allUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={selectedUsers.indexOf(user.id) > -1} />
                      <ListItemText primary={user.username} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {chatType === 'one-to-one' && (
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <InputLabel>Select a User</InputLabel>
              <Select
                value={selectedUser || ''}
                onChange={handleUserSelection}
              >
                {/* show only users which are not in one to one group
                with this user */}
                {allUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleStartChat}
            color="primary"
            disabled={
              chatType === '' ||
              (chatType === 'group' && (selectedUsers.length === 0 || groupTitle === '')) ||
              (chatType === 'one-to-one' && selectedUsers.length === 0)
            }
          >
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChatPopup;
