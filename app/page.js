'use client';

import { useState, useEffect } from 'react';

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(30);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState('');

  // M-F 9am-5pm time slots
  const allSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const getSlots = () => {
    if (duration === 60) {
      return allSlots.filter((_, i) => i % 2 === 0 && i < allSlots.length - 1);
    }
    return allSlots.slice(0, -1);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date) => {
    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const res = await fetch(`/api/calendar/slots?date=${dateStr}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
    } catch (e) {
      setBookedSlots([]);
    }
  };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const d = new Date(selectedDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const isBooked = (slot) => {
    if (!bookedSlots.length) return false;
    const start = parseTime(slot);
    const end = new Date(start.getTime() + duration * 60000);
    return bookedSlots.some(b => {
      const bs = new Date(b.start);
      const be = new Date(b.end);
      return start < be && end > bs;
    });
  };

  const getDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const isSelectable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return date >= today && day !== 0 && day !== 6;
  };

  const handleBook = async () => {
    if (!name || !email) return;
    setIsBooking(true);
    setError('');

    try {
      const start = parseTime(selectedTime);
      const end = new Date(start.getTime() + duration * 60000);

      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, notes,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingComplete(true);
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (e) {
      setError('Something went wrong');
    }
    setIsBooking(false);
  };

  const reset = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setName('');
    setEmail('');
    setNotes('');
    setError('');
    setBookingComplete(false);
  };

  const { firstDay, daysInMonth } = getDays();

  if (bookingComplete) {
    return (
      <div className="container">
        <div className="success">
          <div className="success-icon">✓</div>
          <h1>Booking Confirmed!</h1>
          <p>Your {duration} minute meeting is scheduled for:</p>
          <div className="details">
            <p><strong>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
            <p>{selectedTime} ({duration} min)</p>
          </div>
          <p>Calendar invite sent to {email}</p>
          <button className="reset-btn" onClick={reset}>Book Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Book a Meeting</h1>
          <p>Select a date and time</p>
        </div>

        <div className="duration-btns">
          <button className={duration === 30 ? 'active' : ''} onClick={() => { setDuration(30); setSelectedTime(null); }}>30 min</button>
          <button className={duration === 60 ? 'active' : ''} onClick={() => { setDuration(60); setSelectedTime(null); }}>1 hour</button>
        </div>

        <div className="content">
          <div>
            <div className="cal-nav">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>←</button>
              <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>→</button>
            </div>
            <div className="cal-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="day-header">{d}</div>)}
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="day" />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
                const canSelect = isSelectable(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                return (
                  <button
                    key={i}
                    className={`day ${canSelect ? 'selectable' : 'disabled'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => canSelect && setSelectedDate(date)}
                    disabled={!canSelect}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="times">
              <h3>Available Times</h3>
              <div className="time-grid">
                {getSlots().map(slot => {
                  const booked = isBooked(slot);
                  return (
                    <button
                      key={slot}
                      className={`time-slot ${selectedTime === slot ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                      onClick={() => !booked && setSelectedTime(slot)}
                      disabled={booked}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedTime && (
          <div className="form">
            <h3>Your Details</h3>
            {error && <div className="error">{error}</div>}
            <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="email" placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} />
            <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
            <button className="submit-btn" onClick={handleBook} disabled={!name || !email || isBooking}>
              {isBooking ? 'Booking...' : `Confirm ${duration} min Meeting`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
