import React from 'react'
import { HelpCircle, ChevronRight } from 'lucide-react'

const SuggestedQuestions = ({ onSelect, language = 'en' }) => {
    
    // Clinical quick-starts in 3 system-supported scripts
    const recommendations = {
        en: [
            "What common side effects should I expect from Sertraline?",
            "Is it safe to take blood thinners with Ibuprofen?",
            "Can you explain what a 'Half-Life' means for my medication?",
            "What are common clinical alternatives to Metformin?"
        ],
        hi: [
            "Sertraline के सामान्य दुष्प्रभाव क्या हैं?",
            "क्या रक्त पतला करने वाली दवाओं के साथ इबुप्रोफेन लेना सुरक्षित है?",
            "क्या आप समझा सकते हैं कि मेरी दवा के लिए 'हाफ-લાઇફ' का क्या अर्थ है?",
            "मेटफॉर्मिन के सामान्य नैदानिक विकल्प क्या हैं?"
        ],
        gu: [
            "Sertraline ની સામાન્ય આડઅસર શું જોવા મળે છે?",
            "શું બ્લડ થિનર સાથે ઇબુપ્રોફેન લેવી સુરક્ષિત છે?",
            "શું તમે સમજાવી શકો છો કે મારી દવા માટે 'હાફ-લાઇફ' એટલે શું?",
            "મેટફોર્મિન માટે કયા સામાન્ય તબીબી વિકલ્પો ઉપલબ્ધ છે?"
        ]
    }

    const currentRecs = recommendations[language] || recommendations.en

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-5">
            {currentRecs.map((q, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(q)}
                    className="flex text-left items-center p-4 bg-white/60 backdrop-blur-md border border-indigo-100 rounded-2xl hover:bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mr-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-tight pr-2">{q}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </button>
            ))}
        </div>
    )
}

export default SuggestedQuestions
