# ATS Scoring Algorithm Documentation

This document provides a detailed breakdown of the deterministic ATS scoring algorithm used in ResumeLens.

## Overview

The scoring system is **100% deterministic**, meaning:
- Same resume + same inputs = identical score every time
- No randomness or AI-generated scores
- All calculations are transparent and explainable
- Weights are hardcoded and role-aware

## Scoring Formula

```
Final ATS Score = Σ(Category Score × Category Weight)
```

Where:

| Category | Weight | Description |
|----------|--------|-------------|
| Keyword Relevance | 35% | Match between resume and job/role keywords |
| Role Alignment | 30% | Soft-weighted skill matching by importance |
| Resume Structure | 20% | Section completeness and organization |
| ATS Formatting | 15% | Technical parseability and formatting |

## Category Breakdown

### 1. Keyword Relevance (35% weight)

**Purpose**: Measure how well resume keywords match the target job/role.

**Algorithm**:
1. **TF-IDF Calculation**
   - Compute Term Frequency-Inverse Document Frequency for both resume and job description
   - Extract top 30 keywords from each
   - Filter out stop words and very short words

2. **Keyword Overlap**
   ```
   Overlap Score = (Matched Keywords / Target Keywords) × 100
   ```

3. **Cosine Similarity**
   - Create frequency vectors for all tokens
   - Calculate dot product and magnitudes
   ```
   Similarity = (Vector1 · Vector2) / (|Vector1| × |Vector2|)
   ```

4. **Final Keyword Score**
   ```
   Keyword Score = (Overlap Score × 0.6) + (Similarity × 100 × 0.4)
   ```

**Example**:
- Resume has 15 matched keywords out of 20 target keywords = 75% overlap
- Cosine similarity = 0.68
- Score = (75 × 0.6) + (68 × 0.4) = 45 + 27.2 = **72.2/100**

---

### 2. Role Alignment (30% weight)

**Purpose**: Evaluate skills using role-aware soft weighting.

**Weighting Philosophy**:
- **Core skills** (0.6-0.8 weight): Essential for the role
- **Transferable skills** (0.3-0.5 weight): Valuable but not critical
- **Peripheral skills** (0.1-0.2 weight): Nice to have

**Algorithm**:
1. Extract all skills from resume text
2. Categorize each skill based on target role
3. Calculate weighted scores:
   ```
   Core Score = (Core Skills Found / Total Core Skills) × 100
   Transferable Score = (Transferable Found / Total Transferable) × 60
   Peripheral Bonus = Peripheral Skills Found × 2
   ```

4. **Final Role Score**:
   ```
   Role Score = min(
     Core Score × 0.7 + 
     Transferable Score × 0.25 + 
     Peripheral Bonus × 0.05,
     100
   )
   ```

**IMPORTANT**: Transferable skills add value but **never outweigh** missing core skills.

**Example - Software Engineer**:

Core skills (w=0.7): programming, algorithms, data structures, coding, git
- Found: 4/5 = 80% → 80 × 0.7 = **56 points**

Transferable (w=0.4): problem solving, teamwork, competitive programming
- Found: 2/3 = 67% → 67 × 0.6 × 0.25 = **10 points**

Peripheral (w=0.15): design, ui/ux
- Found: 1 → 1 × 2 × 0.05 = **0.1 points**

**Total**: 56 + 10 + 0.1 = **66.1/100**

---

### 3. Resume Structure (20% weight)

**Purpose**: Ensure resume has proper sections for ATS parsing.

**Required Sections** (60 points total):
- Education: 20 points
- Experience: 20 points  
- Skills: 20 points

**Optional Sections** (40 points total):
- Summary/Objective: 10 points
- Projects: 10 points
- Achievements/Awards: 10 points
- Certifications: 10 points

**Detection Method**:
- Regex patterns match section headers (case-insensitive)
- Section must have >50 characters for required, >30 for optional
- Contact info extracted via patterns (email, phone, LinkedIn)

**Example**:
- Has Education (50+ chars): +20
- Has Experience (50+ chars): +20
- Has Skills (50+ chars): +20
- Has Projects (30+ chars): +10
- Missing Summary: +0
- Missing Achievements: +0
- Missing Certifications: +0

**Total**: 70/100

---

### 4. ATS Formatting (15% weight)

**Purpose**: Check for common ATS parsing issues.

**Penalty System** (starts at 100):

| Issue | Penalty |
|-------|---------|
| Tables detected | -15 |
| Multi-column layout | -15 |
| Excessive special characters | -10 |
| Non-standard bullets | -5 |
| All-caps overuse | -5 |
| Very short resume (<500 chars) | -20 |

