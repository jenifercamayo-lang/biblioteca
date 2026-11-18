import 'react';

declare module 'react' {
  interface DOMAttributes<T> {
    onResize?: ReactEventHandler<T> | undefined;
    onResizeCapture?: ReactEventHandler<T> | undefined;
    onPointerEnterCapture?: PointerEventHandler<T> | undefined;
    onPointerLeaveCapture?: PointerEventHandler<T> | undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    placeholder?: string | undefined;
  }
}
