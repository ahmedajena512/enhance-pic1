import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://toguhfynccwtmxnbiyex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZ3VoZnluY2N3dG14bmJpeWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMTE2OTgsImV4cCI6MjA2Njg4NzY5OH0.2H_B_CwfIIYX5v7DobJen5OTN-ooC7-YGcrQBoZj7I8'; // Get this from Supabase > Project > Settings > API

export const supabase = createClient(supabaseUrl, supabaseAnonKey);