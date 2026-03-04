import { NextResponse } from 'next/server';
import { getGoogleCalendar, CALENDAR_ID } from '../../../lib/google-calendar';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 });
  }

  try {
    const calendar = getGoogleCalendar();
    
    const timeMin = new Date(`${date}T00:00:00`);
    const timeMax = new Date(`${date}T23:59:59`);

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const bookedSlots = (response.data.items || []).map(event => ({
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
    }));

    return NextResponse.json({ bookedSlots, date });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ bookedSlots: [], date });
  }
}
