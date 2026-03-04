import { NextResponse } from 'next/server';
import { getGoogleCalendar, CALENDAR_ID } from '@/app/lib/google-calendar';

export async function POST(request) {
  try {
    const { name, email, notes, startTime, endTime, duration } = await request.json();

    if (!name || !email || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const calendar = getGoogleCalendar();

    const event = {
      summary: `Meeting with ${name}`,
      description: `Booked via scheduling page.\n\nContact: ${email}${notes ? `\n\nNotes: ${notes}` : ''}`,
      start: {
        dateTime: startTime,
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/Denver',
      },
      attendees: [{ email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
      sendUpdates: 'all',
    });

    return NextResponse.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
