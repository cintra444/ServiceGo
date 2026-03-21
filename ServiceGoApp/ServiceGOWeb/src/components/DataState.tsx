interface DataStateProps {
  message: string;
}

export function DataState({ message }: DataStateProps) {
  return <div className="empty-state">{message}</div>;
}
