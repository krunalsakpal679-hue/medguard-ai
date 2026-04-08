import asyncio
import os
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict

# Add app directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "medguard"

DRUGS_DATA = [
    # SSRIs
    {
        "name": "Sertraline", "generic_name": "Sertraline Hydrochloride",
        "brand_names": ["Zoloft", "Lustral", "Asentra"],
        "drug_class": "SSRI",
        "mechanism_of_action": "Selective serotonin reuptake inhibitor that increases synaptic serotonin levels, improving mood and anxiety symptoms.",
        "half_life_hours": 26.0, "bioavailability": 44.0, "protein_binding_percent": 98.0,
        "metabolized_by": ["CYP3A4", "CYP2C19", "CYP2D6"],
        "contraindications": ["MAOIs", "Pimozide", "Severe hepatic impairment"],
        "side_effects": ["Nausea", "Insomnia", "Diarrhea", "Sexual dysfunction", "Dry mouth", "Dizziness"]
    },
    {
        "name": "Fluoxetine", "generic_name": "Fluoxetine Hydrochloride",
        "brand_names": ["Prozac", "Sarafem", "Adofen"],
        "drug_class": "SSRI",
        "mechanism_of_action": "Binds to the presynaptic serotonin transporter (SERT) inhibiting reuptake of 5-HT.",
        "half_life_hours": 96.0, "bioavailability": 72.0, "protein_binding_percent": 94.0,
        "metabolized_by": ["CYP2D6", "CYP2C9"],
        "contraindications": ["MAOIs", "Thioridazine", "Hypersensitivity"],
        "side_effects": ["Anxiety", "Nervousness", "Insomnia", "Drowsiness", "Tremor", "Sweating"]
    },
    {
        "name": "Escitalopram", "generic_name": "Escitalopram Oxalate",
        "brand_names": ["Lexapro", "Cipralex", "Esertia"],
        "drug_class": "SSRI",
        "mechanism_of_action": "Highly selective inhibitor of serotonin reuptake with minimal effect on norepinephrine or dopamine reuptake.",
        "half_life_hours": 30.0, "bioavailability": 80.0, "protein_binding_percent": 56.0,
        "metabolized_by": ["CYP2C19", "CYP3A4"],
        "contraindications": ["MAOIs", "QT prolongation history", "Hypersensitivity"],
        "side_effects": ["Nausea", "Ejaculation disorder", "Fatigue", "Increased sweating"]
    },
    # Beta-Blockers
    {
        "name": "Metoprolol", "generic_name": "Metoprolol Succinate",
        "brand_names": ["Toprol-XL", "Lopressor", "Betaloc"],
        "drug_class": "Beta-Blocker",
        "mechanism_of_action": "Selective beta-1 adrenergic receptor blocker that reduces heart rate and cardiac output.",
        "half_life_hours": 3.5, "bioavailability": 50.0, "protein_binding_percent": 12.0,
        "metabolized_by": ["CYP2D6"],
        "contraindications": ["Bradycardia", "Heart block", "Cardiogenic shock", "Asthma"],
        "side_effects": ["Fatigue", "Cold extremities", "Dizziness", "Shortness of breath", "Vivid dreams"]
    },
    {
        "name": "Atenolol", "generic_name": "Atenolol",
        "brand_names": ["Tenormin", "Ateno", "Senormin"],
        "drug_class": "Beta-Blocker",
        "mechanism_of_action": "Selective beta-1 antagonist without intrinsic sympathomimetic activity.",
        "half_life_hours": 6.5, "bioavailability": 45.0, "protein_binding_percent": 10.0,
        "metabolized_by": ["Renal excretion mainly"],
        "contraindications": ["Sinus bradycardia", "Metabolic acidosis", "Untreated pheochromocytoma"],
        "side_effects": ["Dizziness", "Fatigue", "Nausea", "Depression", "Slow heart rate"]
    },
    {
        "name": "Propranolol", "generic_name": "Propranolol Hydrochloride",
        "brand_names": ["Inderal", "InnoPran XL", "Hemangeol"],
        "drug_class": "Beta-Blocker",
        "mechanism_of_action": "Non-selective beta-adrenergic receptor antagonist affecting both beta-1 and beta-2 receptors.",
        "half_life_hours": 4.0, "bioavailability": 26.0, "protein_binding_percent": 90.0,
        "metabolized_by": ["CYP2D6", "CYP1A2", "CYP2C19"],
        "contraindications": ["Asthma", "COPD", "Bradycardia"],
        "side_effects": ["Bradycardia", "Fatigue", "Insomnia", "Gastric upset", "Hypotension"]
    },
    # ACE Inhibitors
    {
        "name": "Lisinopril", "generic_name": "Lisinopril",
        "brand_names": ["Prinivil", "Zestril", "Qbrelis"],
        "drug_class": "ACE Inhibitor",
        "mechanism_of_action": "Inhibits angiotensin-converting enzyme, preventing conversion of angiotensin I to angiotensin II, a potent vasoconstrictor.",
        "half_life_hours": 12.0, "bioavailability": 25.0, "protein_binding_percent": 0.0,
        "metabolized_by": ["Excreted unchanged in urine"],
        "contraindications": ["History of angioedema", "Pregnancy", "Aliskiren use in diabetics"],
        "side_effects": ["Dry cough", "Dizziness", "Headache", "Hyperkalemia", "Fatigue"]
    },
    {
        "name": "Enalapril", "generic_name": "Enalapril Maleate",
        "brand_names": ["Vasotec", "Epaned", "Enacard"],
        "drug_class": "ACE Inhibitor",
        "mechanism_of_action": "Prodrug converted to enalaprilat, which inhibits ACE resulting in lowered blood pressure.",
        "half_life_hours": 11.0, "bioavailability": 60.0, "protein_binding_percent": 50.0,
        "metabolized_by": ["Hepatic conversion to active form"],
        "contraindications": ["Angioedema", "Bilateral renal artery stenosis", "Pregnancy"],
        "side_effects": ["Cough", "Hypotension", "Dizziness", "Nausea", "Rash"]
    },
    {
        "name": "Ramipril", "generic_name": "Ramipril",
        "brand_names": ["Altace", "Tritace", "Ramace"],
        "drug_class": "ACE Inhibitor",
        "mechanism_of_action": "Blocks ACE to reduce peripheral vascular resistance without causing a compensatory increase in heart rate.",
        "half_life_hours": 15.0, "bioavailability": 28.0, "protein_binding_percent": 73.0,
        "metabolized_by": ["CYP2D6", "CYP3A4"],
        "contraindications": ["Pregnancy", "Breastfeeding", "Previous angioedema"],
        "side_effects": ["Persistent cough", "Hyperkalemia", "High creatinine", "Headache"]
    },
    # NSAIDs
    {
        "name": "Ibuprofen", "generic_name": "Ibuprofen",
        "brand_names": ["Advil", "Motrin", "Nurofen"],
        "drug_class": "NSAID",
        "mechanism_of_action": "Non-selectively inhibits cyclooxygenase enzymes (COX-1 and COX-2), reducing prostaglandin synthesis.",
        "half_life_hours": 2.0, "bioavailability": 80.0, "protein_binding_percent": 99.0,
        "metabolized_by": ["CYP2C9", "CYP2C8"],
        "contraindications": ["Peptic ulcer", "Severe heart failure", "Renal impairment"],
        "side_effects": ["Abdominal pain", "Nausea", "Heartburn", "Gastrointestinal bleeding", "Tinnitus"]
    },
    {
        "name": "Naproxen", "generic_name": "Naproxen",
        "brand_names": ["Aleve", "Naprosyn", "Anaprox"],
        "drug_class": "NSAID",
        "mechanism_of_action": "Inhibits COX-1/COX-2 enzymes to provide analgesic, anti-inflammatory, and antipyrectic effects.",
        "half_life_hours": 14.0, "bioavailability": 95.0, "protein_binding_percent": 99.0,
        "metabolized_by": ["CYP1A2", "CYP2C9"],
        "contraindications": ["Aspirin-sensitive asthma", "Active GI bleeding", "Post-CABG pain"],
        "side_effects": ["Dyspepsia", "Headache", "Dizziness", "Fluid retention", "Gastrointestinal ulcer"]
    },
    {
        "name": "Diclofenac", "generic_name": "Diclofenac Sodium",
        "brand_names": ["Voltaren", "Cataflam", "Zipsor"],
        "drug_class": "NSAID",
        "mechanism_of_action": "Potent inhibitor of prostaglandin synthesis via COX inhibition.",
        "half_life_hours": 2.0, "bioavailability": 55.0, "protein_binding_percent": 99.7,
        "metabolized_by": ["CYP2C9"],
        "contraindications": ["Ischemic heart disease", "Peripheral arterial disease", "Stroke history"],
        "side_effects": ["Epigastric pain", "Diarrhea", "Dizziness", "Elevated liver enzymes", "Skin rash"]
    },
    # Anticoagulants
    {
        "name": "Warfarin", "generic_name": "Warfarin Sodium",
        "brand_names": ["Coumadin", "Jantoven", "Marevan"],
        "drug_class": "Anticoagulant",
        "mechanism_of_action": "Vitamin K antagonist that inhibits the synthesis of clotting factors II, VII, IX, and X.",
        "half_life_hours": 40.0, "bioavailability": 99.0, "protein_binding_percent": 99.0,
        "metabolized_by": ["CYP2C9", "CYP3A4", "CYP1A2"],
        "contraindications": ["Severe hypertension", "Bacterial endocarditis", "Recent surgery of CNS/eye"],
        "side_effects": ["Bleeding", "Bruising", "Hemorrhage", "Purple toes syndrome", "Skin necrosis"]
    },
    {
        "name": "Apixaban", "generic_name": "Apixaban",
        "brand_names": ["Eliquis"],
        "drug_class": "Anticoagulant",
        "mechanism_of_action": "Highly selective, direct inhibitor of factor Xa, preventing thrombin generation.",
        "half_life_hours": 12.0, "bioavailability": 50.0, "protein_binding_percent": 87.0,
        "metabolized_by": ["CYP3A4", "CYP1A2", "CYP2C8"],
        "contraindications": ["Active pathological bleeding", "Severe liver disease", "Prosthetic heart valves"],
        "side_effects": ["Anemia", "Epistaxis", "Gingival bleeding", "Hematuria", "Contusion"]
    },
    {
        "name": "Rivaroxaban", "generic_name": "Rivaroxaban",
        "brand_names": ["Xarelto"],
        "drug_class": "Anticoagulant",
        "mechanism_of_action": "Direct factor Xa inhibitor that disrupts the intrinsic and extrinsic pathways of the blood coagulation cascade.",
        "half_life_hours": 9.0, "bioavailability": 80.0, "protein_binding_percent": 95.0,
        "metabolized_by": ["CYP3A4", "CYP2J2"],
        "contraindications": ["Active bleeding", "Renal failure (CrCl < 15)", "Pregnancy"],
        "side_effects": ["Bleeding", "Back pain", "Dizziness", "Pruritus", "Muscle spasms"]
    },
    # Statins
    {
        "name": "Atorvastatin", "generic_name": "Atorvastatin Calcium",
        "brand_names": ["Lipitor", "Liprimar", "Atoris"],
        "drug_class": "Statin",
        "mechanism_of_action": "Competitive inhibitor of HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis.",
        "half_life_hours": 14.0, "bioavailability": 14.0, "protein_binding_percent": 98.0,
        "metabolized_by": ["CYP3A4"],
        "contraindications": ["Active liver disease", "Pregnancy", "Lactation"],
        "side_effects": ["Arthralgia", "Nasopharyngitis", "Insomnia", "Myalgia", "Liver enzyme increase"]
    },
    {
        "name": "Simvastatin", "generic_name": "Simvastatin",
        "brand_names": ["Zocor", "Simvacor", "Simgal"],
        "drug_class": "Statin",
        "mechanism_of_action": "Binds to HMG-CoA reductase to reduce LDL cholesterol and triglycerides while increasing HDL.",
        "half_life_hours": 3.0, "bioavailability": 5.0, "protein_binding_percent": 95.0,
        "metabolized_by": ["CYP3A4"],
        "contraindications": ["Strong CYP3A4 inhibitors (e.g. Clarithromycin)", "Liver disease", "Pregnancy"],
        "side_effects": ["Muscle pain", "Weakness", "Headache", "Constipation", "Flatulence"]
    },
    {
        "name": "Rosuvastatin", "generic_name": "Rosuvastatin Calcium",
        "brand_names": ["Crestor", "Ezallor", "Rosulip"],
        "drug_class": "Statin",
        "mechanism_of_action": "High-potency HMG-CoA reductase inhibitor with higher hydrophilicity and less hepatic metabolism.",
        "half_life_hours": 19.0, "bioavailability": 20.0, "protein_binding_percent": 88.0,
        "metabolized_by": ["CYP2C9"],
        "contraindications": ["Renal impairment (CrCl < 30)", "Active liver disease", "Pregnancy"],
        "side_effects": ["Myalgia", "Diabetes mellitus", "Nausea", "Asthenia", "Proteinuria"]
    },
    # Antibiotics
    {
        "name": "Amoxicillin", "generic_name": "Amoxicillin",
        "brand_names": ["Amoxil", "Moxatag", "Trimox"],
        "drug_class": "Antibiotic",
        "mechanism_of_action": "Inhibits bacterial cell wall synthesis by binding to penicillin-binding proteins (PBPs).",
        "half_life_hours": 1.0, "bioavailability": 80.0, "protein_binding_percent": 20.0,
        "metabolized_by": ["Renal excretion"],
        "contraindications": ["Penicillin allergy", "Mononucleosis", "Severe renal impairment"],
        "side_effects": ["Diarrhea", "Nausea", "Vomiting", "Rash", "Vaginitis"]
    },
    {
        "name": "Azithromycin", "generic_name": "Azithromycin",
        "brand_names": ["Zithromax", "Z-Pak", "Azithrocin"],
        "drug_class": "Antibiotic",
        "mechanism_of_action": "Macrolide antibiotic that inhibits protein synthesis by binding to the 50S ribosomal subunit.",
        "half_life_hours": 68.0, "bioavailability": 37.0, "protein_binding_percent": 50.0,
        "metabolized_by": ["Hepatic (minimal CYP)"],
        "contraindications": ["History of cholestatic jaundice", "QT prolongation", "Hypersensitivity"],
        "side_effects": ["Diarrhea", "Abdominal pain", "Nausea", "Headache", "Hearing loss (high dose)"]
    },
    {
        "name": "Ciprofloxacin", "generic_name": "Ciprofloxacin Hydrochloride",
        "brand_names": ["Cipro", "Ciloxan", "Cetraxal"],
        "drug_class": "Antibiotic",
        "mechanism_of_action": "Fluoroquinolone that inhibits DNA gyrase and topoisomerase IV, preventing bacterial DNA replication.",
        "half_life_hours": 4.0, "bioavailability": 70.0, "protein_binding_percent": 30.0,
        "metabolized_by": ["CYP1A2"],
        "contraindications": ["Tizanidine use", "History of tendon rupture", "Myasthenia gravis"],
        "side_effects": ["Nausea", "Diarrhea", "Tendinitis", "Photosensitivity", "QT prolongation"]
    },
    # Antidiabetics
    {
        "name": "Metformin", "generic_name": "Metformin Hydrochloride",
        "brand_names": ["Glucophage", "Riomet", "Fortamet"],
        "drug_class": "Antidiabetic",
        "mechanism_of_action": "Biguanide that decreases hepatic glucose production and increases insulin sensitivity.",
        "half_life_hours": 6.2, "bioavailability": 55.0, "protein_binding_percent": 0.0,
        "metabolized_by": ["Excreted unchanged in urine"],
        "contraindications": ["Renal failure (eGFR < 30)", "Metabolic acidosis", "Lactic acidosis history"],
        "side_effects": ["Diarrhea", "Nausea", "Flatulence", "Vitamin B12 deficiency", "Lactic acidosis (rare)"]
    },
    {
        "name": "Glipizide", "generic_name": "Glipizide",
        "brand_names": ["Glucotrol", "Glucotrol XL"],
        "drug_class": "Antidiabetic",
        "mechanism_of_action": "Sulfonylurea that stimulates insulin release from pancreatic beta cells.",
        "half_life_hours": 4.0, "bioavailability": 95.0, "protein_binding_percent": 98.0,
        "metabolized_by": ["CYP2C9"],
        "contraindications": ["Type 1 Diabetes", "Ketoacidosis", "Sulfonamide allergy"],
        "side_effects": ["Hypoglycemia", "Nausea", "Weight gain", "Dizziness", "Tremor"]
    },
    {
        "name": "Sitagliptin", "generic_name": "Sitagliptin phosphate",
        "brand_names": ["Januvia"],
        "drug_class": "Antidiabetic",
        "mechanism_of_action": "DPP-4 inhibitor that slows the inactivation of incretin hormones, increasing insulin and lowering glucagon.",
        "half_life_hours": 12.4, "bioavailability": 87.0, "protein_binding_percent": 38.0,
        "metabolized_by": ["CYP3A4", "CYP2C8"],
        "contraindications": ["Severe renal failure", "Hypersensitivity"],
        "side_effects": ["Upper respiratory infection", "Headache", "Hypoglycemia", "Nasopharyngitis"]
    },
    # Opioids
    {
        "name": "Tramadol", "generic_name": "Tramadol Hydrochloride",
        "brand_names": ["Ultram", "ConZip", "Ryzolt"],
        "drug_class": "Opioid",
        "mechanism_of_action": "Weak mu-opioid agonist and inhibitor of norepinephrine and serotonin reuptake.",
        "half_life_hours": 6.3, "bioavailability": 75.0, "protein_binding_percent": 20.0,
        "metabolized_by": ["CYP2D6", "CYP3A4"],
        "contraindications": ["Severe respiratory depression", "Significant GI obstruction", "Current MAOI use"],
        "side_effects": ["Dizziness", "Constipation", "Nausea", "Sleepiness", "Sweating", "Seizures (high dose)"]
    },
    {
        "name": "Codeine", "generic_name": "Codeine Phosphate",
        "brand_names": ["Tylenol with Codeine", "Codeine Contin"],
        "drug_class": "Opioid",
        "mechanism_of_action": "Opioid analgesic that is converted to morphine in the liver by CYP2D6.",
        "half_life_hours": 3.0, "bioavailability": 45.0, "protein_binding_percent": 15.0,
        "metabolized_by": ["CYP2D6", "CYP3A4"],
        "contraindications": ["Post-operative pain in pediatric tonsillectomy", "Paralytic ileus"],
        "side_effects": ["Constipation", "Drowsiness", "Itching", "Nausea", "Respiratory depression"]
    },
    # Antihypertensives
    {
        "name": "Amlodipine", "generic_name": "Amlodipine Besylate",
        "brand_names": ["Norvasc", "Lotrel", "Katerzia"],
        "drug_class": "Calcium Channel Blocker",
        "mechanism_of_action": "Dihydropyridine calcium channel blocker that prevents calcium ions from entering heart and vascular smooth muscle cells.",
        "half_life_hours": 40.0, "bioavailability": 75.0, "protein_binding_percent": 93.0,
        "metabolized_by": ["CYP3A4"],
        "contraindications": ["Severe hypotension", "Aortic stenosis", "Hypersensitivity"],
        "side_effects": ["Edema", "Flushing", "Palpitations", "Dizziness", "Fatigue"]
    },
    {
        "name": "Losartan", "generic_name": "Losartan Potassium",
        "brand_names": ["Cozaar", "Hyzaar"],
        "drug_class": "ARB",
        "mechanism_of_action": "Selective, competitive antagonist of the AT1 receptor, blocking the effects of angiotensin II.",
        "half_life_hours": 7.0, "bioavailability": 33.0, "protein_binding_percent": 99.0,
        "metabolized_by": ["CYP2C9", "CYP3A4"],
        "contraindications": ["Pregnancy", "Aliskiren use in diabetics", "Renal artery stenosis"],
        "side_effects": ["Dizziness", "Fatigue", "Hypotension", "Hyperkalemia", "Upper respiratory infection"]
    },
    # Others for interactions
    {
        "name": "Aspirin", "generic_name": "Acetylsalicylic Acid",
        "brand_names": ["Bayer", "Ecotrin", "Buffex"],
        "drug_class": "NSAID/Antiplatelet",
        "mechanism_of_action": "Irreversibly inhibits COX-1/COX-2 enzymes via acetylation, preventing thromboxane A2 synthesis.",
        "half_life_hours": 3.0, "bioavailability": 90.0, "protein_binding_percent": 90.0,
        "metabolized_by": ["Hepatic esterases"],
        "contraindications": ["Reye syndrome history", "Bleeding disorders", "Severe renal disease"],
        "side_effects": ["GI distress", "Hypersensitivity", "Tinnitus", "Gastrointestinal ulcers"]
    },
    {
        "name": "Clarithromycin", "generic_name": "Clarithromycin",
        "brand_names": ["Biaxin", "Klaricid"],
        "drug_class": "Antibiotic",
        "mechanism_of_action": "Binds to the 50S subunit of the 70S ribosome of susceptible organisms.",
        "half_life_hours": 5.0, "bioavailability": 55.0, "protein_binding_percent": 70.0,
        "metabolized_by": ["CYP3A4"],
        "contraindications": ["Concurrent use with Statins (CYP3A4)", "Cholestatic jaundice history"],
        "side_effects": ["Abnormal taste", "Diarrhea", "Dyspepsia", "Headache"]
    }
]

