"use client";

import Image from "next/image";
import { Form, Input, Checkbox, Button } from "antd";
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
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-r">
      <div
        style={{ display: "flex" }}
        className="flex w-full max-w-5xl bg-white/95 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Logo Section */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-white/80">
          <div className="w-64 h-64 relative">
            <Image
              src="/logo.png"
              alt="Report App Logo"
              width={256}
              height={256}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#4361ee]">
              Report Manager System
            </h1>
          </div>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="w-full space-y-4"
          >
            <Form.Item
              name="email"
              label="Email"
              className="mb-4"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your email"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              className="mb-4"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              className="mb-6"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          "Please accept the terms and conditions"
                        ),
                },
              ]}
            >
              <Checkbox className="text-sm text-gray-700">
                I certify that I have read and agree to the Terms of Use,
                Privacy Policy, and Cookie Policy.
              </Checkbox>
            </Form.Item>
            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 bg-[#4361ee] hover:bg-[#3f37c9] transition-colors duration-300 border-none shadow-lg hover:shadow-xl"
                size="large"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
