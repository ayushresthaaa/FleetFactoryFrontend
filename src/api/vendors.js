import { apiFetch } from './client'

export const getVendors = (page = 1, pageSize = 10) =>
  apiFetch(`/api/Vendors?pageNumber=${page}&pageSize=${pageSize}`)

export const getVendorById = (id) =>
  apiFetch(`/api/Vendors/${id}`)

export const createVendor = (data) =>
  apiFetch('/api/Vendors', { method: 'POST', body: JSON.stringify(data) })

export const updateVendor = (id, data) =>
  apiFetch(`/api/Vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteVendor = (id) =>
  apiFetch(`/api/Vendors/${id}`, { method: 'DELETE' })