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

class SalarySlipRequest(BaseModel):
    """Schema for the salary slip generation request."""
    employee_name: str
    employee_email: str
    employee_phone: str
    salary_slip_number: str
    salary_amount: float

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
        current_time = now.strftime("%I:%M %p")

        # Set fonts and colors for overlay text
        font_path = os.path.join(os.path.dirname(__file__), 'IBMPlexMono-Regular.ttf')
        pdfmetrics.registerFont(TTFont('IBMPlexMono', font_path))
        can.setFillColor(HexColor("#1a1615"))

        can.setFont("Times-Bold", 16)
        can.drawString(50, 700, "Salary Slip")

        can.setFont("Times-Roman", 12)
        can.drawString(50, 660, "Slip Number: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 660, f"{request.salary_slip_number}")

        can.setFont("Times-Roman", 12)
        can.drawString(50, 640, "Date: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 640, f"{current_date}")

        can.setFont("Times-Roman", 12)
        can.drawString(50, 620, "Time: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 620, f"{current_time}")

        can.setFont("Times-Bold", 14)
        can.drawString(50, 580, "Employee Information")
        can.setStrokeColor(HexColor("#1a1615"))
        can.line(50, 575, 250, 575)

        can.setFont("Times-Roman", 12)
        can.drawString(50, 555, "Name: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 555, f"{request.employee_name}")

        can.setFont("Times-Roman", 12)
        can.drawString(50, 535, "Email: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 535, f"{request.employee_email}")

        can.setFont("Times-Roman", 12)
        can.drawString(50, 515, "Phone: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(130, 515, f"{request.employee_phone}")

        can.setFont("Times-Bold", 14)
        can.drawString(50, 475, "Salary Details")
        can.line(50, 470, 250, 470)

        can.setFont("Times-Roman", 12)
        can.drawString(50, 445, "Salary Amount: ")
        can.setFont("IBMPlexMono", 12)
        can.drawString(140, 445, f"₹{request.salary_amount:,.2f}")

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
