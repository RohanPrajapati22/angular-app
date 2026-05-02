import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OpeningStockService {
  private baseUrl = 'https://api2023.zerolite.in/api/opening_stock';

  constructor(private http: HttpClient) { }

  refresh(): Observable<any> {
    return this.http.get(`${this.baseUrl}/refresh`);
  }

  save(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, data);
  }

  pageList(params: {
    dt: string;
    subloc: string;
    model_no: string;
    pc: string;
    pt: string;
    sp: number;
    text1?: string;
    text2?: string;
    text3?: string;
    text4?: string;
    sortField?: number;
    sortOrder?: string;
    page?: number;
    size?: number;
  }): Observable<any> {
    const {
      dt, subloc, model_no, pc, pt, sp,
      text1 = 'NA', text2 = 'NA', text3 = 'NA', text4 = 'NA',
      sortField = 11, sortOrder = 'desc', page = 1, size = 10
    } = params;

    const url = `${this.baseUrl}/opening_stock_PageList/${dt}-${subloc}-${model_no}-${pc}-${pt}-${sp}`;
    const body = { text1, text2, text3, text4, sortField, sortOrder, pageIndex: page, pageSize: size };
    return this.http.post(url, body);
  }
}
