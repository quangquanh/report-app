"use client";

import React, { useState, useEffect } from "react";
import { Any } from "@/type/common";
import { Modal, Form, Input, Button, Table } from "antd";

interface Trademark {
  id: string;
  tm: string;
  tm_jurisdiction: string;
  tm_reg_number: string;
  tm_url: string;
  classification?: string;
}

interface TrademarkManagerProps {
  isModal?: boolean;
  onSelect?: (trademark: Trademark) => void;
  selectedType?: string;
}

export default function TrademarkManager({
  isModal = false,
  onSelect,
  selectedType,
}: TrademarkManagerProps) {
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentTrademark, setCurrentTrademark] = useState<Partial<Trademark>>({
    tm: "",
    tm_jurisdiction: "",
    tm_reg_number: "",
    tm_url: "",
    classification: "",
  });
  const resetFields = () => {
    form.setFieldsValue({
      tm: "",
      tm_jurisdiction: "",
      tm_reg_number: "",
      tm_url: "",
      classification: "",
    });
  };
  useEffect(() => {
    fetchTrademarks();
  }, []);

  const fetchTrademarks = async () => {
    try {
      const response = await fetch("/api/trademarks");
      const data = await response.json();
      setTrademarks(data);
    } catch (error) {
      console.error("Error fetching trademarks:", error);
    }
  };

  const handleSubmit = async (values: Any) => {
    try {
      const url = "/api/trademarks";
      const method = currentTrademark.id ? "PUT" : "POST";
      const submitData = currentTrademark.id
        ? { ...values, id: currentTrademark.id }
        : values;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        await fetchTrademarks();
        setModalVisible(false);
        form.resetFields();
        setCurrentTrademark({
          tm: "",
          tm_jurisdiction: "",
          tm_reg_number: "",
          tm_url: "",
        });
      }
    } catch (error) {
      console.error("Error saving trademark:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trademark?")) return;
    try {
      const response = await fetch("/api/trademarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchTrademarks();
      }
    } catch (error) {
      console.error("Error deleting trademark:", error);
    }
  };

  const handleEdit = (trademark: Trademark) => {
    setCurrentTrademark(trademark);
    form.setFieldsValue(trademark);
    setModalVisible(true);
  };

  const handleSelect = (trademark: Trademark) => {
    if (onSelect) {
      onSelect(trademark);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trademark Management</h2>
        <Button
          type="primary"
          onClick={() => {
            setCurrentTrademark({});
            form.resetFields();
            setModalVisible(true);
            resetFields();
          }}
        >
          Add New
        </Button>
      </div>

      <Table
        dataSource={trademarks}
        rowKey="id"
        columns={[
          {
            title: "Trademark Name",
            dataIndex: "tm",
            key: "tm",
          },
          {
            title: "Jurisdiction",
            dataIndex: "tm_jurisdiction",
            key: "tm_jurisdiction",
          },
          {
            title: "Registration Number",
            dataIndex: "tm_reg_number",
            key: "tm_reg_number",
          },
          {
            title: "URL",
            dataIndex: "tm_url",
            key: "tm_url",
            render: (text: string) => (
              <a href={text} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            ),
          },
          {
            title: "Classification",
            dataIndex: "classification",
            key: "classification",
          },
          {
            title: "Actions",
            key: "action",
            render: (_: Any, record: Trademark) => (
              <div className="flex space-x-2">
                {isModal &&
                  selectedType &&
                  (selectedType === "Trademark" ||
                    selectedType === "Counterfeit") && (
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
        title={currentTrademark.id ? "Edit Trademark" : "Add New Trademark"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={currentTrademark}
        >
          <Form.Item
            name="tm"
            label="Trademark Name"
            rules={[{ required: true, message: "Please enter trademark name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tm_jurisdiction"
            label="Jurisdiction"
            rules={[{ required: true, message: "Please enter jurisdiction" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tm_reg_number"
            label="Registration Number"
            rules={[
              { required: true, message: "Please enter registration number" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="tm_url"
            label="URL"
            rules={[{ required: true, message: "Please enter URL" }]}
          >
            <Input type="url" />
          </Form.Item>
          <Form.Item
            name="classification"
            label="Trademark Classification"
            rules={[
              {
                required: true,
                message: "Please enter trademark classification",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button
              type="default"
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {currentTrademark.id ? "Update" : "Add New"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
