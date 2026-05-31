import re
import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def add_runs_to_paragraph(paragraph, text):
    # Split text by bold, italic, and code markdown tokens
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**'):
            run = paragraph.add_run(token[2:-2])
            run.bold = True
        elif token.startswith('*') and token.endswith('*'):
            run = paragraph.add_run(token[1:-1])
            run.italic = True
        elif token.startswith('`') and token.endswith('`'):
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Courier New'
            run.font.size = Pt(9.5)
            # Give inline code a dark gray color
            run.font.color.rgb = RGBColor(90, 90, 90)
        else:
            paragraph.add_run(token)

def parse_md_to_docx(md_path, docx_path):
    if not os.path.exists(md_path):
        print(f"Error: Source Markdown file not found at {md_path}")
        return

    doc = Document()
    
    # Configure document base styling (Public Sans or Aptos style)
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_code_block = False
    code_lines = []
    
    in_table = False
    table_headers = []
    table_rows = []

    # Clean up empty lines
    clean_lines = [line.rstrip() for line in lines]

    i = 0
    while i < len(clean_lines):
        line = clean_lines[i]
        
        # 1. Handle Code Blocks
        if line.startswith('```'):
            if in_code_block:
                # End of code block
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.4)
                p.paragraph_format.space_before = Pt(6)
                p.paragraph_format.space_after = Pt(6)
                
                # Add background shading for code blocks
                pPr = p._p.get_or_add_pPr()
                shading_xml = f'<w:shd {nsdecls("w")} w:fill="F5F5F5"/>'
                pPr.append(parse_xml(shading_xml))
                
                # Add borders around code blocks
                borders_xml = f'<w:pBdr {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="8" w:color="CCCCCC"/></w:pBdr>'
                pPr.append(parse_xml(borders_xml))

                # Add all code lines joined by newlines
                code_text = "\n".join(code_lines)
                run = p.add_run(code_text)
                run.font.name = 'Courier New'
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(60, 60, 60)
                
                code_lines = []
                in_code_block = False
            else:
                # Start of code block
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # 2. Handle Tables
        if line.startswith('|') and line.endswith('|'):
            # It's a table row
            cells = [c.strip() for c in line.split('|')[1:-1]]
            
            # Skip divider rows like |---|
            if all(re.match(r'^:?-+:?$', c) for c in cells):
                i += 1
                continue
                
            if not in_table:
                in_table = True
                table_headers = cells
            else:
                table_rows.append(cells)
            i += 1
            continue
        else:
            if in_table:
                # Flush the collected table to the document
                if table_headers:
                    cols_count = len(table_headers)
                    # Add a native table
                    table = doc.add_table(rows=0, cols=cols_count)
                    table.style = 'Table Grid'
                    table.autofit = True
                    
                    # Add Header Row
                    hdr_cells = table.add_row().cells
                    for col_idx, text in enumerate(table_headers):
                        hdr_cells[col_idx].text = ""
                        p = hdr_cells[col_idx].paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        p.paragraph_format.space_before = Pt(4)
                        p.paragraph_format.space_after = Pt(4)
                        run = p.add_run(text)
                        run.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        set_cell_background(hdr_cells[col_idx], "3B82F6") # Saffron or blue background for table headers (using tech blue #3B82F6)

                    # Add Data Rows
                    for row_idx, r_cells in enumerate(table_rows):
                        # Ensure cell count matches column count
                        padded_cells = r_cells + [""] * (cols_count - len(r_cells))
                        row_cells = table.add_row().cells
                        for col_idx, text in enumerate(padded_cells):
                            row_cells[col_idx].text = ""
                            p = row_cells[col_idx].paragraphs[0]
                            p.paragraph_format.space_before = Pt(3)
                            p.paragraph_format.space_after = Pt(3)
                            add_runs_to_paragraph(p, text)
                            
                            # Add zebra striping to data rows
                            if row_idx % 2 == 1:
                                set_cell_background(row_cells[col_idx], "F9FAFB")
                                
                    doc.add_paragraph() # Add spacer spacing after table
                in_table = False
                table_headers = []
                table_rows = []

        # 3. Skip blank lines (unless in list structures or paragraphs)
        if not line:
            i += 1
            continue

        # 4. Handle Headings (# Heading)
        h_match = re.match(r'^(#{1,6})\s+(.*)$', line)
        if h_match:
            h_level = len(h_match.group(1))
            h_text = h_match.group(2)
            
            # Format and clean header links (e.g. "2. Solution Architecture [Solution Architecture](#4-solution-architecture-how-margi-works)")
            # Strips out markdown links in headers for Word Document readability
            h_text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', h_text)
            
            heading = doc.add_heading(text="", level=h_level)
            heading.paragraph_format.space_before = Pt(12 if h_level > 1 else 18)
            heading.paragraph_format.space_after = Pt(6)
            heading.paragraph_format.keep_with_next = True
            
            run = heading.add_run(h_text)
            if h_level == 1:
                run.font.size = Pt(18)
                run.font.color.rgb = RGBColor(30, 41, 59) # Deep slate
                run.bold = True
            elif h_level == 2:
                run.font.size = Pt(14)
                run.font.color.rgb = RGBColor(51, 65, 85) # Slate
                run.bold = True
            else:
                run.font.size = Pt(12)
                run.font.color.rgb = RGBColor(71, 85, 105)
                run.bold = True
            i += 1
            continue

        # 5. Handle Blockquotes (> Quote)
        if line.startswith('> '):
            quote_text = line[2:]
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            
            # Add borders for quote look
            pPr = p._p.get_or_add_pPr()
            borders_xml = f'<w:pBdr {nsdecls("w")}><w:left w:val="single" w:sz="36" w:space="8" w:color="F59E0B"/></w:pBdr>' # Safety Amber left line
            pPr.append(parse_xml(borders_xml))
            shading_xml = f'<w:shd {nsdecls("w")} w:fill="FFFBEB"/>' # Light amber tint background
            pPr.append(parse_xml(shading_xml))
            
            p_run = p.add_run()
            p_run.italic = True
            p_run.font.color.rgb = RGBColor(120, 80, 20)
            add_runs_to_paragraph(p, quote_text)
            i += 1
            continue

        # 6. Handle Bullet Lists (* Bullet / - Bullet)
        list_match = re.match(r'^[\*\-]\s+(.*)$', line)
        if list_match:
            bullet_text = list_match.group(1)
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(0)
            add_runs_to_paragraph(p, bullet_text)
            i += 1
            continue

        # 7. Handle Numbered Lists (1. Item)
        num_match = re.match(r'^\d+\.\s+(.*)$', line)
        if num_match:
            num_text = num_match.group(1)
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(0)
            add_runs_to_paragraph(p, num_text)
            i += 1
            continue

        # 8. Handle Standard Paragraphs
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        add_runs_to_paragraph(p, line)
        i += 1

    # Save finalized document
    doc.save(docx_path)
    print(f"Success: Converted Markdown to DOCX! Document saved at {docx_path}")

if __name__ == "__main__":
    src = r"c:\Users\storm\roadsafetyhackathon\docs\MARGI_IIT_MADRAS_HACKATHON_SUBMISSION.md"
    dest = r"c:\Users\storm\roadsafetyhackathon\docs\MARGI_IIT_MADRAS_HACKATHON_SUBMISSION.docx"
    parse_md_to_docx(src, dest)
