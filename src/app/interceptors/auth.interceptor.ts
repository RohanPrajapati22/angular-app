import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        const token = parsed?.token || parsed?.Token || parsed?.data?.token;
        if (token) {
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next(cloned);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
  }
  return next(req);
};
