interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="card flex flex-col items-center text-center py-10">
      <div className="font-serif text-xl">{title}</div>
      {description ? (
        <p className="text-sm text-muted mt-2 max-w-md">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
