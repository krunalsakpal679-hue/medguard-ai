import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

/**
 * Custom hook for high-performance clinical drug searching with debouncing and pagination.
 */
export const useDrugSearch = () => {
    const { token } = useAuthStore()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    
    const [filters, setFilters] = useState({
        classes: [],
        cyp_enzymes: []
    })

    const fetchDrugs = useCallback(async (currentQuery, currentPage, currentFilters) => {
        setIsLoading(true)
        setError(null)
        
        try {
            // Mapping filters to query params
            const params = new URLSearchParams({
                q: currentQuery,
                page: currentPage,
                limit: 12
            })
            
            if (currentFilters.classes.length > 0) params.append('drug_class', currentFilters.classes.join(','))
            
            const res = await axios.get(`${API_BASE}/drugs/search?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setResults(res.data)
            // Mocking total count for pagination logic (should be returned by API in production)
            setTotalResults(res.data.length > 10 ? 50 : res.data.length) 
        } catch (err) {
            setError("The clinical database is currently undergoing maintenance.")
        } finally {
            setIsLoading(false)
        }
    }, [token])

    // Debounced Clinical Search
    useEffect(() => {
        if (!query && filters.classes.length === 0) {
            setResults([])
            return
        }

        const delay = setTimeout(() => {
            fetchDrugs(query, 1, filters)
            setPage(1)
        }, 400)

        return () => clearTimeout(delay)
    }, [query, filters, fetchDrugs])

    const loadMore = () => {
        const next = page + 1
        setPage(next)
        fetchDrugs(query, next, filters)
    }

    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const list = prev[type]
            const newList = list.includes(value) 
                ? list.filter(v => v !== value) 
                : [...list, value]
            return { ...prev, [type]: newList }
        })
    }

    const clearSearch = () => {
        setQuery('')
        setResults([])
        setFilters({ classes: [], cyp_enzymes: [] })
    }

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        page,
        totalResults,
        filters,
        toggleFilter,
        loadMore,
        clearSearch
    }
}
