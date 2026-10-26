import { z } from 'zod';
import { isISODate } from './bsDate.js';

export const dateField = ({ required = false, min, max } = {}) => z.string().superRefine((value, context) => {
  if (!value) {
    if (required) context.addIssue({ code: 'custom', message: 'date.required' });
    return;
  }
  if (!isISODate(value)) {
    context.addIssue({ code: 'custom', message: 'date.invalid' });
    return;
  }
  if (min && value < min) context.addIssue({ code: 'custom', message: 'date.min' });
  if (max && value > max) context.addIssue({ code: 'custom', message: 'date.max' });
});
