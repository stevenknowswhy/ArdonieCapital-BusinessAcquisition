# Ardonie Capital Document Generation Scripts

This directory contains scripts for generating professional business documents for Ardonie Capital.

## Files

- `generate_pitch_pdf.py` - Generates the one-page business pitch in DOCX format with charts and professional formatting

## Requirements

Install the required Python packages:

```bash
pip install python-docx matplotlib docx2pdf plotly
```

## Usage

### Generate One Page Pitch Document

```bash
cd scripts
python3 generate_pitch_pdf.py
```

This will generate:
- `../documents/Ardonie_Capital_One_Page_Pitch.docx` - Professional Word document with charts

## Document Features

The generated one-page pitch includes:

- **Professional Layout**: Landscape orientation optimized for presentations
- **Comprehensive Content**: Problem, solution, market analysis, competitive advantages
- **Visual Elements**: Market breakdown pie chart and timeline comparison bar chart
- **Ardonie Capital Branding**: Consistent with company messaging and values
- **Business Metrics**: Financial projections, market size, and growth targets

## Content Sections

1. **The Problem** - Current challenges in auto repair shop transactions
2. **The Solution** - Ardonie Capital's Express Deal Package approach
3. **Value Proposition** - Benefits for buyers, sellers, and professionals
4. **Target Market** - DFW market size and opportunity
5. **Business Model** - Revenue streams and financial projections
6. **Competitive Advantage** - Key differentiators and market position
7. **Market Opportunity** - Growth potential and expansion plans
8. **Financial Projections** - 3-year revenue and transaction forecasts
9. **The Ask** - Partnership and investment opportunities
10. **Call to Action** - Next steps for engagement

## Charts and Visuals

- **Market Breakdown Pie Chart**: Shows distribution of auto service market segments
- **Timeline Comparison Bar Chart**: Industry average vs. Ardonie Capital's 34-day process

## Customization

To modify the document content, edit the `generate_pitch_pdf.py` script:

- Update text content in the paragraph sections
- Modify chart data and labels
- Adjust colors and formatting
- Change contact information and branding

## Output Location

Generated documents are saved to the `../documents/` directory and are automatically accessible via the web interface at:
- `http://localhost:8000/documents/Ardonie_Capital_One_Page_Pitch.docx`

## Web Integration

The generated document is integrated into the one-page pitch web page with:
- Direct download link for the DOCX file
- Print/PDF option for browser-based PDF generation
- Professional presentation formatting

## Troubleshooting

### PDF Conversion Issues
If PDF conversion fails, the DOCX file will still be generated. Users can:
1. Download the DOCX file
2. Use the browser's Print function to save as PDF
3. Open the DOCX in Word and export as PDF

### Missing Dependencies
If you get import errors, install the required packages:
```bash
pip install python-docx matplotlib
```

For PDF conversion (optional):
```bash
pip install docx2pdf
```

## Future Enhancements

Potential improvements:
- Add more chart types and data visualizations
- Include company logos and branding elements
- Generate multiple document formats (PDF, PowerPoint, etc.)
- Create templates for other business documents
- Add automated data updates from business metrics