INTERACTIONS_DATA = [
    {"drug_a": "Warfarin", "drug_b": "Aspirin", "severity": "MAJOR", "synergy_score": 0.85, "mechanism": "Combined antiplatelet and anticoagulant effects significantly increase hemorrhage risk.", "clinical_notes": "Avoid combination if possible. Monitor INR and signs of bleeding closely."},
    {"drug_a": "Sertraline", "drug_b": "Tramadol", "severity": "MAJOR", "synergy_score": 0.75, "mechanism": "Both drugs increase serotonin levels. Combination can lead to potentially fatal Serotonin Syndrome.", "clinical_notes": "Monitor for restlessness, tremors, hyperthermia, and confusion."},
    {"drug_a": "Simvastatin", "drug_b": "Clarithromycin", "severity": "MAJOR", "synergy_score": 0.90, "mechanism": "Clarithromycin is a strong CYP3A4 inhibitor that prevents Simvastatin metabolism, leading to toxic levels.", "clinical_notes": "Increased risk of rhabdomyolysis and myopathy. Stop statin while on antibiotic."},
    {"drug_a": "Lisinopril", "drug_b": "Ibuprofen", "severity": "MODERATE", "synergy_score": 0.40, "mechanism": "NSAIDs can reduce the anti-hypertensive effect of ACE inhibitors and cause acute renal failure.", "clinical_notes": "Monitor blood pressure and renal function (Creatinine/BUN)."},
    {"drug_a": "Ciprofloxacin", "drug_b": "Warfarin", "severity": "MAJOR", "synergy_score": 0.65, "mechanism": "Ciprofloxacin inhibits Warfarin metabolism (CYP) and may alter gut flora, increasing anticoagulant effect.", "clinical_notes": "Significant increase in INR possible. Measure INR frequently."},
    {"drug_a": "Sertraline", "drug_b": "Fluoxetine", "severity": "MODERATE", "synergy_score": 0.50, "mechanism": "Additive serotogenic effect from multiple SSRIs increases side effect profile.", "clinical_notes": "Usually unnecessary to combine. Monitor for serotonin excess."},
    {"drug_a": "Amlodipine", "drug_b": "Simvastatin", "severity": "MODERATE", "synergy_score": 0.35, "mechanism": "Amlodipine increases Simvastatin exposure via CYP3A4 inhibition.", "clinical_notes": "Simvastatin dose should not exceed 20mg daily when used with amlodipine."},
    {"drug_a": "Naproxen", "drug_b": "Warfarin", "severity": "MAJOR", "synergy_score": 0.80, "mechanism": "NSAIDs displace warfarin from protein binding sites and increase risk of mucosal bleeding.", "clinical_notes": "High risk of GI bleeding. Monitor closely."},
    {"drug_a": "Metoprolol", "drug_b": "Amlodipine", "severity": "MINOR", "synergy_score": 0.20, "mechanism": "Additive anti-hypertensive and heart rate lowering effects.", "clinical_notes": "Beneficial combination but monitor for excessive hypotension or bradycardia."},
    {"drug_a": "Losartan", "drug_b": "Lisinopril", "severity": "MAJOR", "synergy_score": 0.70, "mechanism": "Dual RAAS blockade increases risk of hyperkalemia and renal failure.", "clinical_notes": "Combination is generally avoided. Check Potassium levels."},
    {"drug_a": "Sertraline", "drug_b": "Metoprolol", "severity": "MODERATE", "synergy_score": 0.30, "mechanism": "Sertraline inhibits CYP2D6, slowing metoprolol metabolism.", "clinical_notes": "May lead to bradycardia or heart block. Monitor heart rate."},
    {"drug_a": "Atorvastatin", "drug_b": "Clarithromycin", "severity": "MAJOR", "synergy_score": 0.85, "mechanism": "Strong CYP3A4 inhibition increases statin toxicity.", "clinical_notes": "Consider temporary cessation of atorvastatin."},
    {"drug_a": "Warfarin", "drug_b": "Diclofenac", "severity": "MAJOR", "synergy_score": 0.75, "mechanism": "NSAIDs interfere with platelet function and can cause gastric irritation during warfarin therapy.", "clinical_notes": "Avoid if possible. Gastric protection (PPI) may be needed."},
    {"drug_a": "Lisinopril", "drug_b": "Ramipril", "severity": "MAJOR", "synergy_score": 0.60, "mechanism": "Redundant ACE inhibition with no added benefit, only increased adverse effects.", "clinical_notes": "Incorrect prescribing. Do not combine."},
    {"drug_a": "Ciprofloxacin", "drug_b": "Theophylline", "severity": "MAJOR", "synergy_score": 0.80, "mechanism": "Inhibition of CYP1A2 leads to toxic levels of theophylline.", "clinical_notes": "High risk of seizures and arrhythmias. Monitor serum levels."},
    {"drug_a": "Azithromycin", "drug_b": "Warfarin", "severity": "MINOR", "synergy_score": 0.15, "mechanism": "Potential potentiation of warfarin, though less documented than other macrolides.", "clinical_notes": "Monitor INR as a precaution."},
    {"drug_a": "Atenolol", "drug_b": "Ibuprofen", "severity": "MODERATE", "synergy_score": 0.25, "mechanism": "NSAIDs compete for renal prostaglandins, reducing antihypertensive effect.", "clinical_notes": "Monitor blood pressure if on regular NSAIDs."},
    {"drug_a": "Metformin", "drug_b": "Ciprofloxacin", "severity": "MODERATE", "synergy_score": 0.40, "mechanism": "Potential increase in hypoglycemia through unclear mechanisms.", "clinical_notes": "Monitor blood glucose levels."},
    {"drug_a": "Tramadol", "drug_b": "Codeine", "severity": "MAJOR", "synergy_score": 0.70, "mechanism": "Additive central nervous system depression and respiratory depression risk.", "clinical_notes": "High risk of opioid overdose symptoms. Avoid combination."},
    {"drug_a": "Fluoxetine", "drug_b": "Tramadol", "severity": "MAJOR", "synergy_score": 0.80, "mechanism": "Fluoxetine is a potent CYP2D6 inhibitor, preventing Tramadol activation and increasing serotonin risk.", "clinical_notes": "Decreased pain relief and increased serotonin syndrome risk."}
]

