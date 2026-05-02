import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OpeningStockSerialnosService {
  private baseUrl = 'https://api2023.zerolite.in/api/opening_stock_serialnos';

  constructor(private http: HttpClient) { }

  save(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, data);
  }

  pageList(params: {
    text1?: string;
    text2?: string;
    searchString?: string;
    sortField?: number;
    pageNo?: number;
    pageSize?: number;
  }): Observable<any> {
    const {
      text1 = '0',
      text2 = '0',
      searchString = '',
      sortField = 11,
      pageNo = 1,
      pageSize = 10
    } = params;

    const body = { searchString, text1, text2, text3: 'NA', text4: 'NA', sortField, pageNo, pageSize };
    return this.http.post(`${this.baseUrl}/opening_stock_serialnos_PageList`, body);
  }

  getById(srno: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/getbyid/${srno}`);
  }
}
