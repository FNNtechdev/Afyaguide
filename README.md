# 🏥 AfyaGuide

### **From “Where should I go?” to a clearer, data-informed healthcare choice. 🇰🇪**

> **AfyaGuide is a healthcare-facility discovery and recommendation prototype for Kenya.**
>
> It lets users describe a healthcare need in everyday language, identifies the most relevant standardized service, and ranks potentially suitable facilities using **service availability, facility capability, and geographic proximity**.

---

## ✨ Why AfyaGuide?

Finding the *right* health facility can be harder than finding a facility.

A user may know:

> *“I need HIV testing near me.”*

but not know the standardized service name, which facility level can provide it, or which suitable facility is closest.

**AfyaGuide bridges that gap.**

### The idea in one line

```text
Everyday language → Health-service understanding → Suitable facilities → Location-aware recommendations
```

---

## 🎯 The Problem

Healthcare information is often organized around **facility names, service labels, and administrative terminology** rather than the way people naturally describe their needs.

This creates a practical discovery problem:

- ❓ Which service do I actually need to look for?
- 🏥 Which facilities provide it?
- 📊 Does the facility have the required capability?
- 📍 Which suitable options are near me?
- 🧭 How can I compare the available options?

AfyaGuide was developed to make this first step of healthcare navigation simpler.

> **Important:** AfyaGuide is a facility-discovery and decision-support tool. It is **not a diagnostic system** and does not replace qualified medical advice.

---

# 🌍 What AfyaGuide Does

| Capability | What it does |
|---|---|
| 🗣️ **Natural-language search** | Lets users describe their healthcare need in ordinary language |
| 🧠 **Health-need matching** | Maps the request to a standardized health need/service |
| 🏥 **Service matching** | Identifies facilities that appear to offer the relevant service |
| 📊 **KEPH filtering** | Considers the minimum required facility capability |
| 📍 **Location-aware ranking** | Uses geographic distance when location information is available |
| 🗺️ **Interactive map** | Displays recommended facilities geographically |
| 💡 **Recommendation explanations** | Shows why a facility was considered a suitable option |
| ⚠️ **Responsible-use safeguards** | Communicates uncertainty and directs emergency cases toward immediate care |

---

# 🧠 How the Recommendation Engine Works

AfyaGuide uses a **hybrid matching and ranking pipeline** rather than relying on one keyword search.

### 01 — Understand the user's request

The user's natural-language query is cleaned, normalized and expanded using selected healthcare synonyms.

Examples:

```text
ANC      → antenatal care
FP       → family planning
TB       → tuberculosis
ART      → antiretroviral therapy
ARV      → antiretroviral therapy
HIV test → HIV counselling and testing
vaccine  → immunization
```

### 02 — Match the health need

The system combines:

- **Sentence embeddings**
- **Word-level TF-IDF**
- **Character-level TF-IDF**

The semantic component uses:

```text
all-MiniLM-L6-v2
```

This combination helps the system handle ordinary language, terminology variation and some spelling differences.

### 03 — Identify suitable facilities

Candidate facilities are filtered according to:

```text
Required service
       +
Minimum KEPH capability
       +
Geographic suitability
```

### 04 — Rank the candidates

Current facility ranking weights:

| Ranking signal | Weight |
|---|---:|
| 🏥 Service match | **50%** |
| 📊 Facility / KEPH capability | **20%** |
| 📍 Distance | **30%** |

The result is a ranked shortlist rather than an unstructured directory.

---

# 📊 Data at a Glance

AfyaGuide uses two primary data resources.

### 🏥 Healthcare Facility Dataset

| | |
|---|---|
| **Records** | **12,050 facilities** |
| **Geographic coverage** | **All 47 Kenyan counties** |
| **GPS availability** | Approximately **98.3%** have both latitude and longitude |
| **Used for** | Facility discovery, service matching, capability filtering and geographic ranking |

### 🧾 Health-Need Taxonomy

| | |
|---|---|
| **Records** | **340 health-need records** |
| **Used for** | Mapping natural-language requests to standardized healthcare needs/services |
| **Includes** | Search keywords, common symptoms, example queries, standardized services and minimum KEPH levels |

> **Data-quality note:** Completeness is not uniform across Kenya. For example, GPS completeness is lower in some counties, while service-record coverage also varies. AfyaGuide therefore treats missing information as a limitation rather than inventing unavailable values.

---

# 🔎 Example User Journey

```text
┌───────────────────────────────┐
│ User describes their need     │
│ “I need HIV testing near me”  │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Natural-language processing   │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Health-need matching          │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Standardized healthcare       │
│ service identified            │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ KEPH capability filtering     │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ Service + capability +        │
│ distance ranking              │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ 🏥 Ranked facilities          │
│ 📍 Map                        │
│ 💡 Recommendation explanation │
└───────────────────────────────┘
```

---

# 🧪 Data Preparation & Processing

### Facility data

- Service lists are parsed into usable records
- KEPH levels are converted into numeric values
- Missing values are handled explicitly
- Facility service information is prepared for fuzzy matching
- Geographic coordinates are validated before distance calculations

### Health-need taxonomy

- Search fields are combined into a searchable representation
- Text is normalized
- Common terminology is expanded
- Word and character TF-IDF representations are created
- Sentence embeddings are generated where the transformer model is available

### Matching robustness

AfyaGuide also uses **RapidFuzz** for facility-service similarity matching.

---

# 📈 Results & Project Evidence

The current implementation brings the full recommendation workflow together:

| Indicator | Current project |
|---|---:|
| 🏥 Healthcare facilities | **12,050** |
| 🧾 Health-need records | **340** |
| 🇰🇪 Kenyan counties represented | **47** |
| 📍 Approximate GPS completeness | **98.3%** |

