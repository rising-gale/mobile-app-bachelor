// Base types (mapped from OpenAPI)
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
};

export interface CityChoice {
  label: string;
  value: string;
}

export interface MessageModel {
  message: string;
}

export interface IdModel {
  id: string;
}

// export interface AssessmentIdModel {
//   assessment_id: string;
// }

export type ResultEnum = "Ok" | "Denied" | "Problematic";

export interface AssessmentSchema {
  digits: string;
  result: ResultEnum;
  comment: string;
  location: CityChoice;
  direction: CityChoice;
  image: File;
}

export interface AssessmentSummary {
  id: string;
  digits: string;
  result: string;
  comment?: string;
  location?: CityChoice;
  direction?: CityChoice;
  date_time?: string;
  image?: string;
}

export interface AssessmentOut extends AssessmentSummary {
  // same shape in OpenAPI for now
}

export interface NumberInfoOut {
  digits?: string;
  vin?: string;
  region?: string;
  vendor?: string;
  model?: string;
  model_year?: number;
  photo_url?: string;
  is_stolen?: boolean;
  stolen_details?: string;
  operations?: any[];
  comments?: string[];
}

export interface NumberWithHistory {
  number_info?: NumberInfoOut;
  number_history?: AssessmentSummary[];
}

export interface NumberInfoSchema {
  information: Record<string, any>;
}

export interface PageCountModel {
  page_count: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  workLocation: CityChoice;
  role: string;
}

export interface UserSchema {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  workLocation: CityChoice;
  role?: "operator" | "admin";
}

export interface UsernameUpdate {
  username: string;
}

export interface EmailUpdate {
  email: string;
}