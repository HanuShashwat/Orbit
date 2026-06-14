"use client";

import { useState } from "react";
import { User, Mail, Phone, FileText, IndianRupee, Loader2, Briefcase, Calendar, CreditCard, Building } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
    employee_phone: "",
    salary_slip_number: "",
    salary_amount: "",
    employee_id: "",
    designation: "",
    department: "",
    date_of_joining: "",
    pay_period: "",
    pay_date: "",
    payment_mode: "Bank Transfer",
    bank_name: "",
    bank_account_no: "",
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

  const InputField = ({ label, name, type = "text", placeholder, icon: Icon, required = true, colSpan = false }: any) => (
    <div className={`space-y-2 ${colSpan ? 'md:col-span-2' : ''}`}>
      <label className="text-sm font-medium text-[#1a1615]/80 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={formData[name as keyof typeof formData]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-white/50 border border-[#1a1615]/10 focus:border-[#1a1615]/30 focus:bg-white focus:ring-4 focus:ring-[#1a1615]/5 transition-all outline-none"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12" style={{ background: "linear-gradient(135deg, #fdfdfc 0%, #f0edea 100%)" }}>
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(26,22,21,0.1)] border border-white/50 relative overflow-hidden">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Employee Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#1a1615] border-b border-[#1a1615]/10 pb-2">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Employee Name" name="employee_name" placeholder="Arjun Mehta" icon={User} />
                <InputField label="Employee Email" name="employee_email" type="email" placeholder="arjun@gaprio.in" icon={Mail} />
                <InputField label="Phone Number" name="employee_phone" type="tel" placeholder="+91 98765 43210" icon={Phone} />
                <InputField label="Employee ID" name="employee_id" placeholder="GAP1234" icon={Briefcase} />
                <InputField label="Designation" name="designation" placeholder="Software Engineer" icon={Briefcase} />
                <InputField label="Department" name="department" placeholder="Engineering" icon={Building} />
                <InputField label="Date of Joining" name="date_of_joining" placeholder="15th January 2024" icon={Calendar} />
              </div>
            </div>

            {/* Salary Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#1a1615] border-b border-[#1a1615]/10 pb-2">Salary Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Slip Number" name="salary_slip_number" placeholder="GS-001" icon={FileText} />
                <InputField label="Pay Period" name="pay_period" placeholder="01 Jun 2025 - 30 Jun 2025" icon={Calendar} />
                <InputField label="Pay Date" name="pay_date" placeholder="30th June 2025" icon={Calendar} />
                <InputField label="Payment Mode" name="payment_mode" placeholder="Bank Transfer" icon={CreditCard} />
                <InputField label="Bank Name" name="bank_name" placeholder="HDFC Bank" icon={Building} />
                <InputField label="Bank Account No." name="bank_account_no" placeholder="XXXX XXXX 1234" icon={CreditCard} />
                <InputField label="Gross Salary Amount" name="salary_amount" type="number" placeholder="80000.00" icon={IndianRupee} colSpan={true} />
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
