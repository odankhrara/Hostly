// Selectors for accessing Redux state

// Auth selectors
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

// Properties selectors
export const selectProperties = (state) => state.properties.list
export const selectCurrentProperty = (state) => state.properties.currentProperty
export const selectOwnerProperties = (state) => state.properties.ownerProperties
export const selectPropertiesLoading = (state) => state.properties.loading
export const selectPropertiesSearching = (state) => state.properties.searching
export const selectPropertiesError = (state) => state.properties.error
export const selectSearchFilters = (state) => state.properties.searchFilters

// Bookings selectors
export const selectBookings = (state) => state.bookings.bookings
export const selectOwnerBookings = (state) => state.bookings.ownerBookings
export const selectFavorites = (state) => state.bookings.favorites
export const selectFavoriteStatus = (state, propertyId) => 
  state.bookings.favoriteStatus[propertyId] || false
export const selectBookingsLoading = (state) => state.bookings.loading
export const selectBookingsError = (state) => state.bookings.error

