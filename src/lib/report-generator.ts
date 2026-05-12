'use client'

import type { AnalysisResult } from '@/store/app-store'

function getScoreColor(score: number): string {
  if (score <= 40) return '#ef4444'
  if (score <= 70) return '#f59e0b'
  return '#10b981'
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'Needs Improvement'
  if (score <= 70) return 'Fair'
  return 'Good'
}

export function generateReportHTML(analysis: AnalysisResult): string {
  const date = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const scores = [
    { label: 'ATS Compatibility', score: analysis.atsScore },
    { label: 'Skills Score', score: analysis.skillsScore },
    { label: 'Formatting Score', score: analysis.formattingScore },
    { label: 'Grammar Score', score: analysis.grammarScore },
    { label: 'Readability Score', score: analysis.readabilityScore },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Analysis Report - ${analysis.fileName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 3px solid #10b981;
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
    }

    .header .subtitle {
      font-size: 14px;
      color: #6b7280;
    }

    .header .file-info {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 4px;
    }

    .overall-score {
      text-align: center;
      padding: 32px;
      margin-bottom: 32px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    }

    .overall-score .score-number {
      font-size: 64px;
      font-weight: 700;
      color: ${getScoreColor(analysis.overallScore)};
      line-height: 1;
    }

    .overall-score .score-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 8px;
    }

    .overall-score .score-badge {
      display: inline-block;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      color: white;
      background: ${getScoreColor(analysis.overallScore)};
      margin-top: 12px;
    }

    .section {
      margin-bottom: 28px;
    }

    .section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .score-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    .score-item {
      text-align: center;
      padding: 16px 8px;
      border-radius: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .score-item .score-value {
      font-size: 28px;
      font-weight: 700;
      color: ${getScoreColor(analysis.overallScore)};
    }

    .score-item .score-name {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    .score-bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #e5e7eb;
      margin-top: 8px;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    .suggestion-list {
      list-style: none;
      padding: 0;
    }

    .suggestion-list li {
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      font-size: 14px;
      color: #1a1a2e;
    }

    .keyword-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .keyword-box {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .keyword-box h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .keyword-box.missing h3 { color: #ef4444; }
    .keyword-box.matched h3 { color: #10b981; }

    .keyword-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      margin: 2px;
    }

    .keyword-tag.missing {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .keyword-tag.matched {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }

    .skill-gaps li {
      padding: 8px 12px;
      margin-bottom: 6px;
      border-radius: 6px;
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
      font-size: 13px;
    }

    .summary-box {
      padding: 20px;
      border-radius: 8px;
      background: #ecfdf5;
      border: 2px solid #10b981;
    }

    .summary-box p {
      font-size: 14px;
      line-height: 1.7;
      color: #1a1a2e;
    }

    .match-score-box {
      text-align: center;
      padding: 24px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 2px solid #10b981;
      margin-bottom: 24px;
    }

    .match-score-box .score-number {
      font-size: 48px;
      font-weight: 700;
      color: ${analysis.matchScore ? getScoreColor(analysis.matchScore) : '#10b981'};
    }

    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
      font-size: 12px;
      color: #9ca3af;
    }

    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Resume Analysis Report</h1>
    <div class="subtitle">AI-Powered Resume Analysis by ResumeAI</div>
    <div class="file-info">${analysis.fileName} • Analyzed on ${date}</div>
  </div>

  <div class="overall-score">
    <div class="score-number">${analysis.overallScore}</div>
    <div class="score-label">Overall Resume Score (out of 100)</div>
    <div class="score-badge">${getScoreLabel(analysis.overallScore)}</div>
  </div>

  ${analysis.matchScore !== null ? `
  <div class="match-score-box">
    <div style="font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Job Description Match</div>
    <div class="score-number">${analysis.matchScore}</div>
    <div class="score-label">out of 100</div>
    <div class="score-badge" style="background: ${getScoreColor(analysis.matchScore)}">${getScoreLabel(analysis.matchScore)}</div>
  </div>
  ` : ''}

  <div class="section">
    <h2>Score Breakdown</h2>
    <div class="score-grid">
      ${scores.map(s => `
      <div class="score-item">
        <div class="score-value" style="color: ${getScoreColor(s.score)}">${s.score}</div>
        <div class="score-name">${s.label}</div>
        <div class="score-bar">
          <div class="score-bar-fill" style="width: ${s.score}%; background: ${getScoreColor(s.score)}"></div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>

  ${analysis.suggestions.length > 0 ? `
  <div class="section">
    <h2>Improvement Suggestions</h2>
    <ol class="suggestion-list">
      ${analysis.suggestions.map((s, i) => `<li><strong>${i + 1}.</strong> ${s}</li>`).join('')}
    </ol>
  </div>
  ` : ''}

  ${(analysis.missingKeywords.length > 0 || analysis.matchedKeywords.length > 0) ? `
  <div class="section">
    <h2>Keywords Analysis</h2>
    <div class="keyword-section">
      <div class="keyword-box missing">
        <h3>✕ Missing Keywords (${analysis.missingKeywords.length})</h3>
        ${analysis.missingKeywords.map(k => `<span class="keyword-tag missing">${k}</span>`).join('')}
      </div>
      <div class="keyword-box matched">
        <h3>✓ Matched Keywords (${analysis.matchedKeywords.length})</h3>
        ${analysis.matchedKeywords.map(k => `<span class="keyword-tag matched">${k}</span>`).join('')}
      </div>
    </div>
  </div>
  ` : ''}

  ${analysis.skillGaps.length > 0 ? `
  <div class="section">
    <h2>Skill Gaps</h2>
    <ul style="list-style: none; padding: 0;">
      ${analysis.skillGaps.map(g => `<li class="skill-gap-item">${g}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${analysis.improvedSummary ? `
  <div class="section">
    <h2>AI-Generated Professional Summary</h2>
    <div class="summary-box">
      <p>${analysis.improvedSummary}</p>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated by ResumeAI - AI-Powered Resume Analysis</p>
    <p>This report is based on AI analysis and should be used as a guide alongside professional career advice.</p>
  </div>
</body>
</html>`
}

export function downloadReport(analysis: AnalysisResult) {
  const html = generateReportHTML(analysis)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}
