import { HttpErrorResponse } from '@angular/common/http';

export default (error: HttpErrorResponse) => {
  let message = 'Unknow Error';
  const isFieldValidation = Array.isArray(error.error);

  if (isFieldValidation) {
    message = error.error.shift()?.msg;
  } else {
    message = error.error.message;
  }

  return message;
};
