import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Box, Avatar, Modal, TextField, MenuItem, Typography } from "@mui/material";

const roles = ["user", "admin"];
const genders = ["male", "female"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);  
const [editFile, setEditFile] = useState(null);
  const [editForm, setEditForm] = useState({
    gender: "",
    age: "",
    role: "",
    img_path: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get("http://localhost:8000/api/users/get/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleEdit = (id) => {
    const user = users.find(u => u.id === id);
    setEditUser(user);
    setEditForm({
      gender: user.gender || "",
      age: user.age || "",
      role: user.role || "",
      img_path: user.img_path || ""
    });
    setEditOpen(true);
  };

  const handleFileChange = (e) => {
  setEditFile(e.target.files[0]);
};

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

const handleEditSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("gender", editForm.gender);
  formData.append("age", editForm.age);
  formData.append("role", editForm.role);
  if (editFile) {
    formData.append("img", editFile);
  }
  try {
    await axios.put(
      `http://localhost:8000/api/users/update/${editUser.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setEditOpen(false);
    setEditFile(null);
    fetchUsers();
  } catch (err) {
    alert("Failed to update user");
  }
};
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:8000/api/users/delete/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const columns = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "age", headerName: "Age", flex: 1 },
    {
      field: "img_path",
      headerName: "Avatar",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <Avatar src={params.value} alt={params.row.username} />
        ) : (
          <Avatar>{params.row.username?.[0]}</Avatar>
        ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      flex: 1,
      valueGetter: (params) =>
        params.value ? new Date(params.value).toLocaleString() : "",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={users.map((user) => ({ ...user, id: user.id }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
        getRowId={(row) => row.id}
      />

            <Modal open={editOpen} onClose={() => setEditOpen(false)}>
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                minWidth: 350,
                borderRadius: 2
            }}><Typography variant="h6" mb={2}>Edit User</Typography>
    <form onSubmit={handleEditSubmit}>
      <TextField
        label="Gender"
        name="gender"
        select
        fullWidth
        margin="normal"
        value={editForm.gender}
        onChange={handleEditChange}
      >
        {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
      </TextField>
      <TextField
        label="Age"
        name="age"
        type="number"
        fullWidth
        margin="normal"
        value={editForm.age}
        onChange={handleEditChange}
      />
             <TextField
        label="Role"
        name="role"
        select
        fullWidth
        margin="normal"
        value={editForm.role}
        onChange={handleEditChange}
      >
        {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      <TextField
        label="Avatar URL"
        name="img_path"
        fullWidth
        margin="normal"
        value={editForm.img_path}
        disabled
      />
      <Box mt={2}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: 16 }}
        />
      </Box>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={() => setEditOpen(false)} sx={{ mr: 2 }}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">Save</Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Users;