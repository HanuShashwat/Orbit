"use client";

import { useState } from "react";
import { User, Mail, Phone, FileText, IndianRupee, Loader2 } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
    employee_phone: "",
    salary_slip_number: "",
    salary_amount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/generate-salary-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          salary_amount: parseFloat(formData.salary_amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Gaprio_Salary_Slip_${formData.salary_slip_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #fdfdfc 0%, #f0edea 100%)" }}>
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(26,22,21,0.1)] border border-white/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#1a1615]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#1a1615]/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1615]">
              Orbit
            </h1>
            <p className="text-[#1a1615]/70 text-lg">
              Gaprio Labs Salary Slip Generator
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
                  <User className="w-4 h-4" /> Employee Name
                </label>
                <input
                  type="text"
                  name="employee_name"
                  required
                  value={formData.employee_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
                />
              </div>

              {/* Employee Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Employee Email
                </label>
                <input
                  type="email"
                  name="employee_email"
                  required
                  value={formData.employee_email}
                  onChange={handleChange}
                  placeholder="john@gaprio.com"
                  className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
                />
              </div>

              {/* Employee Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="employee_phone"
                  required
                  value={formData.employee_phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
                />
              </div>

              {/* Salary Slip Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Slip Number
                </label>
                <input
                  type="text"
                  name="salary_slip_number"
                  required
                  value={formData.salary_slip_number}
                  onChange={handleChange}
                  placeholder="GS-001"
                  className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
                />
              </div>

              {/* Salary Amount */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Salary Amount
                </label>
                <input
                  type="number"
                  name="salary_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.salary_amount}
                  onChange={handleChange}
                  placeholder="50000.00"
                  className="w-full font-mono text-lg px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden rounded-xl bg-[#1a1615] text-white px-6 py-4 font-medium transition-all hover:bg-[#2a2422] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-[#1a1615]/20 flex justify-center items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Salary Slip
                      <FileText className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
