import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const searchProperties = createAsyncThunk(
  'properties/search',
  async (filters, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/properties/search', { params: filters })
      return data.properties || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed')
    }
  }
)

export const getPropertyById = createAsyncThunk(
  'properties/getById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/properties/${id}`)
      return data.property
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load property')
    }
  }
)

export const getOwnerProperties = createAsyncThunk(
  'properties/getOwnerProperties',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/owner/properties')
      return data.properties || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load properties')
    }
  }
)

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    list: [], // Search results / property list
    currentProperty: null, // Currently viewed property details
    ownerProperties: [], // Properties owned by the current owner
    loading: false,
    searching: false,
    error: null,
    searchFilters: {
      location: '',
      startDate: '',
      endDate: '',
      guests: 1,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null
    },
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload }
    },
    clearSearchResults: (state) => {
      state.list = []
    },
  },
  extraReducers: (builder) => {
    // Search properties
    builder
      .addCase(searchProperties.pending, (state) => {
        state.searching = true
        state.error = null
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.searching = false
        state.list = action.payload
        state.error = null
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.searching = false
        state.error = action.payload
        state.list = []
      })

    // Get property by ID
    builder
      .addCase(getPropertyById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProperty = action.payload
        state.error = null
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.currentProperty = null
      })

    // Get owner properties
    builder
      .addCase(getOwnerProperties.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOwnerProperties.fulfilled, (state, action) => {
        state.loading = false
        state.ownerProperties = action.payload
        state.error = null
      })
      .addCase(getOwnerProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.ownerProperties = []
      })
  },
})

export const { clearError, clearCurrentProperty, setSearchFilters, clearSearchResults } = propertiesSlice.actions
export default propertiesSlice.reducer