**Detection Methods**:

1. **Tables**: Count pipe characters (|) and tabs
   - If >10 pipes or >15 tabs → table detected

2. **Multi-column**: Look for lines with excessive spacing
   - Pattern: `\s{5,}\S+\s{5,}` (multiple 5+ space gaps)
   - If >3 instances → multi-column

3. **Special chars**: Unicode graphics (★☆◆◇■□●○)
   - If >10 → excessive

4. **Standard bullets**: Look for -, •, *, ○
   - If none found → non-standard

5. **All-caps**: Count words in all caps (4+ letters)
   - If >20 → overuse

**Example**:
- No tables: -0
- No multi-column: -0
- 3 special chars: -0
- Has standard bullets: -0
- 12 all-caps words: -0
- Resume length: 2,450 chars: -0

**Total**: 100/100 ✅

---

## Final Score Calculation Example

Let's calculate a complete score:

**Inputs**:
- Resume: Software Engineer with Python, React, problem-solving
- Job Description: Requires Python, JavaScript, React, algorithms
- Mode: Job Description

**Category Scores**:
1. Keyword Relevance: **72.2**/100
2. Role Alignment: **66.1**/100
3. Structure: **70**/100
4. Formatting: **100**/100

**Weighted Calculation**:
```
Final Score = 
  (72.2 × 0.35) +    # 25.27
  (66.1 × 0.30) +    # 19.83
  (70.0 × 0.20) +    # 14.00
  (100.0 × 0.15)     # 15.00
  
= 25.27 + 19.83 + 14.00 + 15.00
= 74.1 → 74/100
```

**Result**: **74/100** (Good)

---

## Role-Specific Weights

### Software Engineer
- **Core** (0.7): programming, algorithms, data structures, coding, git, java, python, javascript
- **Transferable** (0.4): problem solving, teamwork, agile, competitive programming
- **Peripheral** (0.15): design, ui/ux, marketing

### Data Scientist  
- **Core** (0.75): machine learning, python, statistics, pandas, tensorflow, sql
- **Transferable** (0.45): research, mathematics, visualization, excel
- **Peripheral** (0.2): web development, design

### Product Manager
- **Core** (0.7): product management, roadmap, strategy, stakeholder management, metrics
- **Transferable** (0.5): communication, leadership, agile, data analysis, sql
- **Peripheral** (0.2): programming, design

### Frontend Developer
- **Core** (0.75): html, css, javascript, react, angular, responsive design
- **Transferable** (0.4): ui/ux, design, accessibility, testing
- **Peripheral** (0.15): data science, devops

### Backend Developer
- **Core** (0.75): server, api, database, sql, node.js, python, java, microservices
- **Transferable** (0.4): algorithms, system design, devops, docker, cloud
- **Peripheral** (0.15): frontend, mobile

### UI/UX Designer
- **Core** (0.7): ui design, ux design, figma, sketch, photoshop, prototyping
- **Transferable** (0.45): design thinking, html, css, accessibility, branding
- **Peripheral** (0.2): programming, data science

### DevOps Engineer
- **Core** (0.75): devops, ci/cd, docker, kubernetes, aws, terraform, linux
- **Transferable** (0.4): system administration, networking, python, git
- **Peripheral** (0.15): frontend, data science

### General ATS
- **Core** (0.6): All detected technical skills equally weighted
- **Transferable** (0.5): Soft skills like communication, teamwork, leadership
- **Peripheral** (0.3): Domain-specific skills

---

## Transparency Principles

1. **No Hidden Scoring**: Every point is traceable to a specific calculation
2. **No AI Scores**: GenAI only explains, never generates scores
3. **Consistent**: Same input always produces same output
4. **Explainable**: Users see exactly what helped or hurt their score
5. **Fair**: Transferable skills valued but don't override core requirements

---

## Score Interpretation

| Range | Label | Meaning |
|-------|-------|---------|
| 80-100 | Excellent | Strong match, likely to pass ATS |
| 60-79 | Good | Decent match, some improvements possible |
| 40-59 | Fair | Needs improvement, missing key elements |
| 0-39 | Poor | Significant gaps, major revision needed |

---

## Future Enhancements (Deterministic Only)

Potential improvements while maintaining determinism:
- Synonym matching for keywords
- N-gram analysis for phrases
- Section quality scoring (not just presence)
- Experience recency weighting
- Quantifiable achievement detection

**Never planned**:
- AI-generated scores
- Learned weights
- User-specific adjustments
- Non-reproducible elements
