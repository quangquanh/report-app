"use client";

import { useState, useEffect } from "react";
import { Any } from "@/type/common";
import {
  Layout,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Table,
  Modal,
  message,
  Menu,
  Row,
  Col,
} from "antd";
import type { TableProps } from "antd/lib/table";
import {
  FileTextOutlined,
  UserOutlined,
  TrademarkOutlined,
} from "@ant-design/icons";
import UsersPage from "@/components/users/User";
import TrademarkManager from "@/components/trademarks/TrademarkManager";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const REPORT_TYPES = {
  Copyright: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "original_type",
    "original_urls",
    "content_urls",
  ],
  Trademark: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "phone",
    "tm",
    "tm_jurisdiction",
    "tm_reg_number",
    "tm_url",
    "original_type",
    "content_urls",
  ],
  Counterfeit: [
    "job",
    "email",
    "name",
    "organization",
    "relationship",
    "relationship_other",
    "owner_name",
    "owner_country",
    "address",
    "phone",
    "tm",
    "tm_jurisdiction",
    "tm_reg_number",
    "tm_url",
    "original_type",
    "content_urls",
  ],
  Retractions: ["original_report_id", "content_urls", "retraction_reason"],
};

export default function Home() {
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState<Any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDefaultDataModalOpen, setIsDefaultDataModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [defaultDataForm] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<Any | null>(null);
  const [trademarks, setTrademarks] = useState<Any[]>([]);
  const [selectedKey, setSelectedKey] = useState("reports");

  const fetchTrademarks = async () => {
    try {
      const response = await fetch("/api/trademarks");
      const data = await response.json();
      setTrademarks(data);
    } catch (error) {
      console.error("Error fetching trademarks:", error);
    }
  };

  useEffect(() => {
    fetchTrademarks();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser(user);
      fetchUserDefaultData(user.userId);
    }
  }, []);

  const fetchUserDefaultData = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/default-data`);
      const data = await response.json();
      console.log(data);
      if (data.default_data) {
        defaultDataForm.setFieldsValue(data.default_data);
      }
    } catch (error) {
      console.error("Error fetching user default data:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError("Failed to load reports");
    }
  };

  const handleSubmit = async (values: Any) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, type: reportType }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const newReport = await response.json();
      setReports((prev) => [...prev, newReport]);
      message.success("Report submitted successfully");
      setIsModalOpen(false);
      form.resetFields();
      setReportType("");
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit report");
      message.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const columns: TableProps<Any>["columns"] = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          style={{
            color: status === "success" ? "#52c41a" : "#f5222d",
            backgroundColor: status === "success" ? "#f6ffed" : "#fff1f0",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Title>
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: "100%", borderRight: 0 }}
            onSelect={({ key }) => setSelectedKey(key)}
            items={[
              {
                key: "reports",
                icon: <FileTextOutlined />,
                label: "Reports",
              },
              {
                key: "users",
                icon: <UserOutlined />,
                label: "Users",
              },
              {
                key: "trademarks",
                icon: <TrademarkOutlined />,
                label: "Trademarks",
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: "24px" }}>
          <Content
            style={{ background: "#fff", padding: "24px", borderRadius: "8px" }}
          >
            {selectedKey === "reports" && (
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <Space>
                  <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    New Report
                  </Button>
                  <Button onClick={() => setIsDefaultDataModalOpen(true)}>
                    Edit Default Data
                  </Button>
                </Space>

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
                      try {
                        const response = await fetch(
                          `/api/users/${currentUser?.userId}/default-data`,
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
                          form.setFieldsValue(values);
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
                          <Input />
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
                        <Button
                          onClick={() => setIsDefaultDataModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                          Save Default Data
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Modal>

                <Modal
                  title="Submit New Report"
                  open={isModalOpen}
                  onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setReportType("");
                  }}
                  footer={null}
                  width={800}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark="optional"
                  >
                    <Form.Item
                      label="Report Type"
                      name="type"
                      rules={[
                        {
                          required: true,
                          message: "Please select a report type",
                        },
                      ]}
                    >
                      <Select
                        value={reportType}
                        onChange={(value) => {
                          setReportType(value);
                          form.resetFields();
                          if (value && defaultDataForm.getFieldsValue()) {
                            const defaultValues =
                              defaultDataForm.getFieldsValue();
                            const reportFields =
                              REPORT_TYPES[value as keyof typeof REPORT_TYPES];
                            const filteredDefaultValues = Object.fromEntries(
                              Object.entries(defaultValues).filter(([key]) =>
                                reportFields.includes(key)
                              )
                            );
                            form.setFieldsValue(filteredDefaultValues);
                          }
                        }}
                        placeholder="Select a type"
                      >
                        {Object.keys(REPORT_TYPES).map((type) => (
                          <Select.Option key={type} value={type}>
                            {type}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {reportType &&
                      REPORT_TYPES[reportType as keyof typeof REPORT_TYPES].map(
                        (field) => (
                          <Form.Item
                            key={field}
                            label={
                              field.charAt(0).toUpperCase() +
                              field.slice(1).replace("_", " ")
                            }
                            name={field}
                            rules={[
                              {
                                required: true,
                                message: `Please input ${field}`,
                              },
                            ]}
                          >
                            {field === "content_urls" ||
                            field === "original_urls" ? (
                              <TextArea rows={3} />
                            ) : field === "email" ? (
                              <Input type="email" />
                            ) : field === "tm" ? (
                              <Select
                                placeholder="Select a trademark"
                                onChange={(value) => {
                                  const selectedTrademark = trademarks.find(
                                    (tm) => tm.id === value
                                  );
                                  if (selectedTrademark) {
                                    form.setFieldsValue({
                                      tm: selectedTrademark.tm,
                                      tm_jurisdiction:
                                        selectedTrademark.tm_jurisdiction,
                                      tm_reg_number:
                                        selectedTrademark.tm_reg_number,
                                      tm_url: selectedTrademark.tm_url,
                                    });
                                  }
                                }}
                              >
                                {trademarks.map((trademark) => (
                                  <Select.Option
                                    key={trademark.id}
                                    value={trademark.id}
                                  >
                                    {trademark.tm}
                                  </Select.Option>
                                ))}
                              </Select>
                            ) : (
                              <Input />
                            )}
                          </Form.Item>
                        )
                      )}

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
                            setReportType("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                        >
                          Submit Report
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Modal>

                <Card title="Submitted Reports">
                  <Table
                    columns={columns}
                    dataSource={reports.map((report, index) => ({
                      ...report,
                      key: index,
                    }))}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Space direction="vertical" style={{ width: "100%" }}>
                          {record.error_message && (
                            <Typography.Text type="danger">
                              Error: {record.error_message}
                            </Typography.Text>
                          )}
                          {REPORT_TYPES[
                            record.type as keyof typeof REPORT_TYPES
                          ].map((field) => (
                            <div key={field}>
                              <Text strong>
                                {field.charAt(0).toUpperCase() +
                                  field.slice(1).replace("_", " ")}
                                :
                              </Text>{" "}
                              <Text>{record[field]}</Text>
                            </div>
                          ))}
                        </Space>
                      ),
                    }}
                  />
                </Card>
              </Space>
            )}
            {selectedKey === "users" && <UsersPage />}
            {selectedKey === "trademarks" && <TrademarkManager />}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
