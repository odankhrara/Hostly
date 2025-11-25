import { useDispatch, useSelector } from 'react-redux'

// Typed hooks for TypeScript-like safety (optional, but good practice)
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

