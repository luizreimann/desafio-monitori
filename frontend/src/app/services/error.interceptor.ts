import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro de rede: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Servidor indisponível. Verifique sua conexão.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Dados inválidos';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflito de dados';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.statusText}`;
        }
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
