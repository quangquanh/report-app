"use client";

import React, { useState } from "react";
import TrademarkModal from "../trademarks/TrademarkModal";
import { Any } from "@/type/common";

interface ReportFormProps {
  onSubmit: (data: Any) => void;
}

export default function ReportForm({ onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState({
    type: "",
    job: "",
    email: "",
    name: "",
    organization: "",
    relationship: "",
    relationship_other: "",
    owner_name: "",
    owner_country: "",
    address: "",
    phone: "",
    tm: "",
    tm_jurisdiction: "",
    tm_reg_number: "",
    tm_url: "",
    original_type: "",
    original_urls: "",
    content_urls: "",
  });

  const [isTrademarkModalOpen, setIsTrademarkModalOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrademarkSelect = (trademark: Any) => {
    setFormData((prev) => ({
      ...prev,
      tm: trademark.tm,
      tm_jurisdiction: trademark.tm_jurisdiction,
      tm_reg_number: trademark.tm_reg_number,
      tm_url: trademark.tm_url,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showTrademarkFields =
    formData.type === "Trademark" || formData.type === "Counterfeit";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Loại báo cáo
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Chọn loại báo cáo</option>
          <option value="Copyright">Bản quyền</option>
          <option value="Trademark">Thương hiệu</option>
          <option value="Counterfeit">Hàng giả</option>
          <option value="Retractions">Thu hồi</option>
        </select>
      </div>

      {showTrademarkFields && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Thông tin thương hiệu</h3>
            <button
              type="button"
              onClick={() => setIsTrademarkModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Quản lý thương hiệu
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên thương hiệu
              </label>
              <input
                type="text"
                name="tm"
                value={formData.tm}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={showTrademarkFields}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thẩm quyền
              </label>
              <input
                type="text"
                name="tm_jurisdiction"
                value={formData.tm_jurisdiction}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={showTrademarkFields}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số đăng ký
              </label>
              <input
                type="text"
                name="tm_reg_number"
                value={formData.tm_reg_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={showTrademarkFields}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <input
                type="url"
                name="tm_url"
                value={formData.tm_url}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={showTrademarkFields}
              />
            </div>
          </div>
        </div>
      )}

      {/* Các trường thông tin khác */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nghề nghiệp
          </label>
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        {/* Thêm các trường khác tương tự */}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Gửi báo cáo
        </button>
      </div>

      <TrademarkModal
        isOpen={isTrademarkModalOpen}
        onClose={() => setIsTrademarkModalOpen(false)}
        onSelect={handleTrademarkSelect}
        selectedType={formData.type}
      />
    </form>
  );
}
