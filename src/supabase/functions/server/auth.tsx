import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// Initialize Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Sign up endpoint - creates user without email confirmation
app.post('/make-server-94da7951/auth/signup', async (c) => {
  try {
    const { name, email, password, role = 'student' } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Please fill in all fields' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Create user with admin API (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        role,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        return c.json({ error: 'Email already registered. Please login instead.' }, 400);
      }
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      // Return user data for auto-login
      return c.json({
        user: {
          id: data.user.id,
          name,
          email,
          role,
        },
      });
    }

    return c.json({ error: 'Failed to create account' }, 500);
  } catch (error) {
    console.error('Signup exception:', error);
    return c.json({ error: 'Server error during signup' }, 500);
  }
});

// Create organizer endpoint - for admin use
app.post('/make-server-94da7951/auth/create-organizer', async (c) => {
  try {
    const { name, email, password, clubId, clubName } = await c.req.json();

    if (!name || !email || !password || !clubId || !clubName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Create organizer account with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'organizer',
        clubId,
        clubName,
      },
    });

    if (error) {
      console.error('Create organizer error:', error);
      if (error.message.includes('already registered')) {
        return c.json({ error: 'Email already registered' }, 400);
      }
      return c.json({ error: error.message }, 400);
    }

    if (data.user) {
      return c.json({
        organizer: {
          id: data.user.id,
          name,
          email,
          clubId,
          clubName,
          role: 'organizer',
          password, // Return password so admin can see it
        },
      });
    }

    return c.json({ error: 'Failed to create organizer account' }, 500);
  } catch (error) {
    console.error('Create organizer exception:', error);
    return c.json({ error: 'Server error during organizer creation' }, 500);
  }
});

export default app;