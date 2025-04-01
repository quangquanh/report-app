"use client";

import { useState, useEffect } from "react";
import { Any } from "@/type/common";
import {
  Typography,
  Form,
  Input,
  Button,
  Card,
  Space,
  Table,
  Modal,
  message,
  Select,
} from "antd";
import type { TableProps } from "antd/lib/table";

export default function UsersPage() {
  const [users, setUsers] = useState<Any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Any | null>(null);
  const [currentUser, setCurrentUser] = useState<Any | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(user);
      if (user.role !== "admin") {
        alert("You do not have permission to access this page");
        window.location.href = "/";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    }
  };

  const handleSubmit = async (values: Any) => {
    setLoading(true);
    setError("");

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit user");
      }

      await fetchUsers();
      message.success(`User ${editingUser ? "updated" : "added"} successfully`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
    } catch (error) {
      console.error("Error submitting user:", error);
      setError("Failed to submit user");
      alert("Failed to submit user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      if (currentUser && userId === currentUser.userId) {
        alert("You cannot delete your own account");
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers();
      message.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Cannot delete user");
    }
  };

  const columns: TableProps<Any>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              delete record.password;
              setEditingUser(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ padding: "24px" }}>
        <div>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Add User
            </Button>

            <Modal
              title={editingUser ? "Edit User" : "Add New User"}
              open={isModalOpen}
              onCancel={() => {
                setIsModalOpen(false);
                form.resetFields();
                setEditingUser(null);
              }}
              footer={null}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={editingUser || {}}
              >
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please input name" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input email" },
                    { type: "email", message: "Please input a valid email" },
                  ]}
                >
                  <Input type="email" />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: !editingUser,
                      message: "Please input password",
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: "Please input role" }]}
                >
                  <Select>
                    <Select.Option value="admin">Admin</Select.Option>
                    <Select.Option value="user">User</Select.Option>
                  </Select>
                </Form.Item>

                {error && (
                  <Form.Item>
                    <Typography.Text type="danger">{error}</Typography.Text>
                  </Form.Item>
                )}

                <Form.Item>
                  <Space>
                    <Button
                      onClick={() => {
                        setIsModalOpen(false);
                        form.resetFields();
                        setEditingUser(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {editingUser ? "Update" : "Add"} User
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>

            <Card title="Users List">
              <Table
                columns={columns}
                dataSource={users.map((user) => ({ ...user, key: user.id }))}
              />
            </Card>
          </Space>
        </div>
      </div>
    </div>
  );
}
