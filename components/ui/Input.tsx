import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, helper, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (<div className="space-y-1.5">
        {label && (<label htmlFor={inputId} className="block text-caption text-ash-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('w-full h-12 px-4 bg-surface-2 border border-ash-200 rounded-2xl text-body text-ash-900',
            'placeholder:text-ash-400',
            'focus:outline-none focus:border-honey-500 focus:ring-2 focus:ring-honey-200 focus:bg-surface',
            'transition-all duration-150 ease-out-soft',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          {...props}
        />
        {(helper || error) && (<p className={cn('text-body-sm', error ? 'text-danger' : 'text-ash-500')}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, helper, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (<div className="space-y-1.5">
        {label && (<label htmlFor={inputId} className="block text-caption text-ash-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn('w-full min-h-[96px] px-4 py-3 bg-surface-2 border border-ash-200 rounded-2xl text-body text-ash-900',
            'placeholder:text-ash-400 resize-none',
            'focus:outline-none focus:border-honey-500 focus:ring-2 focus:ring-honey-200 focus:bg-surface',
            'transition-all duration-150 ease-out-soft',
            error && 'border-danger',
            className
          )}
          {...props}
        />
        {(helper || error) && (<p className={cn('text-body-sm', error ? 'text-danger' : 'text-ash-500')}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
