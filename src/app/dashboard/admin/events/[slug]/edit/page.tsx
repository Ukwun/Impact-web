'use client';

import { useParams } from 'next/navigation';
import EventForm from '@/components/EventForm';

export default function EditEventPage() {
  const params = useParams();
  const eventId = params?.slug as string;

  return <EventForm eventId={eventId} />;
}
