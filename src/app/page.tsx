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
  Tabs,
} from "antd";
import type { TableProps } from "antd/lib/table";
import {
  FileTextOutlined,
  UserOutlined,
  TrademarkOutlined,
} from "@ant-design/icons";
import UsersPage from "@/components/users/User";
import TrademarkManager from "@/components/trademarks/TrademarkManager";
import CopyrightManager from "@/components/copyrights/CopyrightManager";

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
  Retraction: ["original_report_id", "content_urls", "retraction_reason"],
};

export default function Home() {
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState<Any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [trademarks, setTrademarks] = useState<Any[]>([]);
  const [copyrights, setCopyrights] = useState<Any[]>([]);
  const [defaultData, setDefaultData] = useState<Any>({});
  const [selectedKey, setSelectedKey] = useState("reports");

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(atob(token.split(".")[1]));
      fetchUserDefaultData(user.userId);
    }
  }, []);

  const fetchUserDefaultData = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/default-data`);
      const data = await response.json();
      if (data.default_data) {
        setDefaultData(data.default_data);
      }
    } catch (error) {
      console.error("Error fetching user default data:", error);
    }
  };

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
    fetchCopyrights();
  }, []);

  const fetchCopyrights = async () => {
    try {
      const response = await fetch("/api/copyrights");
      const data = await response.json();
      setCopyrights(data);
    } catch (error) {
      console.error("Error fetching copyrights:", error);
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
        body: JSON.stringify({
          ...values,
          original_urls: JSON.stringify(values.original_urls.split(",")),
          type: reportType,
        }),
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
  console.log(reportType);
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
          width={250}
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
                label: "Complaint Management",
              },

              {
                key: "trademarks",
                icon: <TrademarkOutlined />,
                label: "IP Management",
              },
              {
                key: "users",
                icon: <UserOutlined />,
                label: "User Management",
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
                <div className="flex justify-between px-1">
                  <div className="font-semibold text-base">
                    Complaint Management
                  </div>
                  <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    New Complaint
                  </Button>
                </div>

                <Modal
                  title="Submit New Complaint"
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
                      label="Complaint Type"
                      name="type"
                      rules={[
                        {
                          // required: true,
                          message: "Please select a report type",
                        },
                      ]}
                    >
                      <Select
                        value={reportType}
                        onChange={(value) => {
                          setReportType(value);
                          form.resetFields();
                          if (value && defaultData) {
                            const defaultValues = defaultData;
                            const reportFields =
                              REPORT_TYPES[value as keyof typeof REPORT_TYPES];
                            const filteredDefaultValues = Object.fromEntries(
                              Object.entries(defaultValues).filter(([key]) =>
                                reportFields.includes(key)
                              )
                            );
                            form.setFieldsValue(filteredDefaultValues);
                            form.setFieldValue("type", value);
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

                    {reportType && (
                      <Row gutter={16}>
                        <Col span={12}>
                          {REPORT_TYPES[reportType as keyof typeof REPORT_TYPES]
                            .slice(
                              0,
                              Math.ceil(
                                REPORT_TYPES[
                                  reportType as keyof typeof REPORT_TYPES
                                ].length / 2
                              )
                            )
                            .map((field) => (
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
                                  <div>
                                    <TextArea rows={3} />
                                  </div>
                                ) : field === "original_urls" &&
                                  reportType === "Copyright" ? (
                                  <Select
                                    placeholder="Select a copyright"
                                    onChange={(value) => {
                                      const selectedCopyright = copyrights.find(
                                        (cp) => cp.id === value
                                      );
                                      if (selectedCopyright) {
                                        form.setFieldsValue({
                                          original_urls:
                                            selectedCopyright.original_urls.join(
                                              "\n"
                                            ),
                                        });
                                      }
                                    }}
                                  >
                                    {copyrights.map((copyright) => (
                                      <Select.Option
                                        key={copyright.id}
                                        value={copyright.id}
                                      >
                                        {copyright.title}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                ) : field === "original_type" ? (
                                  <Select placeholder="Select original type">
                                    <Select.Option value="PHOTO">
                                      PHOTO
                                    </Select.Option>
                                    <Select.Option value="VIDEO">
                                      VIDEO
                                    </Select.Option>
                                    <Select.Option value="ARTWORK">
                                      ARTWORK
                                    </Select.Option>
                                    <Select.Option value="SOFTWARE">
                                      SOFTWARE
                                    </Select.Option>
                                    <Select.Option value="NAME">
                                      NAME
                                    </Select.Option>
                                    <Select.Option value="CHARACTER">
                                      CHARACTER
                                    </Select.Option>
                                    <Select.Option value="OTHER">
                                      OTHER
                                    </Select.Option>
                                  </Select>
                                ) : field === "email" ? (
                                  <Input type="email" />
                                ) : field === "tm" &&
                                  (reportType === "Trademark" ||
                                    reportType === "Counterfeit") ? (
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
                                ) : field === "relationship" ? (
                                  <Select placeholder="Select relationship type">
                                    <Select.Option value="OWNER">
                                      OWNER
                                    </Select.Option>
                                    <Select.Option value="COUNSEL">
                                      COUNSEL
                                    </Select.Option>
                                    <Select.Option value="EMPLOYEE">
                                      EMPLOYEE
                                    </Select.Option>
                                    <Select.Option value="AGENT">
                                      AGENT
                                    </Select.Option>
                                    <Select.Option value="OTHER">
                                      OTHER
                                    </Select.Option>
                                  </Select>
                                ) : (
                                  <Input />
                                )}
                              </Form.Item>
                            ))}
                        </Col>
                        <Col span={12}>
                          {REPORT_TYPES[reportType as keyof typeof REPORT_TYPES]
                            .slice(
                              Math.ceil(
                                REPORT_TYPES[
                                  reportType as keyof typeof REPORT_TYPES
                                ].length / 2
                              )
                            )
                            .map((field) => (
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
                                  reportType === "Copyright" ? (
                                    <Select
                                      placeholder="Select a copyright"
                                      className="mb-1"
                                      onChange={(value) => {
                                        const selectedCopyright =
                                          copyrights.find(
                                            (cp) => cp.id === value
                                          );
                                        if (selectedCopyright) {
                                          form.setFieldValue(
                                            "original_urls",
                                            selectedCopyright.original_urls.join(
                                              ""
                                            )
                                          );
                                        }
                                      }}
                                    >
                                      {copyrights.map((copyright) => (
                                        <Select.Option
                                          key={copyright.id}
                                          value={copyright.id}
                                        >
                                          {copyright.title}
                                        </Select.Option>
                                      ))}
                                    </Select>
                                  ) : (
                                    <TextArea rows={3} />
                                  )
                                ) : field === "original_type" ? (
                                  <Select placeholder="Select original type">
                                    <Select.Option value="PHOTO">
                                      PHOTO
                                    </Select.Option>
                                    <Select.Option value="VIDEO">
                                      VIDEO
                                    </Select.Option>
                                    <Select.Option value="ARTWORK">
                                      ARTWORK
                                    </Select.Option>
                                    <Select.Option value="SOFTWARE">
                                      SOFTWARE
                                    </Select.Option>
                                    <Select.Option value="NAME">
                                      NAME
                                    </Select.Option>
                                    <Select.Option value="CHARACTER">
                                      CHARACTER
                                    </Select.Option>
                                    <Select.Option value="OTHER">
                                      OTHER
                                    </Select.Option>
                                  </Select>
                                ) : field === "email" ? (
                                  <Input type="email" />
                                ) : field === "tm" &&
                                  (reportType === "Trademark" ||
                                    reportType === "Counterfeit") ? (
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
                                ) : field === "original_urls" &&
                                  reportType === "Copyright" ? (
                                  <Select
                                    placeholder="Select a copyright"
                                    onChange={(value) => {
                                      const selectedCopyright = copyrights.find(
                                        (cp) => cp.id === value
                                      );
                                      if (selectedCopyright) {
                                        form.setFieldsValue({
                                          original_urls:
                                            selectedCopyright.original_urls.join(
                                              "\n"
                                            ),
                                        });
                                      }
                                    }}
                                  >
                                    {copyrights.map((copyright) => (
                                      <Select.Option
                                        key={copyright.id}
                                        value={copyright.id}
                                      >
                                        {copyright.title}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                ) : field === "relationship" ? (
                                  <Select placeholder="Select relationship type">
                                    <Select.Option value="OWNER">
                                      OWNER
                                    </Select.Option>
                                    <Select.Option value="COUNSEL">
                                      COUNSEL
                                    </Select.Option>
                                    <Select.Option value="EMPLOYEE">
                                      EMPLOYEE
                                    </Select.Option>
                                    <Select.Option value="AGENT">
                                      AGENT
                                    </Select.Option>
                                    <Select.Option value="OTHER">
                                      OTHER
                                    </Select.Option>
                                  </Select>
                                ) : (
                                  <Input />
                                )}
                              </Form.Item>
                            ))}
                        </Col>
                      </Row>
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

                <Card>
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
            {selectedKey === "trademarks" && (
              <Tabs
                defaultActiveKey="trademark"
                items={[
                  {
                    key: "trademark",
                    label: "Trademark Management",
                    children: <TrademarkManager />,
                  },
                  {
                    key: "copyright",
                    label: "Copyright Management",
                    children: <CopyrightManager />,
                  },
                ]}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