### End-to-end capability

```text
Natural-language query
        ↓
Semantic health-need matching
        ↓
Standardized service
        ↓
Facility service matching
        ↓
KEPH capability filtering
        ↓
Distance-aware ranking
        ↓
Explainable recommendations
        ↓
Interactive map
```

> **Evaluation note:** AfyaGuide is a hybrid recommendation/matching system rather than a conventional supervised classification model. This README therefore does not present invented AUC-ROC, F1 or accuracy values.

---

# 🗺️ Geographic Intelligence

Location is intended to be an **internal technical capability**, not something users should have to understand.

### Intended user experience

```text
Allow location access
        ↓
Obtain device location
        ↓
Calculate facility distances internally
        ↓
Rank suitable nearby facilities
        ↓
Show results on the map
```

The system uses the **Haversine formula** to calculate geographic distance between the user's coordinates and facility coordinates.

Facilities without usable coordinates cannot be accurately ranked by geographic distance.

---

# 🛡️ Responsible AI & Safety

AfyaGuide operates in a sensitive domain, so responsible use is part of the product design.

### AfyaGuide does

- ✅ Help users discover potentially suitable facilities
- ✅ Explain the basis of recommendations
- ✅ Use available data rather than invent missing values
- ✅ Communicate important limitations
- ✅ Provide emergency-oriented messaging for relevant queries

### AfyaGuide does **not**

- ❌ Diagnose diseases
- ❌ Prescribe medication
- ❌ Replace healthcare professionals
- ❌ Guarantee that a facility is open
- ❌ Guarantee real-time service availability
- ❌ Treat a recommendation score as clinical certainty

### Responsible-use message

> ⚠️ **AfyaGuide is a facility-discovery tool, not a diagnostic service. It can make mistakes and facility information may change. Please verify important details with the facility or a qualified healthcare professional. If someone is in immediate danger, seek emergency care immediately.**

📄 **Full Responsible AI Statement:**  
`reports/responsible_ai_statement.pdf`

---

# ⚠️ Known Limitations

| Limitation | Why it matters |
|---|---|
| 🕒 **Data freshness** | Facility services and operational status can change |
| 📍 **GPS gaps** | Some facilities do not have complete geographic coordinates |
| 🗂️ **Service-data gaps** | Missing service information does not necessarily mean the service is unavailable |
| 🧠 **Language ambiguity** | A natural-language request can be interpreted incorrectly |
| 📱 **Location accuracy** | Device/browser location may not always be exact |
| 🚑 **Clinical boundaries** | The system is not designed to diagnose or make clinical decisions |

---

# 🔐 Privacy Considerations

AfyaGuide follows a **data-minimization approach**.

Location should only be requested when needed for location-based facility discovery.

The application should avoid requiring unnecessary personally identifiable or sensitive health information simply to search for a healthcare facility.

---

# 🛠️ Technology Stack

| Technology | Role |
|---|---|
| 🐍 **Python** | Core application and data-processing language |
| 🐼 **Pandas** | Data cleaning and manipulation |
| 🔢 **NumPy** | Numerical operations |
| 🤖 **Scikit-learn** | TF-IDF and cosine similarity |
| 🧠 **Sentence Transformers** | Semantic embeddings |
| 🔎 **RapidFuzz** | Fuzzy service matching |
| 🗺️ **Folium** | Interactive maps |
| 🎨 **Gradio** | Web application interface |
| 📓 **Jupyter / Google Colab** | Analysis and development |

---

# 📁 Repository Structure

```text
AfyaGuide/
│
├── 📱 app.py
├── 📋 requirements.txt
├── 📖 README.md
│
├── 📂 data/
│   ├── master_facilities_app.csv
│   └── AfyaGuide_User_Health_Need_Taxonomy.csv
│
├── 📂 notebooks/
│   └── final_notebook.ipynb
│
├── 📂 reports/
│   └── responsible_ai_statement.pdf
│
└── 📂 ...
```

---

# 🚀 Run AfyaGuide Locally

## 1. Clone

```bash
git clone <REPOSITORY_URL>
cd AfyaGuide
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Start the application

```bash
python app.py
```

The application will provide a Gradio address that can be opened in a browser.

---

# ☁️ Demonstration

AfyaGuide can also be demonstrated from **Google Colab**.

For a temporary public demonstration link:

```python
demo.launch(share=True)
```

> Temporary Gradio links are intended for demonstrations. A permanent hosted deployment should use an appropriate hosting platform.

---

# 🌱 Future Development

- 📍 Seamless browser/device location permission
- 🏥 Better real-time facility verification
- 📞 Facility contact and navigation actions
- 🗓️ Improved operating-hours information
- 🌍 Multilingual and accessibility improvements
- 🧪 Formal recommendation-quality evaluation
- 🔄 Data-freshness monitoring
- 👥 User feedback on recommendation usefulness
- 🛡️ Stronger safety and responsible-AI monitoring

---

# 💡 Vision

> **People should not need to understand the structure of the healthcare system before they can begin navigating it.**

AfyaGuide aims to make healthcare-facility discovery more **accessible, understandable, location-aware and data-informed**, while keeping the boundaries between technology and professional healthcare decision-making clear.

---

# 👩🏽‍💻 Author

**Faith Njoroge & Michael Owor**  
**Project:** AfyaGuide  
**Focus:** Data Science · Healthcare Access · Responsible AI · Natural Language Processing

---

## ⭐ Project Status

**Prototype / Demonstration Ready**

AfyaGuide demonstrates an end-to-end healthcare-facility recommendation workflow using real facility and health-need data.

> **Built to demonstrate how data science can turn complex healthcare information into a more understandable starting point for users. 🇰🇪**