async def seed():
    print(f"Connecting to MongoDB at {MONGO_URI}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # 1. Clear existing data
    await db.drugs.delete_many({})
    await db.interactions.delete_many({})
    print("Pre-existing clinical data cleared.")
    
    # 2. Insert Drugs
    drug_name_to_id = {}
    print(f"Seeding {len(DRUGS_DATA)} drugs...")
    for drug in DRUGS_DATA:
        drug["created_at"] = datetime.utcnow()
        drug["updated_at"] = datetime.utcnow()
        drug["is_active"] = True
        result = await db.drugs.insert_one(drug)
        drug_name_to_id[drug["name"]] = result.inserted_id
    
    print(f"Successfully inserted {len(drug_name_to_id)} drugs.")
    
    # 3. Insert Interactions
    interactions_to_insert = []
    skipped_interactions = 0
    for interaction in INTERACTIONS_DATA:
        drug_a_id = drug_name_to_id.get(interaction["drug_a"])
        drug_b_id = drug_name_to_id.get(interaction["drug_b"])
        
        if drug_a_id and drug_b_id:
            interactions_to_insert.append({
                "drug_a_id": drug_a_id,
                "drug_b_id": drug_b_id,
                "severity": interaction["severity"],
                "mechanism": interaction["mechanism"],
                "clinical_notes": interaction["clinical_notes"],
                "synergy_score": interaction["synergy_score"],
                "created_at": datetime.utcnow()
            })
        else:
            skipped_interactions += 1
            
    if interactions_to_insert:
        await db.interactions.insert_many(interactions_to_insert)
        print(f"Successfully inserted {len(interactions_to_insert)} interactions.")
    
    if skipped_interactions > 0:
        print(f"Warning: {skipped_interactions} interactions skipped due to missing drug references.")

    # 4. Print Summary Table
    print("\n" + "="*80)
    print(f"{'DRUG NAME':<20} | {'CLASS':<15} | {'HALF-LIFE':<10} | {'CYP METABOLISM'}")
    print("-" * 80)
    for drug in DRUGS_DATA[:10]: # Print first 10
        metab = ", ".join(drug["metabolized_by"])
        print(f"{drug['name'] + ' (' + drug['brand_names'][0] + ')':<20} | {drug['drug_class']:<15} | {drug['half_life_hours']:<10} | {metab}")
    print("... (and more)")
    
    print("\n" + "="*80)
    print(f"{'DRUG A':<15} | {'DRUG B':<15} | {'SEVERITY':<10} | {'SYNERGY'}")
    print("-" * 80)
    for inter in INTERACTIONS_DATA[:10]:
        print(f"{inter['drug_a']:<15} | {inter['drug_b']:<15} | {inter['severity']:<10} | {inter['synergy_score']}")
    print("... (and more)")
    print("="*80)
    
    client.close()
    print("\nDatabase seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
