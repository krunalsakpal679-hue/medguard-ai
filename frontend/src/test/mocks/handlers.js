import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // Authentication
  http.post(`${API_BASE}/auth/google`, () => {
    return HttpResponse.json({
      access_token: 'mock_jwt_token',
      user: { id: 'user123', email: 'test@medguard.ai', name: 'Test User', role: 'USER' }
    })
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({ id: 'user123', email: 'test@medguard.ai', name: 'Test User', role: 'USER' })
  }),

  // Molecular Search
  http.get(`${API_BASE}/drugs/search`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    if (query === 'error') return new HttpResponse(null, { status: 500 })
    return HttpResponse.json([
      { id: '1', name: 'Metformin', generic_name: 'Metformin HCl', drug_class: 'Biguanide' },
      { id: '2', name: 'Aspirin', generic_name: 'Acetylsalicylic Acid', drug_class: 'NSAID' }
    ])
  }),

  // AI Inference
  http.post(`${API_BASE}/predictions/check`, () => {
    return HttpResponse.json({
      id: 'pred123',
      overall_risk_level: 'MODERATE',
      pair_results: [
        { drug_a_name: 'Metformin', drug_b_name: 'Aspirin', severity: 'MODERATE', synergy_score: 0.65 }
      ],
      recommendations: ["Monitor blood glucose levels carefully."]
    })
  }),

  // Clinical Assets
  http.post(`${API_BASE}/upload/prescription`, () => {
    return HttpResponse.json({ upload_id: 'upload789', ocr_status: 'processing' })
  }),

  // AI Assistant
  http.post(`${API_BASE}/chat/message`, () => {
    return HttpResponse.json({
      response: "Aspirin is a nonsteroidal anti-inflammatory drug (NSAID).",
      detected_drugs: ["Aspirin"]
    })
  })
]
