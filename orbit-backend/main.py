"""
FastAPI application for generating salary slip PDFs.
"""

import os
import io
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from pypdf import PdfReader, PdfWriter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from num2words import num2words

class SalarySlipRequest(BaseModel):
    """Schema for the salary slip generation request."""
    employee_name: str
    employee_email: str
    employee_phone: str
    salary_slip_number: str
    salary_amount: float
    employee_id: str
    designation: str
    pay_period: str
    pay_date: str
    bank_account_no: str

@app.post("/api/generate-salary-slip")
async def generate_salary_slip(request: SalarySlipRequest):
    """Generates a salary slip PDF and overlays it on the letterhead."""
    try:
        # Create a new PDF with Reportlab
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=A4)

        # Current Date and Time
        now = datetime.now()
        current_date = now.strftime("%B %d, %Y")
        today_str = now.strftime("%d/%m/%Y")

        # Set fonts
        font_path = os.path.join(os.path.dirname(__file__), 'IBMPlexMono-Regular.ttf')
        pdfmetrics.registerFont(TTFont('IBMPlexMono', font_path))
        
        text_color = HexColor("#1a1615")
        can.setFillColor(text_color)

        # Slip Number (Top Center)
        can.setFont("IBMPlexMono", 12)
        can.drawCentredString(297.5, 692, request.salary_slip_number)
        
        # Date (Top Right)
        can.drawString(464, 692, today_str)

        # Header Title
        can.setFont("IBMPlexMono", 12)
        can.drawString(50, 692, "SALARY SLIP")
        can.drawString(50.3, 692, "SALARY SLIP") # Faux bold
        
        # Orange Line under title
        can.setStrokeColor(HexColor("#E69A59"))
        can.setLineWidth(2)
        can.line(50, 686, 128, 686)
        
        can.setStrokeColor(text_color)
        can.setLineWidth(1)

        # Employee Details Box
        can.roundRect(40, 560, 515, 100, 8, stroke=1, fill=0)
        
        details_left = [
            ("Employee Name", request.employee_name),
            ("Employee ID", request.employee_id),
            ("Designation", request.designation),
        ]
        details_right = [
            ("Pay Period", request.pay_period),
            ("Pay Date", request.pay_date),
            ("Bank Account No.", request.bank_account_no)
        ]
        
        y = 632
        for (llabel, lval), (rlabel, rval) in zip(details_left, details_right):
            if llabel:
                can.setFont("Times-Bold", 10)
                can.drawString(50, y, llabel)
                can.drawString(150, y, ":")
                can.setFont("IBMPlexMono", 10)
                can.drawString(165, y, lval)
            
            if rlabel:
                can.setFont("Times-Bold", 10)
                can.drawString(300, y, rlabel)
                can.drawString(400, y, ":")
                can.setFont("IBMPlexMono", 10)
                can.drawString(415, y, rval)
            y -= 25

        # Earnings & Deductions Headers
        can.setFillColor(HexColor("#E69A59"))
        can.rect(40, 515, 257.5, 25, stroke=1, fill=1) # Earnings Header
        can.rect(297.5, 515, 257.5, 25, stroke=1, fill=1) # Deductions Header
        
        can.setFillColor(text_color)
        can.setFont("Times-Bold", 10)
        can.drawString(50, 523, "EARNINGS")
        can.drawRightString(285, 523, "AMOUNT (INR)")
        can.drawString(307.5, 523, "DEDUCTIONS")
        can.drawRightString(542.5, 523, "AMOUNT (INR)")

        # Earnings & Deductions Bodies
        can.rect(40, 445, 257.5, 70, stroke=1, fill=0)
        can.rect(297.5, 445, 257.5, 70, stroke=1, fill=0)
        
        can.setFont("Times-Roman", 10)
        can.drawString(50, 500, "Basic Salary")
        can.setFont("IBMPlexMono", 10)
        can.drawRightString(285, 500, f"{request.salary_amount:,.2f}")

        deductions = [
            ("Professional Tax", 200.00),
            ("Income Tax (TDS)", request.salary_amount * 0.10),
            ("Employee Provident Fund (EPF)", request.salary_amount * 0.12)
        ]
        
        y_ded = 500
        for label, amt in deductions:
            can.setFont("Times-Roman", 10)
            can.drawString(307.5, y_ded, label)
            can.setFont("IBMPlexMono", 10)
            can.drawRightString(542.5, y_ded, f"{amt:,.2f}")
            y_ded -= 18

        total_deductions = sum(amt for _, amt in deductions)
        net_pay = request.salary_amount - total_deductions

        # Totals Row
        can.rect(40, 420, 257.5, 25, stroke=1, fill=0)
        can.rect(297.5, 420, 257.5, 25, stroke=1, fill=0)
        
        can.setFont("Times-Bold", 10)
        can.drawString(50, 428, "TOTAL EARNINGS (A)")
        can.setFont("IBMPlexMono", 10)
        can.drawRightString(285, 428, f"{request.salary_amount:,.2f}")

        can.setFont("Times-Bold", 10)
        can.drawString(307.5, 428, "TOTAL DEDUCTIONS (B)")
        can.setFont("IBMPlexMono", 10)
        can.drawRightString(542.5, 428, f"{total_deductions:,.2f}")

        # Net Pay Box
        can.setFillColor(text_color)
        can.rect(40, 370, 150, 40, stroke=1, fill=1)
        can.setFillColor(HexColor("#FFFFFF"))
        can.setFont("Times-Bold", 12)
        can.drawString(55, 385, "NET PAY (A - B)")

        can.setFillColor(text_color)
        can.rect(190, 370, 365, 40, stroke=1, fill=0)
        can.setFont("Times-Bold", 14)
        can.drawCentredString(372.5, 390, f"₹ {net_pay:,.2f}")
        
        can.setFont("IBMPlexMono", 8)
        amt_words = num2words(int(net_pay), lang='en_IN').title() + " Only"
        can.drawCentredString(372.5, 375, f"(In Words: {amt_words})")

        # YTD Summary Box
        can.setFillColor(HexColor("#E69A59"))
        can.rect(40, 330, 515, 20, stroke=1, fill=1)
        can.setFillColor(text_color)
        can.setFont("Times-Bold", 10)
        can.drawCentredString(297.5, 336, "YEAR TO DATE SUMMARY (FY: 2025-26)")

        can.rect(40, 310, 515, 20, stroke=1, fill=0)
        can.drawString(50, 316, "Particulars")
        can.drawCentredString(297.5, 316, "Current Month (INR)")
        can.drawCentredString(480, 316, "Year to Date (INR)")

        can.rect(40, 250, 515, 60, stroke=1, fill=0)
        y_ytd = 295
        for label, cm, ytd in [
            ("Total Earnings", request.salary_amount, request.salary_amount * 2),
            ("Total Deductions", total_deductions, total_deductions * 2),
            ("Net Pay", net_pay, net_pay * 2)
        ]:
            can.setFont("Times-Roman", 10)
            can.drawString(50, y_ytd, label)
            can.setFont("IBMPlexMono", 10)
            can.drawCentredString(297.5, y_ytd, f"{cm:,.2f}")
            can.drawCentredString(480, y_ytd, f"{ytd:,.2f}")
            y_ytd -= 20

        # Footer & Signatory
        can.setFont("Times-Roman", 7)
        can.drawString(40, 215, "This is a computer generated salary slip and does not require a physical signature.")


        can.save()

        # Move to the beginning of the StringIO buffer
        packet.seek(0)
        new_pdf = PdfReader(packet)

        # Read the existing letterhead template
        base_dir = os.path.dirname(os.path.dirname(__file__))
        letterhead_path = os.path.join(base_dir, "gaprio_letter_head.pdf")
        
        if not os.path.exists(letterhead_path):
            raise HTTPException(status_code=500, detail="Letterhead template not found")

        output = PdfWriter()
        with open(letterhead_path, "rb") as template_file:
            existing_pdf = PdfReader(template_file)

            # Add the "watermark" (which is the new pdf) on the existing page
            page = existing_pdf.pages[0]
            page.merge_page(new_pdf.pages[0])  # type: ignore
            output.add_page(page)

            # Output to a bytes buffer
            output_stream = io.BytesIO()
            output.write(output_stream)
            output_stream.seek(0)

        filename = f"Gaprio_Salary_Slip_{request.salary_slip_number}.pdf"

        return StreamingResponse(
            output_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
