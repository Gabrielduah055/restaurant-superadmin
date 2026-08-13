import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.toUrl(path)).pipe(map((response) => response.data));
  }

  post<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.toUrl(path), body).pipe(map((response) => response.data));
  }

  patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.patch<ApiResponse<T>>(this.toUrl(path), body).pipe(map((response) => response.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.toUrl(path)).pipe(map((response) => response.data));
  }

  private toUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }
}
