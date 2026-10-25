import { Hono } from "hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Events endpoints
app.get('/make-server-94da7951/data/events', async (c) => {
  try {
    const events = await kv.get('events') || [];
    return c.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

app.post('/make-server-94da7951/data/events', async (c) => {
  try {
    const event = await c.req.json();
    const events = await kv.get('events') || [];
    events.unshift(event);
    await kv.set('events', events);
    return c.json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

app.put('/make-server-94da7951/data/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const updates = await c.req.json();
    const events = await kv.get('events') || [];
    const updatedEvents = events.map((e: any) => 
      e.id === eventId ? { ...e, ...updates } : e
    );
    await kv.set('events', updatedEvents);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

app.delete('/make-server-94da7951/data/events/:id', async (c) => {
  try {
    const eventId = c.req.param('id');
    const events = await kv.get('events') || [];
    const filteredEvents = events.filter((e: any) => e.id !== eventId);
    await kv.set('events', filteredEvents);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// Registrations endpoints
app.get('/make-server-94da7951/data/registrations', async (c) => {
  try {
    const registrations = await kv.get('registrations') || [];
    return c.json({ registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return c.json({ error: 'Failed to fetch registrations' }, 500);
  }
});

app.post('/make-server-94da7951/data/registrations', async (c) => {
  try {
    const registration = await c.req.json();
    const registrations = await kv.get('registrations') || [];
    registrations.push(registration);
    await kv.set('registrations', registrations);
    return c.json({ registration });
  } catch (error) {
    console.error('Error creating registration:', error);
    return c.json({ error: 'Failed to create registration' }, 500);
  }
});

app.delete('/make-server-94da7951/data/registrations', async (c) => {
  try {
    const { eventId, studentId } = await c.req.json();
    const registrations = await kv.get('registrations') || [];
    const filtered = registrations.filter((r: any) => 
      !(r.eventId === eventId && r.studentId === studentId)
    );
    await kv.set('registrations', filtered);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return c.json({ error: 'Failed to delete registration' }, 500);
  }
});

app.put('/make-server-94da7951/data/registrations/checkin', async (c) => {
  try {
    const { eventId, studentId } = await c.req.json();
    const registrations = await kv.get('registrations') || [];
    const updated = registrations.map((r: any) => {
      if (r.eventId === eventId && r.studentId === studentId) {
        return { ...r, checkedIn: true };
      }
      return r;
    });
    await kv.set('registrations', updated);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error checking in student:', error);
    return c.json({ error: 'Failed to check in student' }, 500);
  }
});

// Clubs endpoints
app.get('/make-server-94da7951/data/clubs', async (c) => {
  try {
    const clubs = await kv.get('clubs') || [];
    return c.json({ clubs });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return c.json({ error: 'Failed to fetch clubs' }, 500);
  }
});

app.post('/make-server-94da7951/data/clubs', async (c) => {
  try {
    const club = await c.req.json();
    const clubs = await kv.get('clubs') || [];
    clubs.unshift(club);
    await kv.set('clubs', clubs);
    return c.json({ club });
  } catch (error) {
    console.error('Error creating club:', error);
    return c.json({ error: 'Failed to create club' }, 500);
  }
});

app.delete('/make-server-94da7951/data/clubs/:id', async (c) => {
  try {
    const clubId = c.req.param('id');
    const clubs = await kv.get('clubs') || [];
    const filtered = clubs.filter((club: any) => club.id !== clubId);
    await kv.set('clubs', filtered);
    
    // Also remove memberships
    const memberships = await kv.get('clubMemberships') || [];
    const updatedMemberships = memberships.filter((m: any) => m.clubId !== clubId);
    await kv.set('clubMemberships', updatedMemberships);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting club:', error);
    return c.json({ error: 'Failed to delete club' }, 500);
  }
});

// Club memberships endpoints
app.get('/make-server-94da7951/data/memberships', async (c) => {
  try {
    const memberships = await kv.get('clubMemberships') || [];
    return c.json({ memberships });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return c.json({ error: 'Failed to fetch memberships' }, 500);
  }
});

app.post('/make-server-94da7951/data/memberships', async (c) => {
  try {
    const membership = await c.req.json();
    const memberships = await kv.get('clubMemberships') || [];
    memberships.push(membership);
    await kv.set('clubMemberships', memberships);
    return c.json({ membership });
  } catch (error) {
    console.error('Error creating membership:', error);
    return c.json({ error: 'Failed to create membership' }, 500);
  }
});

app.delete('/make-server-94da7951/data/memberships', async (c) => {
  try {
    const { clubId, studentId } = await c.req.json();
    const memberships = await kv.get('clubMemberships') || [];
    const filtered = memberships.filter((m: any) => 
      !(m.clubId === clubId && m.studentId === studentId)
    );
    await kv.set('clubMemberships', filtered);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting membership:', error);
    return c.json({ error: 'Failed to delete membership' }, 500);
  }
});

// Organizers endpoints
app.get('/make-server-94da7951/data/organizers', async (c) => {
  try {
    const organizers = await kv.get('organizers') || [];
    return c.json({ organizers });
  } catch (error) {
    console.error('Error fetching organizers:', error);
    return c.json({ error: 'Failed to fetch organizers' }, 500);
  }
});

app.post('/make-server-94da7951/data/organizers', async (c) => {
  try {
    const organizer = await c.req.json();
    const organizers = await kv.get('organizers') || [];
    organizers.push(organizer);
    await kv.set('organizers', organizers);
    return c.json({ organizer });
  } catch (error) {
    console.error('Error creating organizer:', error);
    return c.json({ error: 'Failed to create organizer' }, 500);
  }
});

export default app;