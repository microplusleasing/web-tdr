import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IMasterDataResponse } from '../interfaces/master-data.interface';

@Injectable({
  providedIn: 'root',
})
export class TdrAssessmentService {

  private readonly http = inject(HttpClient);

  getMasterData() {
    const url = `${environment.httpheader}${environment.apiurl}${environment.apiportsign}${environment.apiport}/master-data/tdr-assessment`

    return this.http.get<IMasterDataResponse>(url);
  }
}