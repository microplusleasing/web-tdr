import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { IMasterDataResponse } from '../interfaces/master-data.interface';
import { IContractExistResponse } from '../interfaces/contract-exist-response.interface';

@Injectable({
  providedIn: 'root',
})
export class TdrAssessmentService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.httpheader}` +
    `${environment.apiurl}` +
    `${environment.apiportsign}` +
    `${environment.apiport}`;

  getMasterData() {
    const url = `${this.baseUrl}/master-data/tdr-assessment`;

    return this.http.get<IMasterDataResponse>(url);
  }

  checkContractExists(contractNo: string) {
    const url = `${this.baseUrl}/tdr-assessment/contract/${encodeURIComponent(contractNo)}/exist`;

    return this.http.get<IContractExistResponse>(url);
  }
}
