interface FormStatusProps {
  kind: 'success' | 'error';
  title: string;
  detail: string;
}

export function FormStatus({ kind, title, detail }: FormStatusProps) {
  return (
    <div className={`form-status form-status--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}