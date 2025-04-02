"use client";

import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Any } from "@/type/common";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login } = useAuth();

  const handleSubmit = async (values: Any) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Sai email hoặc mật khẩu");
        return;
      }

      login(data.token);
      document.dispatchEvent(new Event("login"));
    } catch (error: Any) {
      console.error("Login error:", error);
      alert("Đã xảy ra lỗi khi đăng nhập");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Ogival IP Protection
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-2">Welcome</h2>
        <p className="text-gray-600 text-center mb-8">
          Use your credentials to log in.
        </p>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            name="email"
            label="E-mail:"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Enter your email"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password:"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Never share your password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 bg-gray-400 hover:bg-gray-500 border-none rounded-md text-white font-medium"
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
