import { Injectable, Injector } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ApiService } from '../../core/api.service';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        })
      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');

    let headers = new HttpHeaders();

    const token = localStorage.getItem('authorization_token');
    if (token) {
      headers = headers.set('Authorization', `Basic ${token}`);
    }

    return this.http.get<string>(url, {
      params: {
        name: fileName,
      },
      headers,
    });
  }
}
