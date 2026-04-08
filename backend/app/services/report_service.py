import io
import logging
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from app.models.prediction import PredictionResult, DrugPairResult
from app.models.user import UserInDB
from app.models.drug import DrugInDB

logger = logging.getLogger(__name__)

class ReportService:
    @staticmethod
    def _get_severity_color(severity: str) -> colors.Color:
        sev = severity.lower()
        if sev == "none":
            return colors.emerald
        elif sev == "minor":
            return colors.yellow
        elif sev == "moderate":
            return colors.orange
        elif sev == "major":
            return colors.red
        elif sev == "contraindicated":
            return colors.black
        return colors.grey

    @classmethod
    def generate_prediction_report(
        cls, 
        prediction: PredictionResult, 
        user: UserInDB, 
        drugs: List[DrugInDB]
    ) -> bytes:
        """
        Generates a stylized clinical PDF report for a drug interaction prediction.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=50, 
            leftMargin=50, 
            topMargin=50, 
            bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.indigo,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.grey,
            alignment=TA_LEFT
        )

        sub_header_style = ParagraphStyle(
            'SubHeader',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.slategray,
            spaceBefore=12,
            spaceAfter=12
        )

        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=11,
            fontName='Helvetica-Bold'
        )

        elements = []

        # 1. Header Analysis
        elements.append(Paragraph("MedGuard AI", title_style))
        elements.append(Paragraph("Drug Interaction Analysis Report", styles['Heading2']))
        elements.append(Spacer(1, 0.2 * inch))

        # Metadata Table
        data = [
            [Paragraph("<b>Patient Name:</b>", header_style), user.full_name],
            [Paragraph("<b>Report Date:</b>", header_style), datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
            [Paragraph("<b>Report ID:</b>", header_style), str(prediction.id)],
            [Paragraph("<b>Overall Risk:</b>", header_style), prediction.overall_risk_level.upper()]
        ]
        
        meta_table = Table(data, colWidths=[1.5*inch, 4*inch])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TEXTCOLOR', (1,3), (1,3), cls._get_severity_color(prediction.overall_risk_level)),
            ('FONTNAME', (1,3), (1,3), 'Helvetica-Bold'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 0.4 * inch))

        # 2. Addressed Drug List
        elements.append(Paragraph("Analyzed Molecular Profile", sub_header_style))
        drug_data = [["Drug Name", "Generic Name", "Drug Class"]]
        for drug in drugs:
            drug_data.append([drug.name, drug.generic_name, drug.drug_class])
        
        drug_table = Table(drug_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch])
        drug_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.indigo),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        elements.append(drug_table)
        elements.append(Spacer(1, 0.4 * inch))

        # 3. Pairwise Interaction Details
        elements.append(Paragraph("Pairwise Interaction Matrix", sub_header_style))
        
        for pair in prediction.pair_results:
            elements.append(Paragraph(f"<b>{pair.drug_a_name} vs {pair.drug_b_name}</b>", styles['Heading3']))
            
            # Severity Badge
            badge_color = cls._get_severity_color(pair.severity)
            badge_data = [[pair.severity.upper()]]
            badge_table = Table(badge_data, colWidths=[1.5*inch])
            badge_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), badge_color),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.white if pair.severity.lower() in ['major', 'contraindicated'] else colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('ROUNDEDCORNERS', [10, 10, 10, 10]),
            ]))
            elements.append(badge_table)
            elements.append(Spacer(1, 0.1 * inch))
            
            elements.append(Paragraph(f"<b>Mechanism:</b> {pair.mechanism}", styles['Normal']))
            elements.append(Spacer(1, 0.05 * inch))
            elements.append(Paragraph(f"<b>Clinical Notes:</b> {pair.clinical_notes}", styles['Normal']))
            
            if pair.alternatives:
                elements.append(Spacer(1, 0.05 * inch))
                elements.append(Paragraph(f"<b>Suggested Alternatives:</b> {', '.join(pair.alternatives)}", styles['Normal']))
            
            elements.append(Spacer(1, 0.2 * inch))

        # 4. Recommendations
        if prediction.recommendations:
            elements.append(PageBreak())
            elements.append(Paragraph("Clinical Recommendations", sub_header_style))
            for i, rec in enumerate(prediction.recommendations, 1):
                elements.append(Paragraph(f"{i}. {rec}", styles['Normal']))
                elements.append(Spacer(1, 0.1 * inch))

        # Disclaimer & Footer
        elements.append(Spacer(1, 0.5 * inch))
        elements.append(Paragraph("<b>Disclaimer:</b> This report is generated by an Artificial Intelligence system (MedGuard AI) for informational and clinical decision-support purposes only. It does not replace the professional judgment of a licensed healthcare provider. Patients should always consult with their physician before making changes to their medication regimen.", styles['Italic']))
        
        elements.append(Spacer(1, 0.2 * inch))
        footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.grey)
        elements.append(Paragraph("Generated by MedGuard AI Clinical Ecosystem | medguard.ai", footer_style))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
