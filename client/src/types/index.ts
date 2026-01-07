// Employee related types
export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  designation?: string;
  branch?: Branch;
  department?: Department;
  branchId?: string;
  departmentId?: string;
}

// User related types
export interface User {
  id: string;
  username: string;
  role: string;
  employee?: Employee;
  createdAt?: string;
  updatedAt?: string;
}

// Auth API response types (matching backend exactly)
export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

