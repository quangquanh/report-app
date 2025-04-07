/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import {
  Layout,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
  Row,
  Col,
  Space,
  Dropdown,
  Spin,
} from "antd";
import { useAuth } from "@/hooks/useAuth";
import { Any } from "@/type/common";

const { Header, Content } = Layout;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isDefaultDataModalOpen, setIsDefaultDataModalOpen] = useState(false);
  const [defaultDataForm] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<Any | null>(null);

  useEffect(() => {
    setLoading(true);
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    setShowLogout(!!token);
    if (token) {
      const user = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(user);
      fetchUserDefaultData(user.userId);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const fetchUserDefaultData = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/default-data`);
      const data = await response.json();
      if (data.default_data) {
        defaultDataForm.setFieldsValue(data.default_data);
      }
    } catch (error) {
      console.error("Error fetching user default data:", error);
    }
  };

  // Watch for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setShowLogout(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("login", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("login", handleStorageChange);
    };
  }, []);

  return loading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin size="large" />
    </div>
  ) : (
    <Layout style={{ minHeight: "100vh" }}>
      {showLogout && (
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#1877F2",
            padding: "0 50px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: "32px", width: "auto" }}
            />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
              Ogival IP Protection
            </span>
          </div>
          {showLogout && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "edit",
                    label: "Edit Default Data",
                    onClick: () => setIsDefaultDataModalOpen(true),
                  },
                  {
                    key: "logout",
                    label: "Logout",
                    onClick: () => {
                      logout();
                      setShowLogout(false);
                    },
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div
                className="mr-4 flex gap-1 items-center"
                style={{ color: "white", cursor: "pointer" }}
              >
                {currentUser?.email || "User"}{" "}
                <svg
                  width={16}
                  height={16}
                  fill="none"
                  stroke="currentColor"
                  stroke-width="4"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  focusable="false"
                  className="arco-icon arco-icon-down"
                >
                  <path d="M39.6 17.443 24.043 33 8.487 17.443"></path>
                </svg>
              </div>
            </Dropdown>
          )}

          <Modal
            title="Edit Default Report Data"
            open={isDefaultDataModalOpen}
            onCancel={() => setIsDefaultDataModalOpen(false)}
            footer={null}
            width={600}
          >
            <Form
              form={defaultDataForm}
              layout="vertical"
              initialValues={currentUser?.default_data}
              onFinish={async (values) => {
                console.log(currentUser);
                try {
                  const response = await fetch(
                    `/api/users/${
                      currentUser?.userId || currentUser?.id
                    }/default-data`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ default_data: values }),
                    }
                  );

                  if (response.ok) {
                    message.success("Default data updated successfully");
                    setIsDefaultDataModalOpen(false);
                  } else {
                    throw new Error("Failed to update default data");
                  }
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                  message.error("Failed to update default data");
                }
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="job" label="Job">
                    <Input />
                  </Form.Item>
                  <Form.Item name="email" label="Email">
                    <Input type="email" />
                  </Form.Item>
                  <Form.Item name="name" label="Name">
                    <Input />
                  </Form.Item>
                  <Form.Item name="organization" label="Organization">
                    <Input />
                  </Form.Item>
                  <Form.Item name="relationship" label="Relationship">
                    <Select placeholder="Select relationship type">
                      <Select.Option value="OWNER">OWNER</Select.Option>
                      <Select.Option value="COUNSEL">COUNSEL</Select.Option>
                      <Select.Option value="EMPLOYEE">EMPLOYEE</Select.Option>
                      <Select.Option value="AGENT">AGENT</Select.Option>
                      <Select.Option value="OTHER">OTHER</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="relationship_other"
                    label="Relationship Other"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="owner_name" label="Owner Name">
                    <Input />
                  </Form.Item>
                  <Form.Item name="owner_country" label="Owner Country">
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Address">
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button onClick={() => setIsDefaultDataModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Save Default Data
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Header>
      )}
      <Content style={{ padding: "10px 50px" }}>{children}</Content>
    </Layout>
  );
}
