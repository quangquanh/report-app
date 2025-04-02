"use client";

import React, { useState, useEffect } from "react";
import { Any } from "@/type/common";
import { Modal, Form, Input, Button, Table } from "antd";

interface Copyright {
  id: string;
  title: string;
  original_urls: string[];
  created_at: string;
}

interface CopyrightManagerProps {
  isModal?: boolean;
  onSelect?: (copyright: Copyright) => void;
  selectedType?: string;
}

export default function CopyrightManager({
  isModal = false,
  onSelect,
  selectedType,
}: CopyrightManagerProps) {
  const [copyrights, setCopyrights] = useState<Copyright[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentCopyright, setCurrentCopyright] = useState<Partial<Copyright>>({
    title: "",
    original_urls: [],
  });

  useEffect(() => {
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

  const handleSubmit = async (values: Any) => {
    try {
      const url = "/api/copyrights";
      const method = currentCopyright.id ? "PUT" : "POST";
      const submitData = currentCopyright.id
        ? { ...values, id: currentCopyright.id }
        : values;

      // Convert comma-separated URLs to array
      submitData.original_urls = values.original_urls
        .split(",")
        .map((url: string) => url.trim())
        .filter((url: string) => url);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchCopyrights();
        setModalVisible(false);
        form.resetFields();
        setCurrentCopyright({
          title: "",
          original_urls: [],
        });
      }
    } catch (error) {
      console.error("Error saving copyright:", error);
    }
  };

  const resetFields = () => {
    form.setFieldsValue({ title: "", original_urls: "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this copyright?")) return;
    try {
      const response = await fetch("/api/copyrights", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchCopyrights();
      }
    } catch (error) {
      console.error("Error deleting copyright:", error);
    }
  };

  const handleEdit = (copyright: Copyright) => {
    const formData = {
      ...copyright,
      original_urls: copyright.original_urls.join(", "),
    };
    setCurrentCopyright(copyright);
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleSelect = (copyright: Copyright) => {
    if (onSelect) {
      onSelect(copyright);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Copyright Management</h2>
        <Button
          type="primary"
          onClick={() => {
            setCurrentCopyright({});
            form.resetFields();
            setModalVisible(true);
            resetFields();
          }}
        >
          Add New
        </Button>
      </div>

      <Table
        dataSource={copyrights}
        rowKey="id"
        columns={[
          {
            title: "Title",
            dataIndex: "title",
            key: "title",
          },
          {
            title: "Original URLs",
            dataIndex: "original_urls",
            key: "original_urls",
            render: (urls: string[]) => (
              <div>
                {urls.map((url, index) => (
                  <div key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Actions",
            key: "action",
            render: (_: Any, record: Copyright) => (
              <div className="flex space-x-2">
                {isModal && selectedType && selectedType === "Copyright" && (
                  <Button type="link" onClick={() => handleSelect(record)}>
                    Select
                  </Button>
                )}
                <Button type="link" onClick={() => handleEdit(record)}>
                  Edit
                </Button>
                <Button
                  type="link"
                  danger
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={currentCopyright.id ? "Edit Copyright" : "Add New Copyright"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCurrentCopyright({});
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={currentCopyright}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="original_urls"
            label="Original URLs (comma-separated)"
            rules={[{ required: true, message: "Please enter original URLs" }]}
          >
            <Input.TextArea
              placeholder="Enter URLs separated by commas"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button
              type="default"
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setCurrentCopyright({});
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {currentCopyright.id ? "Update" : "Add New"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
