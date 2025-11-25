import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/me')
      return data.bookings || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load bookings')
    }
  }
)

export const createBooking = createAsyncThunk(
  'bookings/create',
  async ({ propertyId, startDate, endDate, guests }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bookings', {
        propertyId,
        startDate,
        endDate,
        guests,
      })
      return data.booking
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking')
    }
  }
)

export const fetchFavorites = createAsyncThunk(
  'bookings/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/favorites')
      return data.favorites || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load favorites')
    }
  }
)

export const addFavorite = createAsyncThunk(
  'bookings/addFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      await api.post('/favorites', { propertyId })
      return propertyId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add favorite')
    }
  }
)

export const removeFavorite = createAsyncThunk(
  'bookings/removeFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      await api.delete(`/favorites/${propertyId}`)
      return propertyId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove favorite')
    }
  }
)

export const checkFavorite = createAsyncThunk(
  'bookings/checkFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/favorites/check/${propertyId}`)
      return { propertyId, isFavorited: data.isFavorited }
    } catch (error) {
      return { propertyId, isFavorited: false }
    }
  }
)

export const fetchOwnerBookings = createAsyncThunk(
  'bookings/fetchOwnerBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/owner/bookings')
      return data.bookings || []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load bookings')
    }
  }
)

export const acceptBooking = createAsyncThunk(
  'bookings/accept',
  async (bookingId, { rejectWithValue }) => {
    try {
      // Try owner route first, fallback to booking route
      try {
        const { data } = await api.post(`/owner/bookings/${bookingId}/accept`)
        return data.booking
      } catch {
        const { data } = await api.post(`/bookings/${bookingId}/accept`)
        return data.booking
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept booking')
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/cancel`)
      return data.booking
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
    }
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [], // Traveler's bookings
    ownerBookings: [], // Owner's bookings (for owner dashboard)
    favorites: [], // Favorite properties
    favoriteStatus: {}, // Map of propertyId -> isFavorited
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload
      const booking = state.bookings.find((b) => b.id === bookingId)
      if (booking) {
        booking.status = status
      }
      const ownerBooking = state.ownerBookings.find((b) => b.id === bookingId)
      if (ownerBooking) {
        ownerBooking.status = status
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload
        state.error = null
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false
        state.bookings.unshift(action.payload) // Add to beginning
        state.error = null
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch favorites
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false
        state.favorites = action.payload
        // Update favorite status map
        action.payload.forEach((fav) => {
          state.favoriteStatus[fav.id] = true
        })
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.loading = false
      })

    // Add favorite
    builder
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.favoriteStatus[action.payload] = true
      })

    // Remove favorite
    builder
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favoriteStatus[action.payload] = false
        state.favorites = state.favorites.filter((fav) => fav.id !== action.payload)
      })

    // Check favorite
    builder
      .addCase(checkFavorite.fulfilled, (state, action) => {
        state.favoriteStatus[action.payload.propertyId] = action.payload.isFavorited
      })

    // Fetch owner bookings
    builder
      .addCase(fetchOwnerBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
        state.loading = false
        state.ownerBookings = action.payload
        state.error = null
      })
      .addCase(fetchOwnerBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Accept booking
    builder
      .addCase(acceptBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.loading = false
        const booking = state.ownerBookings.find((b) => b.id === action.payload.id)
        if (booking) {
          booking.status = action.payload.status
        }
        // Also update in traveler bookings if present
        const travelerBooking = state.bookings.find((b) => b.id === action.payload.id)
        if (travelerBooking) {
          travelerBooking.status = action.payload.status
        }
        state.error = null
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false
        const booking = state.ownerBookings.find((b) => b.id === action.payload.id)
        if (booking) {
          booking.status = action.payload.status
        }
        const travelerBooking = state.bookings.find((b) => b.id === action.payload.id)
        if (travelerBooking) {
          travelerBooking.status = action.payload.status
        }
        state.error = null
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, updateBookingStatus } = bookingsSlice.actions
export default bookingsSlice.reducer

