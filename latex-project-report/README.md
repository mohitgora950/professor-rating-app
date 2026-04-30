# EduRate LaTeX Project Report

This folder contains the complete multi-file LaTeX report for the EduRate project.

## Folder Structure

- `report.tex` - Main LaTeX file
- `report.bib` - Bibliography database (BibTeX)
- `chapters/` - Chapter-wise content files (`1_Introduction.tex` to `7_Conclusion.tex`)
- `figures/` - Diagram source files (`dfd0`, `dfd1`, `dfd2`, `use_case`, `er_diagram`, etc.)
- `screenshots/` - Project screenshots copied from `Edurate_screenshots`

## Included Diagrams

- System Architecture
- DFD Level 0
- DFD Level 1
- DFD Level 2
- ER Diagram
- Use Case Diagram
- Sequence Diagram

## Compile Instructions

Run these commands from the `latex-project-report` folder:

```bash
pdflatex report.tex
bibtex report
pdflatex report.tex
pdflatex report.tex
```

This generates `report.pdf` with:

- chapters 1 to 7
- embedded screenshots
- diagrams from the `figures` folder
- references from `report.bib`

## Notes

- Submission date is intentionally left blank in the title page.
- Institute logo is stored in `screenshots/iiit-manipur.png`.
